import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCamps, registerForCamp } from "../api/campApi";
import { getOrganizations } from "../api/organizationApi";

function Home() {
  const [metrics, setMetrics] = useState({
    donorsCount: 1420,
    availableUnits: 156,
    hospitalsCount: 42,
    campsCount: 8,
  });
  const [camps, setCamps] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [faqOpen, setFaqOpen] = useState(null);
  const [campSuccessMsg, setCampSuccessMsg] = useState("");

  useEffect(() => {
    // Fetch upcoming camps (safe public endpoint)
    getCamps({ status: "UPCOMING" })
      .then((data) => {
        setCamps(data.slice(0, 3));
        if (data && data.length) {
          setMetrics((prev) => ({ ...prev, campsCount: Math.max(prev.campsCount, data.length) }));
        }
      })
      .catch(() => {});

    // Fetch verified blood banks (safe public endpoint)
    getOrganizations({ type: "BLOOD_BANK" })
      .then((data) => setOrganizations(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const handleCampRegister = async (campId) => {
    try {
      const res = await registerForCamp(campId);
      setCampSuccessMsg(res.message || "Registration recorded successfully!");
      setTimeout(() => setCampSuccessMsg(""), 4000);
      // Refresh camps list
      const updated = await getCamps({ status: "UPCOMING" });
      setCamps(updated.slice(0, 3));
    } catch (e) {
      alert("Registration failed. Please try again.");
    }
  };

  const bloodGroupCompatibility = [
    { group: "O-", canGive: "Everyone (Universal Red Cell Donor)", canReceive: "O- Only" },
    { group: "O+", canGive: "O+, A+, B+, AB+", canReceive: "O+, O-" },
    { group: "A-", canGive: "A-, A+, AB-, AB+", canReceive: "A-, O-" },
    { group: "A+", canGive: "A+, AB+", canReceive: "A+, A-, O+, O-" },
    { group: "B-", canGive: "B-, B+, AB-, AB+", canReceive: "B-, O-" },
    { group: "B+", canGive: "B+, AB+", canReceive: "B+, B-, O+, O-" },
    { group: "AB-", canGive: "AB-, AB+", canReceive: "AB-, A-, B-, O-" },
    { group: "AB+", canGive: "AB+ Only", canReceive: "Universal Recipient (All Groups)" },
  ];

  const faqs = [
    {
      q: "How does Heart Sync ensure blood safety and patient privacy?",
      a: "Heart Sync adheres to strict medical data minimization and confidentiality protocols. Donor phone numbers and private addresses are masked to the public. All blood units logged in our system must undergo mandatory serological testing (HIV, HBV, HCV, Syphilis, Malaria) and ABO/Rh cross-matching prior to clinical allocation.",
    },
    {
      q: "Does voluntary donor registration guarantee that I can donate?",
      a: "No. Voluntary registration enters you into our emergency notification registry. Actual donation eligibility is determined on-site by licensed clinical staff following standardized medical history screening, hemoglobin evaluation, and vital signs assessment.",
    },
    {
      q: "How fast can a hospital request emergency blood units?",
      a: "Hospital emergency departments can submit immediate priority requests directly through the Hospital Portal. Licensed regional blood banks receive instant alerts, review real-time cold storage inventory, and allocate screened units within minutes.",
    },
    {
      q: "What is the difference between Whole Blood and Component Separation?",
      a: "A single whole blood donation can be clinically separated into Packed Red Blood Cells (PRBC for trauma and surgery), Platelets (for leukemia and cancer patients), and Fresh Frozen Plasma (FFP for burn victims and coagulation disorders), potentially saving up to 3 separate lives.",
    },
  ];

  return (
    <div>
      {/* 1. CLINICAL TRIAGE NOTICE BANNER */}
      <div style={styles.triageBanner}>
        <div className="container" style={styles.triageContent}>
          <span style={{ fontSize: "18px" }}>ℹ️</span>
          <div>
            <strong>Clinical Safety Notice:</strong> Heart Sync connects verified hospitals, blood banks, and voluntary donors.
            A donor directory, emergency hospital requests, and screened inventory units are separate clinical workflows.
            Transfusion decisions require authorized medical cross-matching.
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section style={styles.hero}>
        <div className="container hero-grid">
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>
              🇵🇰 NATIONAL BLOOD BANK & HOSPITAL COORDINATION PLATFORM
            </div>
            <h1 className="hero-title-responsive">
              Real-Time Blood Coordination for <span style={{ color: "var(--primary-red)" }}>Every Life</span> in Need.
            </h1>
            <p style={styles.heroSub}>
              Directly connecting trauma care hospitals, certified blood banks, and verified voluntary donors
              across Pakistan with zero compromise on clinical safety and cold-chain traceability.
            </p>

            <div className="hero-actions-responsive">
              <Link to="/register-donor" className="btn btn-primary" style={{ padding: "13px 26px", fontSize: "15px" }}>
                🩸 Register as Voluntary Donor
              </Link>
              <Link to="/requests" className="btn btn-secondary" style={{ padding: "13px 24px", fontSize: "15px" }}>
                🏥 Hospital Blood Request
              </Link>
              <Link to="/directory" className="btn btn-outline-navy" style={{ padding: "13px 20px", fontSize: "15px" }}>
                🔍 Find a Blood Bank
              </Link>
            </div>

            <div style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Target Architecture Capacity (Sample Demonstration Values):
              </div>
              <div className="hero-stats-grid">
                <div style={styles.heroStatItem}>
                  <div style={styles.heroStatValue}>{metrics.availableUnits}+</div>
                  <div style={styles.heroStatLabel}>Screened Units Target (Sample)</div>
                </div>
                <div style={styles.heroStatItem}>
                  <div style={styles.heroStatValue}>{metrics.donorsCount}+</div>
                  <div style={styles.heroStatLabel}>Registered Donors Goal (Sample)</div>
                </div>
                <div style={styles.heroStatItem}>
                  <div style={styles.heroStatValue}>{metrics.hospitalsCount}+</div>
                  <div style={styles.heroStatLabel}>Partner Facilities (Sample)</div>
                </div>
                <div style={styles.heroStatItem}>
                  <div style={styles.heroStatValue}>24/7</div>
                  <div style={styles.heroStatLabel}>Clinical Coordination Readiness</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.triageCard}>
              <div style={styles.triageCardHeader}>
                <div style={{ fontWeight: "700", color: "var(--dark-navy)", fontSize: "16px" }}>
                  🚨 Emergency Blood Triage
                </div>
                <span className="badge badge-danger">Immediate Dispatch</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Are you an authorized medical officer handling an emergency trauma case?
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link to="/requests" className="btn btn-primary" style={{ width: "100%" }}>
                  Submit Emergency Blood Request →
                </Link>
                <Link to="/donors" className="btn btn-outline" style={{ width: "100%" }}>
                  Search Voluntary Donors Directory
                </Link>
              </div>

              <div style={styles.hotlineBox}>
                <div style={{ fontSize: "12px", color: "#64748B" }}>Emergency Coordination Desk:</div>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--dark-navy)" }}>
                  [Hotline Pending Configuration]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW THE PLATFORM WORKS */}
      <section style={styles.sectionLight}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span className="badge badge-neutral">STANDARDIZED WORKFLOW</span>
            <h2 style={styles.sectionTitle}>How Heart Sync Operates Safely</h2>
            <p style={styles.sectionSubtitle}>
              Three distinct tracks engineered for clinical reliability, donor privacy, and immediate emergency response.
            </p>
          </div>

          <div className="grid-cols-3">
            {/* Step 1 */}
            <div className="card card-hover">
              <div style={styles.stepNumBadge}>01</div>
              <h3 style={styles.cardTitle}>Voluntary Donor Registry</h3>
              <p style={styles.cardDesc}>
                Civilians register voluntarily with contact preferences and blood group. Contact details are masked
                from public scrapers to preserve strict privacy until coordinated through authorized channels.
              </p>
              <div style={{ marginTop: "16px" }}>
                <Link to="/register-donor" style={styles.cardLink}>Join Donor Community →</Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card card-hover">
              <div style={styles.stepNumBadge}>02</div>
              <h3 style={styles.cardTitle}>Hospital Blood Requests</h3>
              <p style={styles.cardDesc}>
                Licensed hospital transfusion departments submit verified requests specifying clinical urgency,
                component type (PRBC, Platelets, FFP), and required units without exposing confidential patient identities.
              </p>
              <div style={{ marginTop: "16px" }}>
                <Link to="/requests" style={styles.cardLink}>View Active Requests →</Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card card-hover">
              <div style={styles.stepNumBadge}>03</div>
              <h3 style={styles.cardTitle}>Blood Bank Stock Allocation</h3>
              <p style={styles.cardDesc}>
                Certified blood banks track screened inventory with unique barcodes. When fulfilling hospital requests,
                units are atomically allocated, preventing double allocation or release of expired/quarantined stock.
              </p>
              <div style={{ marginTop: "16px" }}>
                <Link to="/directory" style={styles.cardLink}>Explore Blood Centers →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING BLOOD DONATION CAMPS */}
      <section style={{ padding: "60px 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="badge badge-info">COMMUNITY OUTREACH</span>
              <h2 style={styles.sectionTitle}>Upcoming Blood Donation Camps</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                Volunteer at licensed mobile collection drives organized in collaboration with regional health centers.
              </p>
            </div>
            <Link to="/camps" className="btn btn-outline-navy btn-sm">
              View All Drives ({camps.length}+) →
            </Link>
          </div>

          {campSuccessMsg && (
            <div style={{ ...styles.triageBanner, background: "#E8F5E9", borderColor: "#2E7D32", color: "#1B5E20", marginBottom: "20px" }}>
              ✓ {campSuccessMsg}
            </div>
          )}

          <div className="grid-cols-3">
            {camps.map((camp) => (
              <div key={camp._id} className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span className="badge badge-success">Verified Drive</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{camp.city}</span>
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
                    {camp.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: "1.5" }}>
                    📍 <strong>Venue:</strong> {camp.venue}
                  </p>
                  <div style={{ fontSize: "12.5px", color: "var(--text-main)", marginBottom: "8px" }}>
                    🗓️ {new Date(camp.startDate).toLocaleDateString()} to {new Date(camp.endDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "16px" }}>
                    Target: {camp.targetUnits} units • Registered Donors: {camp.registeredDonorsCount}
                  </div>
                </div>

                <button
                  onClick={() => handleCampRegister(camp._id)}
                  className="btn btn-primary"
                  style={{ width: "100%", fontSize: "13.5px" }}
                >
                  Register to Donate at this Camp
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BLOOD GROUP COMPATIBILITY GUIDE */}
      <section style={styles.sectionLight}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span className="badge badge-danger">CLINICAL REFERENCE</span>
            <h2 style={styles.sectionTitle}>Blood Group Transfusion Matrix</h2>
            <p style={styles.sectionSubtitle}>
              Standard red blood cell compatibility. Actual medical releases require serological cross-match confirmation.
            </p>
          </div>

          <div className="healthcare-table-wrap">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Can Donate Red Cells To</th>
                  <th>Can Receive Red Cells From</th>
                  <th>Clinical Urgency Notes</th>
                </tr>
              </thead>
              <tbody>
                {bloodGroupCompatibility.map((item) => (
                  <tr key={item.group}>
                    <td>
                      <span style={styles.bloodTypePill}>{item.group}</span>
                    </td>
                    <td style={{ fontWeight: "600" }}>{item.canGive}</td>
                    <td>{item.canReceive}</td>
                    <td>
                      {item.group === "O-" ? (
                        <span className="badge badge-danger">Critical: Universal Trauma Red Cells</span>
                      ) : item.group === "AB+" ? (
                        <span className="badge badge-info">Universal Plasma Donor</span>
                      ) : (
                        <span className="badge badge-neutral">Standard Typing Match</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED BLOOD CENTERS DIRECTORY PREVIEW */}
      <section style={{ padding: "60px 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="badge badge-success">ACCREDITED FACILITIES</span>
              <h2 style={styles.sectionTitle}>Verified Regional Blood Centers</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                Facilities equipped with standard component separation, testing, and continuous cold storage.
              </p>
            </div>
            <Link to="/directory" className="btn btn-outline-navy btn-sm">
              Explore Full Directory →
            </Link>
          </div>

          <div className="grid-cols-3">
            {organizations.map((org) => (
              <div key={org._id} className="card card-hover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span className="badge badge-info">{org.type.replace("_", " ")}</span>
                  <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: "600" }}>✓ VERIFIED</span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "6px" }}>
                  {org.name}
                </h3>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  📍 {org.address}, {org.city}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--dark-navy)", fontWeight: "600", marginBottom: "4px" }}>
                  📞 24/7 Desk: {org.phone}
                </div>
                <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                  License No: {org.licenseNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQS ACCORDION */}
      <section style={styles.sectionLight}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div style={styles.sectionHeader}>
            <span className="badge badge-neutral">QUESTIONS & ANSWERS</span>
            <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p style={styles.sectionSubtitle}>
              Essential guidelines on donation safety, eligibility, and hospital coordination.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card"
                style={{ padding: "18px 24px", cursor: "pointer" }}
                onClick={() => setFaqOpen(faqOpen === index ? null : index)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--dark-navy)" }}>
                    {faq.q}
                  </h4>
                  <span style={{ fontSize: "18px", color: "var(--primary-red)" }}>
                    {faqOpen === index ? "−" : "+"}
                  </span>
                </div>
                {faqOpen === index && (
                  <p style={{ marginTop: "12px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.7" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION RIBBON */}
      <section style={styles.ctaBanner}>
        <div className="container cta-content-responsive">
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
              Every Drop Counts. Save Up to 3 Lives Today.
            </h2>
            <p style={{ color: "#FECACA", fontSize: "15px" }}>
              Join thousands of verified voluntary donors providing life-saving support to emergency trauma centers.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/register-donor" className="btn btn-secondary" style={{ background: "#fff", color: "var(--primary-red)", padding: "12px 24px" }}>
              Become a Registered Donor
            </Link>
            <Link to="/requests" className="btn" style={{ background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "12px 20px" }}>
              Emergency Blood Requests
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  triageBanner: {
    background: "#EFF6FF",
    borderBottom: "1px solid #BFDBFE",
    padding: "10px 0",
    color: "#1E40AF",
    fontSize: "13px",
  },
  triageContent: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  hero: {
    background: "linear-gradient(135deg, #0F1E36 0%, #172B4D 60%, #20365B 100%)",
    color: "#fff",
    padding: "70px 0 80px",
  },
  heroContainer: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.9fr",
    gap: "50px",
    alignItems: "center",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  heroBadge: {
    display: "inline-block",
    background: "rgba(198, 40, 40, 0.2)",
    border: "1px solid rgba(198, 40, 40, 0.4)",
    color: "#FCA5A5",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 12px",
    borderRadius: "20px",
    letterSpacing: "0.5px",
    width: "fit-content",
  },
  heroTitle: {
    fontSize: "42px",
    fontWeight: "800",
    lineHeight: "1.2",
    letterSpacing: "-0.5px",
  },
  heroSub: {
    fontSize: "16px",
    color: "#CBD5E1",
    lineHeight: "1.7",
    maxWidth: "580px",
  },
  heroActionGroup: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
  heroStatsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    paddingTop: "24px",
    marginTop: "16px",
  },
  heroStatItem: {
    display: "flex",
    flexDirection: "column",
  },
  heroStatValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#fff",
  },
  heroStatLabel: {
    fontSize: "12px",
    color: "#94A3B8",
  },
  heroRight: {
    display: "flex",
    justifyContent: "center",
  },
  triageCard: {
    background: "#fff",
    borderRadius: "var(--radius-lg)",
    padding: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    width: "100%",
    maxWidth: "420px",
  },
  triageCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  hotlineBox: {
    background: "var(--primary-red-light)",
    border: "1px dashed var(--primary-red-muted)",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "16px",
  },
  sectionLight: {
    padding: "70px 0",
    background: "var(--bg-light)",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "44px",
  },
  sectionTitle: {
    fontSize: "30px",
    fontWeight: "800",
    color: "var(--dark-navy)",
    marginTop: "8px",
  },
  sectionSubtitle: {
    fontSize: "15px",
    color: "var(--text-muted)",
    maxWidth: "600px",
    margin: "8px auto 0",
  },
  stepNumBadge: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "var(--primary-red-light)",
    color: "var(--primary-red)",
    fontWeight: "800",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    marginBottom: "10px",
  },
  cardDesc: {
    fontSize: "13.5px",
    color: "var(--text-muted)",
    lineHeight: "1.6",
  },
  cardLink: {
    color: "var(--primary-red)",
    fontWeight: "600",
    fontSize: "13.5px",
  },
  bloodTypePill: {
    display: "inline-block",
    background: "var(--primary-red-light)",
    color: "var(--primary-red)",
    fontWeight: "800",
    fontSize: "14px",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  ctaBanner: {
    background: "linear-gradient(135deg, #B71C1C 0%, #C62828 100%)",
    padding: "60px 0",
  },
  ctaContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "24px",
  },
};

export default Home;