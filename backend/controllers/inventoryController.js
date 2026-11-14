import BloodUnit from "../models/BloodUnit.js";
import AuditLog from "../models/AuditLog.js";

// GET INVENTORY UNITS
export const getInventory = async (req, res) => {
  try {
    const { bloodBankId, bloodGroup, component, status } = req.query;
    const filter = {};

    if (bloodBankId) filter.bloodBankId = bloodBankId;
    if (bloodGroup && bloodGroup !== "ALL") filter.bloodGroup = bloodGroup;
    if (component && component !== "ALL") filter.component = component;
    if (status && status !== "ALL") filter.status = status;

    // Blood bank staff only see their own blood bank units
    if (req.user && ["BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(req.user.role) && req.user.organizationId) {
      filter.bloodBankId = req.user.organizationId._id || req.user.organizationId;
    }

    // Auto-expire any units that have passed their expiry date but are still active
    const now = new Date();
    await BloodUnit.updateMany(
      {
        expiryDate: { $lt: now },
        status: { $in: ["AVAILABLE", "RESERVED"] },
      },
      { $set: { status: "EXPIRED" } }
    );

    const units = await BloodUnit.find(filter)
      .populate("bloodBankId", "name city address phone")
      .sort({ expiryDate: 1 });

    res.json(units);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET INVENTORY SUMMARY (Counts grouped by blood group and component)
export const getInventorySummary = async (req, res) => {
  try {
    const filter = { status: "AVAILABLE" };

    if (req.user && ["BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(req.user.role) && req.user.organizationId) {
      filter.bloodBankId = req.user.organizationId._id || req.user.organizationId;
    }

    const units = await BloodUnit.find(filter);

    const summary = {};
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    bloodGroups.forEach((bg) => {
      summary[bg] = {
        totalAvailable: 0,
        components: {
          WHOLE_BLOOD: 0,
          PRBC: 0,
          PLATELETS: 0,
          FFP: 0,
          CRYOPRECIPITATE: 0,
        },
      };
    });

    units.forEach((u) => {
      if (summary[u.bloodGroup]) {
        summary[u.bloodGroup].totalAvailable += 1;
        if (summary[u.bloodGroup].components[u.component] !== undefined) {
          summary[u.bloodGroup].components[u.component] += 1;
        }
      }
    });

    // Also get overall counts (Quarantined, Expired, Allocated)
    const counts = await BloodUnit.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      summary,
      statusCounts: counts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD NEW SCREENED BLOOD UNIT
export const addBloodUnit = async (req, res) => {
  try {
    const {
      unitBarcode,
      bloodBankId,
      bloodGroup,
      component,
      volumeMl,
      collectionDate,
      expiryDate,
      screeningStatus,
      storageLocation,
      donorRefId,
      notes,
    } = req.body;

    const assignedBloodBank =
      bloodBankId || (req.user?.organizationId ? req.user.organizationId._id || req.user.organizationId : null);

    if (!assignedBloodBank || !bloodGroup || !component || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Blood bank, blood group, component, and expiry date are required.",
      });
    }

    const finalBarcode =
      unitBarcode || `HSU-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const existingBarcode = await BloodUnit.findOne({ unitBarcode: finalBarcode });
    if (existingBarcode) {
      return res.status(400).json({ success: false, message: "A unit with this barcode already exists." });
    }

    const unit = await BloodUnit.create({
      unitBarcode: finalBarcode,
      bloodBankId: assignedBloodBank,
      bloodGroup,
      component,
      volumeMl: Number(volumeMl) || 450,
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
      expiryDate: new Date(expiryDate),
      screeningStatus: screeningStatus || "TESTED_NEGATIVE_CLEAR",
      status: "AVAILABLE",
      storageLocation: storageLocation || "Cold Storage Unit 1",
      donorRefId: donorRefId || null,
      notes: notes || "",
    });

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "Staff",
        userRole: req.user?.role || "BLOOD_BANK_STAFF",
        action: "BLOOD_UNIT_ADDED",
        entityType: "BLOOD_UNIT",
        entityId: unit._id.toString(),
        details: { barcode: unit.unitBarcode, bloodGroup: unit.bloodGroup, component: unit.component },
      });
    } catch (e) {}

    res.status(201).json({ success: true, unit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE BLOOD UNIT (Quarantine, Discard, Storage)
export const updateBloodUnit = async (req, res) => {
  try {
    const { status, screeningStatus, storageLocation, notes } = req.body;
    const unit = await BloodUnit.findById(req.params.id);

    if (!unit) return res.status(404).json({ success: false, message: "Blood unit not found." });

    if (status) unit.status = status;
    if (screeningStatus) unit.screeningStatus = screeningStatus;
    if (storageLocation) unit.storageLocation = storageLocation;
    if (notes) unit.notes = notes;

    await unit.save();

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "Staff",
        userRole: req.user?.role || "BLOOD_BANK_STAFF",
        action: `BLOOD_UNIT_UPDATED_${unit.status}`,
        entityType: "BLOOD_UNIT",
        entityId: unit._id.toString(),
        details: { barcode: unit.unitBarcode, newStatus: unit.status },
      });
    } catch (e) {}

    res.json({ success: true, unit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
