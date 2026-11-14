import mongoose from "mongoose";

const donationCampSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    organizerName: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    targetUnits: {
      type: Number,
      default: 100,
    },
    collectedUnits: {
      type: Number,
      default: 0,
    },
    registeredDonorsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    contactPhone: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

donationCampSchema.index({ city: 1, startDate: 1, status: 1 });

const DonationCamp = mongoose.model("DonationCamp", donationCampSchema);

export default DonationCamp;
