import Organization from "../models/Organization.js";
import AuditLog from "../models/AuditLog.js";

// GET ORGANIZATIONS (Public directory: returns verified ones)
export const getOrganizations = async (req, res) => {
  try {
    const { type, city, search } = req.query;
    const filter = {};

    // If not super admin, only return verified organizations
    const isSuperAdmin = req.user && req.user.role === "SUPER_ADMIN";
    if (!isSuperAdmin) {
      filter.verificationStatus = "VERIFIED";
    }

    if (type && type !== "ALL") filter.type = type;
    if (city && city.trim() !== "") filter.city = { $regex: city.trim(), $options: "i" };
    if (search && search.trim() !== "") filter.name = { $regex: search.trim(), $options: "i" };

    const organizations = await Organization.find(filter).sort({ name: 1 });
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE ORGANIZATION
export const getSingleOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) return res.status(404).json({ success: false, message: "Organization not found." });
    res.json(organization);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE ORGANIZATION
export const createOrganization = async (req, res) => {
  try {
    const {
      name,
      type,
      licenseNumber,
      city,
      area,
      address,
      phone,
      email,
      emergencyContact,
      availableComponents,
    } = req.body;

    if (!name || !type || !licenseNumber || !city || !phone || !email) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    const existing = await Organization.findOne({ licenseNumber: licenseNumber.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An organization with this registration/license number already exists.",
      });
    }

    const organization = await Organization.create({
      name: name.trim(),
      type,
      licenseNumber: licenseNumber.trim(),
      city: city.trim(),
      area: area ? area.trim() : "",
      address: address ? address.trim() : "",
      phone: phone.trim(),
      email: email.trim(),
      emergencyContact: emergencyContact || phone,
      availableComponents: availableComponents || ["WHOLE_BLOOD", "PRBC"],
      verificationStatus: req.user?.role === "SUPER_ADMIN" ? "VERIFIED" : "PENDING",
    });

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "System",
        userRole: req.user?.role || "ADMIN",
        action: "ORGANIZATION_CREATED",
        entityType: "ORGANIZATION",
        entityId: organization._id.toString(),
        details: { name: organization.name, type: organization.type },
      });
    } catch (e) {}

    res.status(201).json({ success: true, organization });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE ORGANIZATION STATUS (Super Admin only)
export const updateOrganizationStatus = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) return res.status(404).json({ success: false, message: "Organization not found." });

    organization.verificationStatus = verificationStatus;
    await organization.save();

    res.json({ success: true, organization });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
