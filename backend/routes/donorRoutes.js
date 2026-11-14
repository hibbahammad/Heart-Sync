import express from "express";
import {
  addDonor,
  getDonors,
  getSingleDonor,
  updateDonor,
  deleteDonor,
  searchDonors,
} from "../controllers/donorController.js";
import { protect, authorize, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Protected Registration & Retrieval (optionalAuth extracts staff credentials if present)
router.post("/", addDonor);
router.get("/", optionalAuth, getDonors);

// Both /search and /search/filter mapped to searchDonors
router.get("/search", optionalAuth, searchDonors);
router.get("/search/filter", optionalAuth, searchDonors);

// Single donor & operations
router.get("/:id", optionalAuth, getSingleDonor);
router.put("/:id", protect, updateDonor);
router.delete("/:id", protect, authorize("SUPER_ADMIN", "BLOOD_BANK_ADMIN"), deleteDonor);

export default router;