# Heart Sync — Enterprise Blood Bank & Hospital Coordination Platform

Heart Sync is a healthcare platform connecting hospitals, certified blood banks, authorized healthcare personnel, and voluntary blood donors.

---

## 🏥 Architectural Principles & Clinical Distinction

1. **Voluntary Donor Registry:** Provides a matching directory of voluntary donors. Donor contact numbers and personal emails are masked to prevent unauthorized data harvesting.
2. **Emergency Hospital Blood Requests:** Formal requisitions initiated by hospital trauma units specifying clinical urgency, component types (PRBC, Platelets, FFP, Whole Blood), and required units without exposing confidential patient identities.
3. **Screened Blood Inventory:** Certified blood banks maintain unit-level barcode tracking, screening verification (HIV, HBV, HCV, Syphilis, Malaria), and cold-chain monitoring. Units are atomically allocated to prevent double allocation or release of quarantined/expired units.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Running on `127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Database Seeding
To populate realistic demo hospitals, blood banks, screened inventory units, and demo accounts:
```bash
cd backend
npm run seed
```

### 2. Running Locally
Simply double-click `start.bat` in the root folder, or run both servers manually:

```bash
# Terminal 1 - Backend
cd backend
npm run start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Frontend App:** [http://localhost:5173/](http://localhost:5173/)
- **Backend API:** [http://localhost:5000/](http://localhost:5000/)

---

## 🔑 Role-Based Access Control & Demo Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@heartsync.org` | `admin123` | `/admin/dashboard` |
| **Hospital Staff** | `hospital@heartsync.org` | `hospital123` | `/hospital/dashboard` |
| **Blood Bank Staff** | `bloodbank@heartsync.org` | `bloodbank123` | `/blood-bank/dashboard` |
| **Voluntary Donor** | `donor@heartsync.org` | `donor123` | `/donors` |

*(Quick 1-click login buttons are also available on the Login page).*

---

## 🛡️ Key Features

- **Public Website:** Home, Voluntary Donor Enrollment with consent check, Masked Donor Search, Hospital Emergency Requests, Donation Camps, Accredited Facilities Directory, Terms, Privacy Policy.
- **Hospital Portal:** Requisition wizard, clinical urgency tags (`EMERGENCY_IMMEDIATE`, `URGENT_24H`), fulfillment tracking, allocated unit barcodes view.
- **Blood Bank Portal:** Unit-level barcode tracking, stock summary by blood group & component, quarantine/release toggles, and atomic requisition fulfillment.
- **Super Admin Portal:** System KPIs, healthcare facility onboarding, user role governance, and immutable clinical audit logs.
