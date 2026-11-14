import { Link } from "react-router-dom";

function About() {
  return (
    <div style={{ minHeight: "85vh", paddingBottom: "70px" }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <span className="badge badge-danger">MISSION &amp; CLINICAL ETHICS</span>
          <h1 style={styles.headerTitle}>About Heart Sync Healthcare Network</h1>
          <p style={styles.headerSub}>
            Standardizing safe voluntary blood donation, cold-chain inventory oversight, and hospital emergency dispatch.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "40px", maxWidth: "960px" }}>
        <div className="card" style={{ padding: "36px", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--dark-navy)", marginBottom: "14px" }}>
            Our Medical Mission
          </h2>
          <p style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: "1.8", marginBottom: "16px" }}>
            Heart Sync was established to solve one of healthcare's most critical emergency bottlenecks:
            the dangerous time lag between trauma injury/surgical hemorrhage and blood unit transfusion.
            In conventional setups, families are desperately sent out into the streets to seek replacement donors
            during life-and-death crises.
          </p>
          <p style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: "1.8", marginBottom: "20px" }}>
            Our platform modernizes this paradigm by operating a centralized, digital coordination architecture that connects
            accredited blood transfusion banks with hospital emergency rooms, voluntary donors, and mobile collection camps.
          </p>

          <div className="grid-cols-3" style={{ marginTop: "30px" }}>
            <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>💉</div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "6px" }}>100% Voluntary</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>We strictly support voluntary non-remunerated blood donation in line with WHO ethical standards.</p>
            </div>

            <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🧪</div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "6px" }}>Clinical Testing</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No blood unit is released without complete screening for transfusion-transmissible infections (TTIs).</p>
            </div>

            <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔒</div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "6px" }}>Patient Privacy</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Strict clinical anonymity ensures donor phone numbers and patient identities are never publicly exposed.</p>
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer Box */}
        <div className="medical-alert-banner">
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <div>
            <strong>Transfusion Medicine Governance:</strong> Heart Sync is an administrative coordination and inventory tracking software.
            It does not independently perform clinical diagnoses or cross-match testing. Compatibility determinations, patient vitals,
            and final transfusion authorizations must be carried out by qualified medical doctors and laboratory technologists.
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link to="/register-donor" className="btn btn-primary" style={{ padding: "12px 28px" }}>
            Join as a Voluntary Donor Today →
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    background: "linear-gradient(135deg, #172B4D 0%, #0F1E36 100%)",
    color: "#fff",
    padding: "50px 0 40px",
  },
  headerTitle: {
    fontSize: "32px",
    fontWeight: "800",
    marginTop: "8px",
    marginBottom: "8px",
  },
  headerSub: {
    fontSize: "14.5px",
    color: "#CBD5E1",
    maxWidth: "680px",
    lineHeight: "1.6",
  },
};

export default About;
