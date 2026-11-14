import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={styles.footer}>
      {/* Top Clinical Assurance Ribbon */}
      <div style={styles.ribbon}>
        <div className="container" style={styles.ribbonContent}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🛡️</span>
            <div>
              <div style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>
                Certified Clinical Transfusion Standards
              </div>
              <div style={{ color: "#94A3B8", fontSize: "12px" }}>
                Screened for HIV, Hepatitis B/C, Syphilis, and Malaria prior to any clinical release.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span style={styles.assurancePill}>✓ 100% Voluntary Registrations</span>
            <span style={styles.assurancePill}>✓ Unit-Level Barcode Tracking</span>
            <span style={styles.assurancePill}>✓ Zero Cold-Chain Compromise</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container" style={styles.mainContent}>
        <div className="footer-main-grid">
          {/* Brand & Description */}
          <div style={styles.col}>
            <div style={styles.brandTitle}>
              🩸 HEART<span style={{ color: "var(--primary-red)" }}>SYNC</span>
            </div>
            <p style={styles.brandText}>
              Pakistan's enterprise-grade blood donation, blood bank inventory, and hospital coordination platform.
              Bridging emergency trauma rooms and voluntary donors with clinical precision and safety.
            </p>
            <div style={styles.metaBadge}>
              National Health Regulatory Compliant
            </div>
          </div>

          {/* Clinical Portals */}
          <div style={styles.col}>
            <div style={styles.colTitle}>Healthcare Portals</div>
            <ul style={styles.linkList}>
              <li><Link to="/hospital/dashboard" style={styles.link}>Hospital Transfusion Desk</Link></li>
              <li><Link to="/blood-bank/dashboard" style={styles.link}>Blood Bank Inventory Control</Link></li>
              <li><Link to="/admin/dashboard" style={styles.link}>Health Authority Oversight</Link></li>
              <li><Link to="/requests" style={styles.link}>Emergency Hospital Requests</Link></li>
              <li><Link to="/directory" style={styles.link}>Licensed Blood Bank Directory</Link></li>
            </ul>
          </div>

          {/* Public & Donors */}
          <div style={styles.col}>
            <div style={styles.colTitle}>Voluntary Donors</div>
            <ul style={styles.linkList}>
              <li><Link to="/register-donor" style={styles.link}>Become a Registered Donor</Link></li>
              <li><Link to="/donors" style={styles.link}>Find Voluntary Donors</Link></li>
              <li><Link to="/camps" style={styles.link}>Upcoming Blood Donation Camps</Link></li>
              <li><Link to="/about" style={styles.link}>Eligibility & Transfusion Ethics</Link></li>
              <li><Link to="/contact" style={styles.link}>Contact Emergency Dispatch</Link></li>
            </ul>
          </div>

          {/* Regulatory & Contact */}
          <div style={styles.col}>
            <div style={styles.colTitle}>Governance & Compliance</div>
            <ul style={styles.linkList}>
              <li><Link to="/privacy" style={styles.link}>Healthcare Data Privacy</Link></li>
              <li><Link to="/terms" style={styles.link}>Clinical Terms of Service</Link></li>
              <li><Link to="/accessibility" style={styles.link}>Accessibility Standards</Link></li>
              <li style={{ color: "#94A3B8", fontSize: "13px", marginTop: "8px" }}>
                📍 National Transfusion Operations<br />
                📞 24/7 Helpline: [Pending Deployment]<br />
                ✉️ [Email Pending Configuration]
              </li>
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div style={styles.disclaimerBox}>
          <strong>CLINICAL SAFETY DISCLAIMER:</strong> Heart Sync is an enterprise coordination and inventory platform.
          Voluntary donor registration does not establish final medical eligibility. All blood units must be clinically
          screened, cross-matched, and cleared by authorized transfusion medicine specialists before transfusion.
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom-wrap">
          <div>© {new Date().getFullYear()} Heart Sync Platform. All rights reserved. Every Drop Counts.</div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link to="/privacy" style={styles.subLink}>Privacy Policy</Link>
            <Link to="/terms" style={styles.subLink}>Terms of Use</Link>
            <Link to="/accessibility" style={styles.subLink}>Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "var(--dark-navy)",
    color: "#CBD5E1",
    marginTop: "80px",
  },
  ribbon: {
    background: "#0F1E36",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "16px 0",
  },
  ribbonContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  assurancePill: {
    background: "rgba(255,255,255,0.06)",
    color: "#E2E8F0",
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  mainContent: {
    paddingTop: "50px",
    paddingBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr",
    gap: "40px",
    marginBottom: "40px",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  brandTitle: {
    fontSize: "20px",

    fontWeight: "800",
    color: "#fff",
    letterSpacing: "0.5px",
  },
  brandText: {
    fontSize: "13.5px",
    color: "#94A3B8",
    lineHeight: "1.7",
  },
  metaBadge: {
    display: "inline-block",
    background: "rgba(198, 40, 40, 0.15)",
    border: "1px solid rgba(198, 40, 40, 0.3)",
    color: "#FCA5A5",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "4px",
    width: "fit-content",
    marginTop: "6px",
  },
  colTitle: {
    color: "#fff",
    fontSize: "14.5px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  link: {
    color: "#94A3B8",
    fontSize: "13.5px",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  disclaimerBox: {
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 18px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#94A3B8",
    lineHeight: "1.6",
    marginBottom: "30px",
  },
  bottomBar: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    fontSize: "12.5px",
    color: "#64748B",
  },
  subLink: {
    color: "#64748B",
    textDecoration: "none",
  },
};

export default Footer;