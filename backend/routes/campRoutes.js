import express from "express";
import {
  getCamps,
  getSingleCamp,
  createCamp,
  registerForCamp,
} from "../controllers/campController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCamps);
router.get("/:id", getSingleCamp);
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "BLOOD_BANK_ADMIN"),
  createCamp
);
router.post("/:id/register", registerForCamp);

export default router;
