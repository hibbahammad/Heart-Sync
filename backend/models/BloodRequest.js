import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    patientReference: {
      type: String,
      default: function () {
        return `PT-${Math.floor(1000 + Math.random() * 9000)}`;
      },
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      index: true,
    },
    component: {
      type: String,
      enum: ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP", "CRYOPRECIPITATE"],
      default: "WHOLE_BLOOD",
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitsFulfilled: {
      type: Number,
      default: 0,
    },
    urgency: {
      type: String,
      enum: ["EMERGENCY_IMMEDIATE", "URGENT_24H", "ROUTINE_SCHEDULED"],
      default: "URGENT_24H",
      index: true,
    },
    requiredByDate: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    deliveryLocation: {
      type: String,
      default: "Hospital Emergency Blood Bank Desk",
    },
    clinicalNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_VERIFICATION",
        "ACCEPTED",
        "PARTIALLY_FULFILLED",
        "FULFILLED",
        "REJECTED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "SUBMITTED",
      index: true,
    },
    fulfilledByBloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    allocatedUnits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BloodUnit",
      },
    ],
  },
  {
    timestamps: true,
  }
);

bloodRequestSchema.pre("save", function (next) {
  if (!this.requestId) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.requestId = `REQ-${new Date().getFullYear()}-${randomSuffix}`;
  }
  next();
});

bloodRequestSchema.index({ hospitalId: 1, status: 1 });
bloodRequestSchema.index({ city: 1, bloodGroup: 1, status: 1 });

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

export default BloodRequest;
