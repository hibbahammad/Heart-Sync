import mongoose from "mongoose";

const bloodUnitSchema = new mongoose.Schema(
  {
    unitBarcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      index: true,
    },
    component: {
      type: String,
      required: true,
      enum: ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP", "CRYOPRECIPITATE"],
      index: true,
    },
    volumeMl: {
      type: Number,
      required: true,
      default: 450,
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    screeningStatus: {
      type: String,
      enum: [
        "TESTED_NEGATIVE_CLEAR",
        "SCREENING_PENDING",
        "QUARANTINED",
        "DISCARDED",
      ],
      default: "TESTED_NEGATIVE_CLEAR",
    },
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "RESERVED",
        "ALLOCATED",
        "TRANSFERRED",
        "EXPIRED",
        "DISCARDED",
      ],
      default: "AVAILABLE",
      index: true,
    },
    storageLocation: {
      type: String,
      default: "Cold Storage Unit 1",
    },
    allocatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      default: null,
    },
    donorRefId: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

bloodUnitSchema.index({ bloodBankId: 1, bloodGroup: 1, component: 1, status: 1 });
bloodUnitSchema.index({ expiryDate: 1, status: 1 });

const BloodUnit = mongoose.model("BloodUnit", bloodUnitSchema);

export default BloodUnit;
