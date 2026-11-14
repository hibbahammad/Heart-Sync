import express from "express";
import {
  getAdminMetrics,
  getUsers,
  updateUser,
  getAuditLogs,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("SUPER_ADMIN"));

router.get("/metrics", getAdminMetrics);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.get("/audit-logs", getAuditLogs);

export default router;
