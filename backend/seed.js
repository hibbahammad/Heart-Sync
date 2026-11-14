import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Organization from "./models/Organization.js";
import User from "./models/User.js";
import Donor from "./models/Donor.js";
import BloodRequest from "./models/BloodRequest.js";
import BloodUnit from "./models/BloodUnit.js";
import DonationCamp from "./models/DonationCamp.js";
import AuditLog from "./models/AuditLog.js";

dotenv.config();

const seedData = async () => {
  // Production safety guard: Never allow destructive clearing in production
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL REFUSAL: Database seeding is prohibited in production to protect live clinical records.");
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Heart_sync";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing collections safely
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Donor.deleteMany({});
    await BloodRequest.deleteMany({});
    await BloodUnit.deleteMany({});
    await DonationCamp.deleteMany({});
    await AuditLog.deleteMany({});
    console.log("Cleaned old test records.");

    // 1. Seed Organizations
    const organizations = await Organization.insertMany([
      {
        name: "Shaukat Khanum Regional Blood Bank",
        type: "BLOOD_BANK",
        licenseNumber: "PB-BB-00109",
        city: "Lahore",
        area: "Johar Town",
        address: "7A Block R-3, Johar Town, Lahore",
        phone: "+92 42 35905000",
        email: "bloodbank@shaukatkhanum.org.pk",
        emergencyContact: "+92 42 35905001",
        verificationStatus: "VERIFIED",
        availableComponents: ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP", "CRYOPRECIPITATE"],
      },
      {
        name: "Indus Blood Transfusion Center",
        type: "BLOOD_BANK",
        licenseNumber: "SD-BB-00244",
        city: "Karachi",
        area: "Korangi",
        address: "Crossing, Korangi, Karachi",
        phone: "+92 21 111 111 880",
        email: "bloodcenter@indushospital.org.pk",
        emergencyContact: "+92 21 35112709",
        verificationStatus: "VERIFIED",
        availableComponents: ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP"],
      },
      {
        name: "Pakistan Red Crescent Blood Center",
        type: "BLOOD_BANK",
        licenseNumber: "ICT-BB-00031",
        city: "Islamabad",
        area: "Sector H-8",
        address: "National Headquarters, Sector H-8, Islamabad",
        phone: "+92 51 9250404",
        email: "bloodbank@prcs.org.pk",
        emergencyContact: "+92 51 9250405",
        verificationStatus: "VERIFIED",
        availableComponents: ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP"],
      },
      {
        name: "Mayo Hospital Transfusion Services",
        type: "HOSPITAL",
        licenseNumber: "PB-HOSP-00411",
        city: "Lahore",
        area: "Anarkali",
        address: "Hospital Road, Anarkali, Lahore",
        phone: "+92 42 99211100",
        email: "emergency@mayohospital.punjab.gov.pk",
        emergencyContact: "+92 42 99211105",
        verificationStatus: "VERIFIED",
      },
      {
        name: "Jinnah Postgraduate Medical Centre (JPMC)",
        type: "HOSPITAL",
        licenseNumber: "SD-HOSP-00821",
        city: "Karachi",
        area: "Cantonment",
        address: "Rafiqui Shaheed Road, Karachi",
        phone: "+92 21 99201300",
        email: "clinical@jpmc.edu.pk",
        emergencyContact: "+92 21 99201305",
        verificationStatus: "VERIFIED",
      },
    ]);

    const shaukatBank = organizations[0];
    const indusBank = organizations[1];
    const mayoHospital = organizations[3];

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const superAdminPassword = await bcrypt.hash("admin123", salt);
    const hospitalStaffPassword = await bcrypt.hash("hospital123", salt);
    const bloodBankStaffPassword = await bcrypt.hash("bloodbank123", salt);
    const donorPassword = await bcrypt.hash("donor123", salt);

    await User.insertMany([
      {
        name: "Dr. Ayesha Malik",
        email: "admin@heartsync.org",
        password: superAdminPassword,
        phone: "+92 300 1234567",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
      {
        name: "Dr. Farhan Qureshi",
        email: "hospital@heartsync.org",
        password: hospitalStaffPassword,
        phone: "+92 321 9876543",
        role: "HOSPITAL_STAFF",
        organizationId: mayoHospital._id,
        status: "ACTIVE",
      },
      {
        name: "Zainab Tariq, MLT",
        email: "bloodbank@heartsync.org",
        password: bloodBankStaffPassword,
        phone: "+92 333 4567890",
        role: "BLOOD_BANK_STAFF",
        organizationId: shaukatBank._id,
        status: "ACTIVE",
      },
      {
        name: "Hamza Ahmed",
        email: "donor@heartsync.org",
        password: donorPassword,
        phone: "+92 345 5551234",
        role: "DONOR",
        status: "ACTIVE",
      },
    ]);

    // 3. Seed Donors (Realistic voluntary profiles)
    await Donor.insertMany([
      {
        donorRefId: "HS-D-20101",
        name: "Muhammad Usman",
        email: "usman.donor@example.pk",
        phone: "+92 301 4455667",
        city: "Lahore",
        area: "Gulberg III",
        bloodGroup: "O+",
        available: true,
        screeningStatus: "REGISTERED_VOLUNTARY",
        lastDonationDate: new Date(Date.now() - 120 * 24 * 3600 * 1000),
        preferredCenter: shaukatBank._id,
        medicalDisclaimerAck: true,
        privacyConsent: true,
        totalDonations: 4,
      },
      {
        donorRefId: "HS-D-20102",
        name: "Fatima Noor",
        email: "fatima.noor@example.pk",
        phone: "+92 321 8899001",
        city: "Lahore",
        area: "DHA Phase 5",
        bloodGroup: "A+",
        available: true,
        screeningStatus: "REGISTERED_VOLUNTARY",
        lastDonationDate: new Date(Date.now() - 150 * 24 * 3600 * 1000),
        preferredCenter: shaukatBank._id,
        medicalDisclaimerAck: true,
        privacyConsent: true,
        totalDonations: 2,
      },
      {
        donorRefId: "HS-D-20103",
        name: "Bilal Hassan",
        email: "bilal.hassan@example.pk",
        phone: "+92 333 7788990",
        city: "Karachi",
        area: "Clifton Block 2",
        bloodGroup: "B+",
        available: true,
        screeningStatus: "REGISTERED_VOLUNTARY",
        lastDonationDate: new Date(Date.now() - 100 * 24 * 3600 * 1000),
        preferredCenter: indusBank._id,
        medicalDisclaimerAck: true,
        privacyConsent: true,
        totalDonations: 5,
      },
      {
        donorRefId: "HS-D-20104",
        name: "Mariam Siddiqui",
        email: "mariam.s@example.pk",
        phone: "+92 345 6677889",
        city: "Karachi",
        area: "Gulshan-e-Iqbal",
        bloodGroup: "O-",
        available: true,
        screeningStatus: "REGISTERED_VOLUNTARY",
        lastDonationDate: new Date(Date.now() - 180 * 24 * 3600 * 1000),
        preferredCenter: indusBank._id,
        medicalDisclaimerAck: true,
        privacyConsent: true,
        totalDonations: 3,
      },
      {
        donorRefId: "HS-D-20105",
        name: "Ali Raza",
        email: "ali.raza@example.pk",
        phone: "+92 312 3344556",
        city: "Islamabad",
        area: "F-7/2",
        bloodGroup: "AB+",
        available: true,
        screeningStatus: "REGISTERED_VOLUNTARY",
        lastDonationDate: new Date(Date.now() - 90 * 24 * 3600 * 1000),
        medicalDisclaimerAck: true,
        privacyConsent: true,
        totalDonations: 1,
      },
      {
        donorRefId: "HS-D-20106",
        name: "Sana Tariq",
        email: "sana.tariq@example.pk",
        phone: "+92 300 2233445",
        city: "Rawalpindi",
        area: "Saddar",
        bloodGroup: "A-",
        available: false,
        screeningStatus: "TEMPORARILY_DEFERRED",
        lastDonationDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        medicalDisclaimerAck: true,
        privacyConsent: true,
        totalDonations: 2,
      },
    ]);

    // 4. Seed Screened Blood Units in Blood Banks
    const bloodUnits = [];
    const bGroups = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-"];
    const components = ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP"];

    let barcodeCounter = 101;
    for (const bg of bGroups) {
      for (const comp of components) {
        // Shaukat Khanum units
        const expiryDays = comp === "PLATELETS" ? 5 : comp === "PRBC" ? 35 : comp === "FFP" ? 365 : 28;
        bloodUnits.push({
          unitBarcode: `HSU-2026-${barcodeCounter++}`,
          bloodBankId: shaukatBank._id,
          bloodGroup: bg,
          component: comp,
          volumeMl: comp === "PLATELETS" ? 250 : 450,
          collectionDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          expiryDate: new Date(Date.now() + expiryDays * 24 * 3600 * 1000),
          screeningStatus: "TESTED_NEGATIVE_CLEAR",
          status: "AVAILABLE",
          storageLocation: `Cold Storage A - Shelf ${bg.slice(0, 1)}`,
        });

        // Indus Hospital units
        bloodUnits.push({
          unitBarcode: `HSU-2026-${barcodeCounter++}`,
          bloodBankId: indusBank._id,
          bloodGroup: bg,
          component: comp,
          volumeMl: 450,
          collectionDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          expiryDate: new Date(Date.now() + (expiryDays - 2) * 24 * 3600 * 1000),
          screeningStatus: "TESTED_NEGATIVE_CLEAR",
          status: "AVAILABLE",
          storageLocation: `Cold Room B - Rack 2`,
        });
      }
    }
    await BloodUnit.insertMany(bloodUnits);

    // 5. Seed Hospital Blood Requests
    await BloodRequest.insertMany([
      {
        requestId: "REQ-2026-1001",
        hospitalId: mayoHospital._id,
        hospitalName: "Mayo Hospital Transfusion Services",
        city: "Lahore",
        requesterName: "Dr. Farhan Qureshi",
        contact: "+92 42 99211105",
        patientReference: "PT-MAY-901",
        bloodGroup: "O-",
        component: "PRBC",
        unitsRequired: 2,
        unitsFulfilled: 0,
        urgency: "EMERGENCY_IMMEDIATE",
        requiredByDate: new Date(Date.now() + 6 * 3600 * 1000),
        deliveryLocation: "Trauma ICU Bed 4",
        clinicalNotes: "Acute surgical blood loss. Immediate cross-matched O- PRBC units requested.",
        status: "SUBMITTED",
      },
      {
        requestId: "REQ-2026-1002",
        hospitalId: mayoHospital._id,
        hospitalName: "Mayo Hospital Transfusion Services",
        city: "Lahore",
        requesterName: "Dr. Farhan Qureshi",
        contact: "+92 42 99211105",
        patientReference: "PT-MAY-902",
        bloodGroup: "B+",
        component: "PLATELETS",
        unitsRequired: 4,
        unitsFulfilled: 0,
        urgency: "URGENT_24H",
        requiredByDate: new Date(Date.now() + 18 * 3600 * 1000),
        deliveryLocation: "Oncology Day Care Unit",
        clinicalNotes: "Platelet support for chemotherapy patient experiencing severe thrombocytopenia.",
        status: "UNDER_VERIFICATION",
      },
      {
        requestId: "REQ-2026-1003",
        hospitalId: mayoHospital._id,
        hospitalName: "Mayo Hospital Transfusion Services",
        city: "Lahore",
        requesterName: "Dr. Farhan Qureshi",
        contact: "+92 42 99211105",
        patientReference: "PT-MAY-889",
        bloodGroup: "A+",
        component: "WHOLE_BLOOD",
        unitsRequired: 2,
        unitsFulfilled: 2,
        urgency: "ROUTINE_SCHEDULED",
        requiredByDate: new Date(Date.now() - 24 * 3600 * 1000),
        deliveryLocation: "General Surgery OT 3",
        clinicalNotes: "Elective orthopedic surgery requirements.",
        status: "FULFILLED",
        fulfilledByBloodBank: shaukatBank._id,
      },
    ]);

    // 6. Seed Donation Camps
    await DonationCamp.insertMany([
      {
        title: "Punjab University Life-Saving Blood Drive",
        organizationId: shaukatBank._id,
        organizerName: "Shaukat Khanum Blood Transfusion Team",
        venue: "Punjab University New Campus Student Center",
        city: "Lahore",
        area: "Canal Road",
        startDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
        targetUnits: 250,
        collectedUnits: 0,
        registeredDonorsCount: 84,
        status: "UPCOMING",
        contactPhone: "+92 42 35905000",
        description: "Annual voluntary blood donation drive organized in collaboration with PU Youth Red Crescent Society.",
      },
      {
        title: "Karachi Corporate Health & Blood Donation Camp",
        organizationId: indusBank._id,
        organizerName: "Indus Hospital Outreach Division",
        venue: "Dolmen City Executive Towers Auditorium",
        city: "Karachi",
        area: "Clifton",
        startDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        targetUnits: 180,
        collectedUnits: 0,
        registeredDonorsCount: 42,
        status: "UPCOMING",
        contactPhone: "+92 21 111 111 880",
        description: "Community blood drive supporting pediatric thalassemia and emergency trauma patients.",
      },
      {
        title: "Islamabad Sector F-7 Community Blood Drive",
        organizationId: organizations[2]._id,
        organizerName: "PRCS Community Outreach",
        venue: "F-7 Markaz Community Center Hall",
        city: "Islamabad",
        area: "Sector F-7",
        startDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        endDate: new Date(Date.now() + 11 * 24 * 3600 * 1000),
        targetUnits: 120,
        collectedUnits: 0,
        registeredDonorsCount: 19,
        status: "UPCOMING",
        contactPhone: "+92 51 9250404",
        description: "Voluntary community camp to replenish emergency stocks for capital hospitals.",
      },
    ]);

    // 7. Seed Initial Audit Log
    await AuditLog.create({
      action: "DATABASE_SEEDED",
      entityType: "SYSTEM",
      entityId: "SYSTEM_INIT",
      details: {
        organizationsCount: organizations.length,
        bloodUnitsCount: bloodUnits.length,
        seededAt: new Date(),
      },
    });

    console.log("=================================================");
    console.log("✅ Seed completed successfully!");
    console.log("Credentials for testing:");
    console.log("Super Admin:  admin@heartsync.org / admin123");
    console.log("Hospital:     hospital@heartsync.org / hospital123");
    console.log("Blood Bank:   bloodbank@heartsync.org / bloodbank123");
    console.log("Donor User:   donor@heartsync.org / donor123");
    console.log("=================================================");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedData();
