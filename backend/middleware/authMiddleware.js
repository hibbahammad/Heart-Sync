import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id)
        .select("-password")
        .populate("organizationId");

      if (!req.user) {
        return res.status(401).json({ success: false, message: "User account no longer exists." });
      }

      if (req.user.status === "SUSPENDED") {
        return res.status(403).json({ success: false, message: "Account is suspended. Contact administrator." });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Authentication failed. Token invalid or expired." });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. Authentication token required." });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : "Unauthenticated"}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

/**
 * Optional authentication middleware:
 * Extracts and verifies token if present to identify authenticated staff/users,
 * but allows unauthenticated visitors to proceed with req.user undefined.
 */
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const match = req.headers.authorization.match(/^Bearer\s+(.+)$/i);
      const token = match ? match[1].trim() : null;

      if (token && token !== "null" && token !== "undefined") {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
          .select("-password")
          .populate("organizationId");

        if (user && user.status !== "SUSPENDED") {
          req.user = user;
        }
      }
    } catch (error) {
      // Invalid/expired token: proceed without req.user (treated as public guest)
      req.user = undefined;
    }
  }
  next();
};

export default protect;
