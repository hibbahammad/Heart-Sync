import DonationCamp from "../models/DonationCamp.js";
import AuditLog from "../models/AuditLog.js";

// GET CAMPS
export const getCamps = async (req, res) => {
  try {
    const { status, city } = req.query;
    const filter = {};

    if (status && status !== "ALL") filter.status = status;
    if (city && city.trim() !== "") filter.city = { $regex: city.trim(), $options: "i" };

    const camps = await DonationCamp.find(filter)
      .populate("organizationId", "name phone city")
      .sort({ startDate: 1 });

    res.json(camps);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE CAMP
export const getSingleCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id).populate("organizationId");
    if (!camp) return res.status(404).json({ success: false, message: "Donation camp not found." });
    res.json(camp);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE CAMP
export const createCamp = async (req, res) => {
  try {
    const {
      title,
      organizerName,
      venue,
      city,
      area,
      startDate,
      endDate,
      targetUnits,
      contactPhone,
      description,
      organizationId,
    } = req.body;

    if (!title || !venue || !city || !startDate || !endDate || !contactPhone) {
      return res.status(400).json({ success: false, message: "Required camp details are missing." });
    }

    const assignedOrg =
      organizationId || (req.user?.organizationId ? req.user.organizationId._id || req.user.organizationId : null);

    const camp = await DonationCamp.create({
      title: title.trim(),
      organizerName: organizerName || "Heart Sync Coordination",
      venue: venue.trim(),
      city: city.trim(),
      area: area ? area.trim() : "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetUnits: Number(targetUnits) || 100,
      contactPhone: contactPhone.trim(),
      description: description || "",
      organizationId: assignedOrg,
      status: "UPCOMING",
    });

    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || "Admin",
        userRole: req.user?.role || "ADMIN",
        action: "CAMP_CREATED",
        entityType: "CAMP",
        entityId: camp._id.toString(),
        details: { title: camp.title, city: camp.city },
      });
    } catch (e) {}

    res.status(201).json({ success: true, camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REGISTER FOR CAMP (Public or authenticated)
export const registerForCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: "Camp not found." });

    camp.registeredDonorsCount = (camp.registeredDonorsCount || 0) + 1;
    await camp.save();

    res.json({
      success: true,
      message: "Successfully registered for this blood donation camp! We look forward to seeing you.",
      registeredCount: camp.registeredDonorsCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
