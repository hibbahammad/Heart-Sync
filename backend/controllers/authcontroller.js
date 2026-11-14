import User from "../models/User.js";
import Organization from "../models/Organization.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, organizationId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and password." });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Validate organization if provided
    let assignedOrg = null;
    if (organizationId) {
      const org = await Organization.findById(organizationId);
      if (org) assignedOrg = org._id;
    }

    // Default role to DONOR if not an authorized healthcare role
    const assignedRole = role && [
      "SUPER_ADMIN",
      "HOSPITAL_ADMIN",
      "HOSPITAL_STAFF",
      "BLOOD_BANK_ADMIN",
      "BLOOD_BANK_STAFF",
      "DONOR",
    ].includes(role)
      ? role
      : "DONOR";

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      role: assignedRole,
      organizationId: assignedOrg,
    });

    // Create Audit Log
    try {
      await AuditLog.create({
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        action: "USER_REGISTERED",
        entityType: "USER",
        entityId: user._id.toString(),
        details: { role: user.role },
      });
    } catch (logErr) {
      // non-fatal
    }

    const token = generateToken(user._id);

    // Populate organization details so frontend dashboards receive the facility object immediately upon registration
    const populatedUser = assignedOrg
      ? await User.findById(user._id).populate("organizationId")
      : user;

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      organization: populatedUser.organizationId || null,
      organizationId: user.organizationId || null,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("organizationId");

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status === "SUSPENDED") {
        return res.status(403).json({ success: false, message: "Account has been suspended by administration." });
      }

      const token = generateToken(user._id);

      // Audit login
      try {
        await AuditLog.create({
          userId: user._id,
          userEmail: user.email,
          userRole: user.role,
          action: "USER_LOGIN_SUCCESS",
          entityType: "USER",
          entityId: user._id.toString(),
        });
      } catch (logErr) {}

      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        organization: user.organizationId || null,
        organizationId: user.organizationId?._id || user.organizationId || null,
        token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CURRENT USER PROFILE
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").populate("organizationId");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      organization: user.organizationId || null,
      organizationId: user.organizationId?._id || user.organizationId || null,
      user: {
        ...user.toObject(),
        organization: user.organizationId || null,
        organizationId: user.organizationId?._id || user.organizationId || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// JWT TOKEN GENERATOR
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};