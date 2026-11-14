import { useState, useEffect } from "react";
import { searchDonors } from "../api/donorApi";

const bloodGroups = ["ALL", "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const popularCities = ["All Cities", "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

function FindDonors() {
  const [donors, setDonors] = useState([]);
  const [city, setCity] = useState("");
  const [bloodGroup, setBloodGroup] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [coordinateModal, setCoordinateModal] = useState(null);
  const [coordSubmitted, setCoordSubmitted] = useState(false);
  const [coordForm, setCoordForm] = useState({ requesterName: "", requesterPhone: "", hospitalName: "", urgencyReason: "" });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAuthorizedStaff = Boolean(
    user &&
    ["SUPER_ADMIN", "HOSPITAL_ADMIN", "HOSPITAL_STAFF", "BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(user.role)
  );

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const data = await searchDonors(city, bloodGroup === "ALL" ? "" : bloodGroup);
      setDonors(data);
    } catch (err) {
      console.error("Error fetching donors:", err);
      setDonors([]);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleReset = () => {
    setCity("");
    setBloodGroup("ALL");
    setLoading(true);
    searchDonors("", "")
      .then((data) => setDonors(data))
      .finally(() => setLoading(false));
  };

  const handleCoordinateSubmit = (e) => {
    e.preventDefault();
    setCoordSubmitted(true);
  };

  return (
    <div style={{ minHeight: "80vh", paddingBottom: "60px" }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <span className="badge badge-danger">VOLUNTARY DONOR REGISTRY</span>
          <h1 className="page-header-title">Find Verified Blood Donors</h1>
          <p style={styles.headerSub}>
            Search registered voluntary donors across Pakistan. Contact information is privacy-protected
            and coordinated through certified clinical protocols.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={styles.searchBox}>
            <div className="search-bar-grid">
              <div style={styles.inputWrap}>
                <label style={styles.inputLabel}>City or Area</label>
                <input
                  type="text"
                  placeholder="e.g. Lahore, Gulberg..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.inputWrap}>
                <label style={styles.inputLabel}>Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  style={styles.inputField}
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg === "ALL" ? "All Blood Groups" : bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-actions-wrap">
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px", height: "46px" }}>
                  🔍 Search Donors
                </button>
                <button type="button" onClick={handleReset} className="btn btn-outline-navy" style={{ height: "46px" }}>
                  Reset
                </button>
              </div>
            </div>

            {/* Quick City Filters */}
            <div style={styles.cityPillsRow}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Quick Cities:</span>
              {popularCities.slice(1, 6).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => { setCity(c); }}
                  style={{
                    ...styles.cityPill,
                    backgroundColor: city === c ? "var(--primary-red-light)" : "#F1F5F9",
                    color: city === c ? "var(--primary-red)" : "#475569",
                    borderColor: city === c ? "var(--primary-red)" : "transparent",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      <div className="container" style={{ marginTop: "30px" }}>
        {/* Privacy Notice Banner */}
        <div
          className="medical-alert-banner"
          style={
            isAuthorizedStaff
              ? { borderColor: "#10B981", background: "#ECFDF5", color: "#065F46" }
              : undefined
          }
        >
          <span style={{ fontSize: "18px" }}>{isAuthorizedStaff ? "🩺" : "🔒"}</span>
          <div>
            {isAuthorizedStaff ? (
              <>
                <strong>Clinical Staff Authorization Active:</strong> Logged in as <strong>{user?.name}</strong> ({user?.role?.replace(/_/g, " ")}).
                Direct voluntary donor contact details are unmasked for emergency blood bank &amp; hospital coordination.
              </>
            ) : (
              <>
                <strong>Donor Privacy Protection:</strong> In compliance with healthcare data regulations, voluntary donors'
                exact contact numbers and addresses are masked. Authorized hospital teams or verified requesters can initiate
                a secure coordination request via the <strong>"Request Coordination"</strong> button or sign in with healthcare credentials.
              </>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--dark-navy)" }}>
            Showing {donors.length} registered voluntary donor(s)
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Subject to on-site screening by transfusion medicine staff
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ display: "inline-block", width: "40px", height: "40px", border: "3px solid #E2E8F0", borderTopColor: "var(--primary-red)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Searching verified donor registry...</p>
          </div>
        ) : donors.length === 0 ? (
          /* Empty State */
          <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
            <span style={{ fontSize: "40px" }}>🔍</span>
            <h3 style={{ marginTop: "12px", color: "var(--dark-navy)" }}>No Matching Voluntary Donors Found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "480px", margin: "8px auto 20px" }}>
              We could not find any registered voluntary donors matching "{city || "selected area"}" with blood group "{bloodGroup}".
              Try searching without city filters or submit an emergency request to our blood banks.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={handleReset} className="btn btn-outline-navy">
                Reset Filters
              </button>
              <a href="/requests" className="btn btn-primary">
                Post Hospital Blood Request
              </a>
            </div>
          </div>
        ) : (
          /* Donors Grid */
          <div className="grid-cols-3">
            {donors.map((donor) => {
              const isAvailable = donor.available !== false;
              return (
                <div key={donor._id} className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {/* Card Top */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <div style={styles.bloodBadgeLarge}>
                        {donor.bloodGroup}
                      </div>
                      <span className={`badge ${isAvailable ? "badge-success" : "badge-neutral"}`}>
                        {isAvailable ? "Available to Donate" : "Temporarily Deferred"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "4px" }}>
                      {donor.name}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "12px" }}>
                      Ref: <strong>{donor.donorRefId || "HS-VOL"}</strong> • {donor.screeningStatus === "ELIGIBLE_VERIFIED" ? "Medically Screened" : "Voluntary Registry"}
                    </div>

                    {/* Donor Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "var(--text-main)", marginBottom: "16px" }}>
                      <div>📍 <strong>City / Area:</strong> {donor.city}{donor.area ? `, ${donor.area}` : ""}</div>
                      <div>
                        📞 <strong>Phone:</strong>{" "}
                        <span style={{ fontFamily: "monospace", color: donor.isMasked ? "#64748B" : "var(--dark-navy)", fontWeight: donor.isMasked ? "normal" : "700" }}>
                          {donor.phone}
                        </span>
                        {!donor.isMasked && (
                          <span style={{ marginLeft: "6px", fontSize: "11px", color: "#065F46", background: "#D1FAE5", padding: "1px 6px", borderRadius: "4px", fontWeight: "600" }}>
                            Staff Access
                          </span>
                        )}
                      </div>
                      <div>
                        ✉️ <strong>Email:</strong>{" "}
                        <span style={{ fontFamily: "monospace", color: donor.isMasked ? "#64748B" : "var(--dark-navy)", fontWeight: donor.isMasked ? "normal" : "700" }}>
                          {donor.email}
                        </span>
                      </div>
                      {donor.lastDonationDate && (
                        <div>🗓️ <strong>Last Donation:</strong> {new Date(donor.lastDonationDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <button
                      onClick={() => setCoordinateModal(donor)}
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                    >
                      Request Coordination
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coordination Modal */}
      {coordinateModal && (
        <div className="modal-backdrop" onClick={() => setCoordinateModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--dark-navy)" }}>
                  Initiate Donor Coordination
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Coordinating with Donor Ref: <strong>{coordinateModal.donorRefId}</strong> ({coordinateModal.bloodGroup})
                </div>
              </div>
              <button onClick={() => setCoordinateModal(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: "24px" }}>
              {coordSubmitted ? (
                <div style={{ padding: "8px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "28px" }}>📋</span>
                    <div>
                      <h4 style={{ color: "var(--dark-navy)", margin: 0, fontSize: "17px", fontWeight: "700" }}>
                        Emergency Coordination Protocol
                      </h4>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Donor Ref: <strong>{coordinateModal.donorRefId}</strong> ({coordinateModal.bloodGroup}) • {coordinateModal.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "14px", background: "var(--info-light, #EFF6FF)", border: "1px solid #BFDBFE", borderRadius: "8px", fontSize: "13px", lineHeight: "1.5", color: "#1E3A8A", marginBottom: "16px" }}>
                    <strong>Notice:</strong> Automated SMS donor dispatch is currently in clinical staging.
                    To coordinate immediately for this patient case, please utilize our active 24/7 emergency dispatch desk:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    <div style={{ padding: "12px", background: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "13px" }}>
                      <strong>1. Clinical Trauma Dispatch Desk:</strong>
                      <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#64748B", marginTop: "4px" }}>
                        📞 [Hotline Pending Institutional Configuration]
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                        Quote Donor Ref: <strong>{coordinateModal.donorRefId}</strong> upon operational deployment.
                      </div>
                    </div>

                    <div style={{ padding: "12px", background: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "13px" }}>
                      <strong>2. Post Hospital Blood Request:</strong>
                      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                        Submit an official requisition so regional blood banks can allocate screened cold-storage units.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCoordSubmitted(false);
                        setCoordinateModal(null);
                        setCoordForm({ requesterName: "", requesterPhone: "", hospitalName: "", urgencyReason: "" });
                      }}
                      className="btn btn-outline-navy"
                    >
                      Close
                    </button>
                    <a href="/requests" className="btn btn-primary">
                      Go to Hospital Requests →
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCoordinateSubmit}>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Please enter your clinical facility or authorized requester details. Our automated coordinator
                    will verify urgency and notify the donor.
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
                    <div>
                      <label style={styles.inputLabel}>Requester Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Dr. Salman / Staff Nurse"
                        value={coordForm.requesterName}
                        onChange={(e) => setCoordForm({ ...coordForm, requesterName: e.target.value })}
                        style={styles.inputField}
                      />
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Official Emergency Phone *</label>
                      <input
                        required
                        type="tel"
                        placeholder="e.g. +92 300 1234567"
                        value={coordForm.requesterPhone}
                        onChange={(e) => setCoordForm({ ...coordForm, requesterPhone: e.target.value })}
                        style={styles.inputField}
                      />
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Hospital or Patient Center *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Mayo Hospital Emergency ICU"
                        value={coordForm.hospitalName}
                        onChange={(e) => setCoordForm({ ...coordForm, hospitalName: e.target.value })}
                        style={styles.inputField}
                      />
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Urgency / Medical Context</label>
                      <textarea
                        rows="2"
                        placeholder="Brief clinical reason for blood requirement..."
                        value={coordForm.urgencyReason}
                        onChange={(e) => setCoordForm({ ...coordForm, urgencyReason: e.target.value })}
                        style={{ ...styles.inputField, resize: "none" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button type="button" onClick={() => setCoordinateModal(null)} className="btn btn-outline-navy">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Dispatch Coordination Alert →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
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
    fontSize: "34px",
    fontWeight: "800",
    marginTop: "8px",
    marginBottom: "8px",
  },
  headerSub: {
    fontSize: "15px",
    color: "#CBD5E1",
    maxWidth: "680px",
    lineHeight: "1.6",
    marginBottom: "28px",
  },
  searchBox: {
    background: "#fff",
    borderRadius: "var(--radius-lg)",
    padding: "20px 24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    color: "var(--text-main)",
  },
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr auto",
    gap: "16px",
    alignItems: "flex-end",
  },
  inputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputField: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  cityPillsRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
    flexWrap: "wrap",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "12px",
  },
  cityPill: {
    border: "1px solid transparent",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  bloodBadgeLarge: {
    background: "var(--primary-red-light)",
    color: "var(--primary-red)",
    fontWeight: "800",
    fontSize: "18px",
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid var(--primary-red-muted)",
  },
};

export default FindDonors;