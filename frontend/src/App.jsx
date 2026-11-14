import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

// Public Pages
import Home from "./pages/Home";
import FindDonors from "./pages/FindDonors";
import BloodRequests from "./pages/BloodRequests";
import RegisterDonor from "./pages/RegisterDonor";
import Camps from "./pages/Camps";
import Directory from "./pages/Directory";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Accessibility from "./pages/Accessibility";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Enterprise Portals
import HospitalDashboard from "./pages/HospitalDashboard";
import BloodBankDashboard from "./pages/BloodBankDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Portal Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/donors" element={<FindDonors />} />
          <Route path="/requests" element={<BloodRequests />} />
          <Route path="/register-donor" element={<RegisterDonor />} />
          <Route path="/camps" element={<Camps />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ─── Protected Healthcare Dashboards ─────────────────────────── */}
          <Route
            path="/hospital/dashboard"
            element={
              <PrivateRoute roles={["HOSPITAL_ADMIN", "HOSPITAL_STAFF", "SUPER_ADMIN"]}>
                <HospitalDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/blood-bank/dashboard"
            element={
              <PrivateRoute roles={["BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF", "SUPER_ADMIN"]}>
                <BloodBankDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={["SUPER_ADMIN"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;