import express from "express";
import {
  getOrganizations,
  getSingleOrganization,
  createOrganization,
  updateOrganizationStatus,
} from "../controllers/organizationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getOrganizations);
router.get("/:id", getSingleOrganization);
router.post("/", protect, authorize("SUPER_ADMIN"), createOrganization);
router.put("/:id/status", protect, authorize("SUPER_ADMIN"), updateOrganizationStatus);

export default router;
