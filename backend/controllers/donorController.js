import Donor from "../models/Donor.js";
import AuditLog from "../models/AuditLog.js";

// Mask phone and email helper for privacy protection
const maskPhone = (phone) => {
  if (!phone || phone.length < 5) return "••••••••••";
  const start = phone.slice(0, 4);
  const end = phone.slice(-2);
  return `${start} •••• ${end}`;
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "•••••@••••";
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}••••@${domain}`;
};

// ADD / REGISTER DONOR
export const addDonor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      area,
      bloodGroup,
      dob,
      lastDonationDate,
      preferredCenter,
      preferredContactMethod,
      medicalDisclaimerAck,
      privacyConsent,
      available,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !city || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, city, and blood group are required fields.",
      });
    }

    // Check duplicate active donor by email or phone
    const existingDonor = await Donor.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
    });

    if (existingDonor) {
      return res.status(400).json({
        success: false,
        message: "A donor with this email or phone number is already registered in our system.",
      });
    }

    const donor = await Donor.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      city: city.trim(),
      area: area ? area.trim() : "",
      bloodGroup,
      dob: dob ? new Date(dob) : null,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      preferredCenter: preferredCenter || null,
      preferredContactMethod: preferredContactMethod || "PHONE",
      medicalDisclaimerAck: Boolean(medicalDisclaimerAck),
      privacyConsent: Boolean(privacyConsent),
      available: available !== undefined ? Boolean(available) : true,
      screeningStatus: "REGISTERED_VOLUNTARY",
    });

    try {
      await AuditLog.create({
        action: "DONOR_REGISTERED",
        entityType: "DONOR",
        entityId: donor._id.toString(),
        details: { city: donor.city, bloodGroup: donor.bloodGroup },
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: "Donor registration submitted successfully. Clinical eligibility will be evaluated at the donation center.",
      donor: {
        _id: donor._id,
        donorRefId: donor.donorRefId,
        name: donor.name,
        city: donor.city,
        area: donor.area,
        bloodGroup: donor.bloodGroup,
        available: donor.available,
        screeningStatus: donor.screeningStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL DONORS (Public view: privacy masked)
export const getDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 }).limit(100);

    const isAuthorizedHealthcare =
      req.user &&
      ["SUPER_ADMIN", "HOSPITAL_ADMIN", "HOSPITAL_STAFF", "BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(
        req.user.role
      );

    const sanitizedDonors = donors.map((d) => ({
      _id: d._id,
      donorRefId: d.donorRefId || `HS-D-${d._id.toString().slice(-4)}`,
      name: d.name,
      city: d.city,
      area: d.area,
      bloodGroup: d.bloodGroup,
      available: d.available,
      screeningStatus: d.screeningStatus,
      lastDonationDate: d.lastDonationDate,
      totalDonations: d.totalDonations,
      // Privacy protection: raw phone & email only for authorized staff
      phone: isAuthorizedHealthcare ? d.phone : maskPhone(d.phone),
      email: isAuthorizedHealthcare ? d.email : maskEmail(d.email),
      isMasked: !isAuthorizedHealthcare,
    }));

    res.json(sanitizedDonors);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SEARCH DONORS (Handles case-insensitivity & URL query parameters)
export const searchDonors = async (req, res) => {
  try {
    const { city, bloodGroup } = req.query;
    const filter = {};

    if (city && city.trim() !== "") {
      filter.city = { $regex: city.trim(), $options: "i" };
    }

    if (bloodGroup && bloodGroup.trim() !== "") {
      filter.bloodGroup = { $regex: `^${bloodGroup.trim()}$`, $options: "i" };
    }

    const donors = await Donor.find(filter).sort({ createdAt: -1 }).limit(100);

    const isAuthorizedHealthcare =
      req.user &&
      ["SUPER_ADMIN", "HOSPITAL_ADMIN", "HOSPITAL_STAFF", "BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(
        req.user.role
      );

    const sanitized = donors.map((d) => ({
      _id: d._id,
      donorRefId: d.donorRefId || `HS-D-${d._id.toString().slice(-4)}`,
      name: d.name,
      city: d.city,
      area: d.area,
      bloodGroup: d.bloodGroup,
      available: d.available,
      screeningStatus: d.screeningStatus,
      lastDonationDate: d.lastDonationDate,
      totalDonations: d.totalDonations,
      phone: isAuthorizedHealthcare ? d.phone : maskPhone(d.phone),
      email: isAuthorizedHealthcare ? d.email : maskEmail(d.email),
      isMasked: !isAuthorizedHealthcare,
    }));

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SINGLE DONOR
export const getSingleDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: "Donor record not found." });

    const isAuthorized =
      req.user &&
      ["SUPER_ADMIN", "HOSPITAL_ADMIN", "HOSPITAL_STAFF", "BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(
        req.user.role
      );

    res.json({
      _id: donor._id,
      donorRefId: donor.donorRefId,
      name: donor.name,
      city: donor.city,
      area: donor.area,
      bloodGroup: donor.bloodGroup,
      available: donor.available,
      screeningStatus: donor.screeningStatus,
      lastDonationDate: donor.lastDonationDate,
      totalDonations: donor.totalDonations,
      phone: isAuthorized ? donor.phone : maskPhone(donor.phone),
      email: isAuthorized ? donor.email : maskEmail(donor.email),
      isMasked: !isAuthorized,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE DONOR (field-whitelisted for safety)
export const updateDonor = async (req, res) => {
  try {
    // Only allow safe, non-clinical fields to be updated via this endpoint
    const allowed = [
      "name", "phone", "city", "area", "available",
      "lastDonationDate", "preferredCenter", "preferredContactMethod", "notes",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided for update." });
    }

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!donor) return res.status(404).json({ success: false, message: "Donor record not found." });
    res.json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE DONOR
export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: "Donor record not found." });
    res.json({ success: true, message: "Donor profile deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};