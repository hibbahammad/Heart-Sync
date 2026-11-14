import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Donor from "../models/Donor.js";
import BloodRequest from "../models/BloodRequest.js";
import BloodUnit from "../models/BloodUnit.js";
import DonationCamp from "../models/DonationCamp.js";
import AuditLog from "../models/AuditLog.js";

// GET SYSTEM-WIDE METRICS
export const getAdminMetrics = async (req, res) => {
  try {
    const [
      donorsCount,
      requestsCount,
      urgentRequestsCount,
      availableUnitsCount,
      hospitalsCount,
      bloodBanksCount,
      campsCount,
      recentLogs,
    ] = await Promise.all([
      Donor.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ urgency: "EMERGENCY_IMMEDIATE", status: { $ne: "FULFILLED" } }),
      BloodUnit.countDocuments({ status: "AVAILABLE" }),
      Organization.countDocuments({ type: "HOSPITAL" }),
      Organization.countDocuments({ type: "BLOOD_BANK" }),
      DonationCamp.countDocuments({ status: "UPCOMING" }),
      AuditLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    // Group available units by blood group
    const inventoryByGroup = await BloodUnit.aggregate([
      { $match: { status: "AVAILABLE" } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
    ]);

    // Group requests by status
    const requestsByStatus = await BloodRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      metrics: {
        donorsCount,
        requestsCount,
        urgentRequestsCount,
        availableUnitsCount,
        hospitalsCount,
        bloodBanksCount,
        campsCount,
        inventoryByGroup,
        requestsByStatus,
        recentLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("organizationId", "name type city")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE USER ROLE & STATUS
export const updateUser = async (req, res) => {
  try {
    const { role, status, organizationId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (role) user.role = role;
    if (status) user.status = status;
    if (organizationId !== undefined) user.organizationId = organizationId || null;

    await user.save();

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "Admin",
        userRole: req.user?.role || "SUPER_ADMIN",
        action: "USER_UPDATED_BY_ADMIN",
        entityType: "USER",
        entityId: user._id.toString(),
        details: { targetEmail: user.email, newRole: user.role, newStatus: user.status },
      });
    } catch (e) {}

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET AUDIT LOGS
export const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
