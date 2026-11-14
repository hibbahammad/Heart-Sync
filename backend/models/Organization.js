import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["HOSPITAL", "BLOOD_BANK", "DONATION_CENTER"],
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    emergencyContact: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "VERIFIED",
    },
    operatingHours: {
      type: String,
      default: "24/7 Emergency Service",
    },
    availableComponents: [
      {
        type: String,
        enum: ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP", "CRYOPRECIPITATE"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ city: 1, type: 1, verificationStatus: 1 });

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
