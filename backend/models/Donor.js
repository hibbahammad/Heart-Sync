import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    donorRefId: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
      default: "",
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    available: {
      type: Boolean,
      default: true,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    preferredCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    preferredContactMethod: {
      type: String,
      enum: ["PHONE", "SMS", "WHATSAPP", "EMAIL"],
      default: "PHONE",
    },
    medicalDisclaimerAck: {
      type: Boolean,
      required: true,
      default: false,
    },
    privacyConsent: {
      type: Boolean,
      required: true,
      default: false,
    },
    screeningStatus: {
      type: String,
      enum: [
        "REGISTERED_VOLUNTARY",
        "ELIGIBLE_VERIFIED",
        "TEMPORARILY_DEFERRED",
        "INELIGIBLE",
      ],
      default: "REGISTERED_VOLUNTARY",
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

donorSchema.index({ city: 1, bloodGroup: 1, available: 1 });
donorSchema.index({ email: 1 });

// Helper to auto-generate donorRefId if missing
donorSchema.pre("save", function (next) {
  if (!this.donorRefId) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    this.donorRefId = `HS-D-${randomSuffix}`;
  }
  next();
});

const Donor = mongoose.model("Donor", donorSchema);

export default Donor;