import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Determine portal link based on user role
  let portalLink = null;
  if (user) {
    if (user.role === "SUPER_ADMIN") {
      portalLink = { to: "/admin/dashboard", label: "Admin Oversight ⚙️" };
    } else if (["HOSPITAL_ADMIN", "HOSPITAL_STAFF"].includes(user.role)) {
      portalLink = { to: "/hospital/dashboard", label: "Hospital Portal 🏥" };
    } else if (["BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(user.role)) {
      portalLink = { to: "/blood-bank/dashboard", label: "Blood Bank Portal 🩸" };
    }
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/donors", label: "Find Donors" },
    { to: "/requests", label: "Blood Requests" },
    { to: "/camps", label: "Donation Camps" },
    { to: "/directory", label: "Directory" },
    { to: "/about", label: "About" },
  ];

  return (
    <header style={styles.header}>
      {/* Top Clinical Triage Bar */}
      <div style={styles.topBar}>
        <div className="container" style={styles.topBarContent}>
          <div style={styles.topBarLeft}>
            <span style={styles.emergencyTag}>Clinical Coordination Desk:</span>
            <span style={styles.emergencyNumber}>[Hotline Pending Configuration]</span>
            <span style={styles.topBarDivider} className="top-bar-subtext">|</span>
            <span style={{ color: "#94A3B8" }} className="top-bar-subtext">Licensed Blood Transfusion & Clinical Coordination Network</span>
          </div>
          <div style={styles.topBarRight}>
            <Link to="/contact" style={styles.topBarLink}>Support</Link>
            <span style={styles.topBarDivider}>•</span>
            <Link to="/privacy" style={styles.topBarLink}>Privacy Protocols</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={styles.navMain}>
        <div className="container" style={styles.navContainer}>
          {/* Brand Logo */}
          <Link to="/" style={styles.logo} onClick={() => setMobileMenuOpen(false)}>
            <div style={styles.logoIconWrap}>
              <span style={{ fontSize: "20px" }}>🩸</span>
            </div>
            <div>
              <div style={styles.logoTitle} className="logo-title-responsive">
                HEART<span style={{ color: "var(--primary-red)" }}>SYNC</span>
              </div>
              <div style={styles.logoSubtitle} className="logo-sub-responsive">BLOOD BANK & HEALTHCARE NETWORK</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-desktop-menu">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...styles.navLink,
                  color: isActive(link.to) ? "var(--primary-red)" : "var(--dark-navy)",
                  fontWeight: isActive(link.to) ? "700" : "500",
                  borderBottom: isActive(link.to) ? "2px solid var(--primary-red)" : "2px solid transparent",
                }}
              >
                {link.label}
              </Link>
            ))}

            {portalLink && (
              <Link
                to={portalLink.to}
                style={{
                  ...styles.navLink,
                  color: "#1E40AF",
                  backgroundColor: "#EFF6FF",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontWeight: "600",
                }}
              >
                {portalLink.label}
              </Link>
            )}
          </nav>

          {/* Action CTAs & Auth */}
          <div style={styles.authArea}>
            {user ? (
              <div style={styles.userProfileWrap}>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userRoleTag}>{user.role.replace("_", " ")}</div>
                </div>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="nav-auth-desktop" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Link to="/login" className="btn btn-outline-navy btn-sm">
                  Sign In
                </Link>
                <Link to="/register-donor" className="btn btn-primary btn-sm">
                  Register as Donor
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="nav-mobile-toggle"
              aria-label={mobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer} className="mobile-drawer-animate">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: isActive(link.to) ? "var(--primary-red)" : "var(--dark-navy)",
                }}
              >
                {link.label}
              </Link>
            ))}
            {portalLink && (
              <Link
                to={portalLink.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#1E40AF",
                  background: "#EFF6FF",
                  padding: "8px 12px",
                  borderRadius: "6px",
                }}
              >
                {portalLink.label}
              </Link>
            )}
            <hr style={{ borderColor: "#E2E8F0" }} />
            {!user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-outline-navy"
                  style={{ width: "100%" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register-donor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  Register as Donor
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="btn btn-outline" style={{ width: "100%" }}>
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  topBar: {
    background: "var(--dark-navy)",
    color: "#CBD5E1",
    fontSize: "12px",
    padding: "6px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  topBarContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  emergencyTag: {
    color: "#F87171",
    fontWeight: "600",
  },
  emergencyNumber: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  topBarDivider: {
    color: "#475569",
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  topBarLink: {
    color: "#94A3B8",
    fontSize: "12px",
    transition: "color 0.2s",
  },
  navMain: {
    background: "#fff",
    borderBottom: "1px solid var(--border-color)",
  },
  navContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    paddingBottom: "12px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
  },
  logoIconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    background: "var(--primary-red-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitle: {
    fontSize: "19px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    color: "var(--dark-navy)",
    lineHeight: "1.2",
  },
  logoSubtitle: {
    fontSize: "9px",
    fontWeight: "700",
    color: "var(--text-muted)",
    letterSpacing: "1px",
  },
  navLink: {
    fontSize: "14.5px",
    padding: "8px 0",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  authArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userProfileWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userInfo: {
    textAlign: "right",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    lineHeight: "1.2",
  },
  userRoleTag: {
    fontSize: "10px",
    color: "var(--primary-red)",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  mobileDrawer: {
    background: "#fff",
    borderTop: "1px solid var(--border-color)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  },
};

export default Navbar;