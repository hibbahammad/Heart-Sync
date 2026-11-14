import express from "express";
import {
  createRequest,
  getRequests,
  getSingleRequest,
  updateRequestStatus,
  fulfillRequest,
} from "../controllers/requestController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getSingleRequest);
router.put("/:id/status", protect, updateRequestStatus);
router.post(
  "/:id/fulfill",
  protect,
  authorize("SUPER_ADMIN", "BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"),
  fulfillRequest
);

export default router;