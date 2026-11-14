import express from "express";
import {
  getInventory,
  getInventorySummary,
  addBloodUnit,
  updateBloodUnit,
} from "../controllers/inventoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getInventory);
router.get("/summary", protect, getInventorySummary);
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"),
  addBloodUnit
);
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"),
  updateBloodUnit
);

export default router;
