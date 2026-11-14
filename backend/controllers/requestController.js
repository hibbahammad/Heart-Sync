import BloodRequest from "../models/BloodRequest.js";
import BloodUnit from "../models/BloodUnit.js";
import AuditLog from "../models/AuditLog.js";

// CREATE BLOOD REQUEST
export const createRequest = async (req, res) => {
  try {
    const {
      patientName, // for backward compatibility
      hospital, // for backward compatibility
      hospitalName,
      city,
      requesterName,
      contact,
      bloodGroup,
      component,
      unitsRequired,
      urgency,
      requiredByDate,
      deliveryLocation,
      clinicalNotes,
      message,
    } = req.body;

    const finalHospitalName = hospitalName || hospital || "General Hospital";
    const finalRequesterName = requesterName || patientName || "Authorized Clinical Requester";

    if (!finalHospitalName || !city || !contact || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Hospital name, city, contact, and blood group are mandatory.",
      });
    }

    const hospitalId = req.user?.organizationId ? req.user.organizationId._id || req.user.organizationId : null;

    const request = await BloodRequest.create({
      hospitalId,
      hospitalName: finalHospitalName.trim(),
      city: city.trim(),
      requesterName: finalRequesterName.trim(),
      contact: contact.trim(),
      bloodGroup,
      component: component || "WHOLE_BLOOD",
      unitsRequired: Number(unitsRequired) || 1,
      urgency: urgency || "URGENT_24H",
      requiredByDate: requiredByDate ? new Date(requiredByDate) : new Date(Date.now() + 24 * 3600 * 1000),
      deliveryLocation: deliveryLocation || `${finalHospitalName} Emergency Desk`,
      clinicalNotes: clinicalNotes || message || "",
      status: "SUBMITTED",
    });

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "Hospital Requester",
        userRole: req.user?.role || "HOSPITAL_STAFF",
        action: "BLOOD_REQUEST_SUBMITTED",
        entityType: "BLOOD_REQUEST",
        entityId: request._id.toString(),
        details: { requestId: request.requestId, units: request.unitsRequired, bloodGroup: request.bloodGroup },
      });
    } catch (e) {}

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL REQUESTS (With filters)
export const getRequests = async (req, res) => {
  try {
    const { status, bloodGroup, city, urgency, hospitalId } = req.query;
    const filter = {};

    if (status && status !== "ALL") filter.status = status;
    if (bloodGroup && bloodGroup !== "ALL") filter.bloodGroup = bloodGroup;
    if (urgency && urgency !== "ALL") filter.urgency = urgency;
    if (city && city.trim() !== "") filter.city = { $regex: city.trim(), $options: "i" };

    // If hospital staff, scope to their hospital
    if (req.user && ["HOSPITAL_ADMIN", "HOSPITAL_STAFF"].includes(req.user.role) && req.user.organizationId) {
      const orgId = req.user.organizationId._id || req.user.organizationId;
      filter.hospitalId = orgId;
    } else if (hospitalId) {
      filter.hospitalId = hospitalId;
    }

    const requests = await BloodRequest.find(filter)
      .populate("hospitalId", "name phone address")
      .populate("fulfilledByBloodBank", "name phone emergencyContact")
      .populate("allocatedUnits", "unitBarcode bloodGroup component expiryDate screeningStatus")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE REQUEST
export const getSingleRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate("hospitalId")
      .populate("fulfilledByBloodBank")
      .populate("allocatedUnits");

    if (!request) return res.status(404).json({ success: false, message: "Blood request not found." });
    res.json(request);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE STATUS (Verification, Acceptance, Cancellation)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, clinicalNotes } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: "Request not found." });

    const validStatuses = [
      "DRAFT",
      "SUBMITTED",
      "UNDER_VERIFICATION",
      "ACCEPTED",
      "PARTIALLY_FULFILLED",
      "FULFILLED",
      "REJECTED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid request status." });
    }

    request.status = status;
    if (clinicalNotes) request.clinicalNotes = clinicalNotes;
    await request.save();

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "System",
        userRole: req.user?.role || "STAFF",
        action: `REQUEST_STATUS_${status}`,
        entityType: "BLOOD_REQUEST",
        entityId: request._id.toString(),
        details: { requestId: request.requestId, newStatus: status },
      });
    } catch (e) {}

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// FULFILL BLOOD REQUEST (Allocate screened blood units — compensating-transaction safe)
export const fulfillRequest = async (req, res) => {
  try {
    const { unitIds, bloodBankId } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: "Blood request not found." });

    if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      return res.status(400).json({ success: false, message: "At least one blood unit must be selected for allocation." });
    }

    // Deduplicate unit IDs to prevent double-counting
    const uniqueUnitIds = [...new Set(unitIds.map(String))];

    // Safety check: ensure units are tested negative, available, and not expired
    const units = await BloodUnit.find({ _id: { $in: uniqueUnitIds } });

    if (units.length !== uniqueUnitIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected blood units could not be found. Please refresh and try again.",
      });
    }

    for (const unit of units) {
      if (unit.status !== "AVAILABLE") {
        return res.status(400).json({
          success: false,
          message: `Clinical Safety Violation: Unit [${unit.unitBarcode}] is currently ${unit.status} and cannot be allocated.`,
        });
      }
      if (unit.screeningStatus !== "TESTED_NEGATIVE_CLEAR") {
        return res.status(400).json({
          success: false,
          message: `Clinical Safety Violation: Unit [${unit.unitBarcode}] has screening status '${unit.screeningStatus}'. Only fully screened negative units can be released.`,
        });
      }
      if (new Date(unit.expiryDate) < new Date()) {
        return res.status(400).json({
          success: false,
          message: `Clinical Safety Violation: Unit [${unit.unitBarcode}] expired on ${new Date(unit.expiryDate).toLocaleDateString()}. Expired units cannot be released.`,
        });
      }
    }

    // Step 1: Mark units ALLOCATED (compensating step — rollback if step 2 fails)
    await BloodUnit.updateMany(
      { _id: { $in: uniqueUnitIds }, status: "AVAILABLE" }, // re-check status atomically at DB level
      { $set: { status: "ALLOCATED", allocatedRequestId: request._id } }
    );

    // Verify all units were actually updated (guard against race conditions)
    const updatedUnits = await BloodUnit.find({ _id: { $in: uniqueUnitIds }, status: "ALLOCATED" });
    if (updatedUnits.length !== uniqueUnitIds.length) {
      // Rollback: some units changed status between our check and update (race condition)
      const successfulIds = updatedUnits.map((u) => u._id.toString());
      if (successfulIds.length > 0) {
        await BloodUnit.updateMany(
          { _id: { $in: successfulIds }, allocatedRequestId: request._id },
          { $set: { status: "AVAILABLE", allocatedRequestId: null } }
        );
      }
      return res.status(409).json({
        success: false,
        message: "Allocation conflict: one or more units were modified by another operation. Please refresh and try again.",
      });
    }

    // Step 2: Update the request record — rollback units if this fails
    try {
      const totalFulfilled = (request.unitsFulfilled || 0) + uniqueUnitIds.length;
      request.unitsFulfilled = totalFulfilled;
      request.allocatedUnits = [...(request.allocatedUnits || []), ...uniqueUnitIds];
      request.status = totalFulfilled >= request.unitsRequired ? "FULFILLED" : "PARTIALLY_FULFILLED";

      if (bloodBankId) {
        request.fulfilledByBloodBank = bloodBankId;
      } else if (req.user?.organizationId) {
        request.fulfilledByBloodBank = req.user.organizationId._id || req.user.organizationId;
      }

      await request.save();
    } catch (saveError) {
      // Compensating rollback: revert unit allocations
      await BloodUnit.updateMany(
        { _id: { $in: uniqueUnitIds }, allocatedRequestId: request._id },
        { $set: { status: "AVAILABLE", allocatedRequestId: null } }
      );
      throw new Error(`Request update failed. Units have been rolled back to AVAILABLE. Original error: ${saveError.message}`);
    }

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "Blood Bank Staff",
        userRole: req.user?.role || "BLOOD_BANK_STAFF",
        action: "REQUEST_UNITS_ALLOCATED",
        entityType: "BLOOD_REQUEST",
        entityId: request._id.toString(),
        details: {
          requestId: request.requestId,
          unitsAllocated: uniqueUnitIds.length,
          newStatus: request.status,
        },
      });
    } catch (e) {}

    res.json({
      success: true,
      message: `Successfully allocated ${uniqueUnitIds.length} unit(s) to ${request.requestId}.`,
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};