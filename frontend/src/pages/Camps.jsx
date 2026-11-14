import { useState, useEffect } from "react";
import { getCamps, registerForCamp } from "../api/campApi";

function Camps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchCamps();
  }, [selectedStatus]);

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const data = await getCamps({ status: selectedStatus, city: cityFilter });
      setCamps(data);
    } catch (e) {
      console.error(e);
      setCamps([]);
    }
    setLoading(false);
  };

  const handleRegister = async (campId) => {
    try {
      const res = await registerForCamp(campId);
      setSuccessMsg(res.message);
      fetchCamps();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      alert("Registration error. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "85vh", paddingBottom: "70px" }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <span className="badge badge-danger">COMMUNITY BLOOD DRIVES</span>
          <h1 style={styles.headerTitle}>Blood Donation Camps</h1>
          <p style={styles.headerSub}>
            Organized in partnership with licensed regional blood banks and academic institutions to maintain
            adequate emergency blood reserves for trauma and thalassemia centers.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "30px" }}>
        {successMsg && (
          <div style={{ ...styles.alertBox, background: "var(--success-light)", color: "var(--success-green)", marginBottom: "20px" }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Filter Bar */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["ALL", "UPCOMING", "ACTIVE", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "1px solid",
                  backgroundColor: selectedStatus === st ? "var(--primary-red)" : "#F1F5F9",
                  color: selectedStatus === st ? "#fff" : "var(--dark-navy)",
                  borderColor: selectedStatus === st ? "var(--primary-red)" : "transparent",
                }}
              >
                {st}
              </button>
            ))}
          </div>
          <div>
            <input
              type="text"
              placeholder="Search city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCamps()}
              style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Camps Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "var(--text-muted)" }}>Loading blood donation camps...</p>
          </div>
        ) : camps.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
            <span style={{ fontSize: "36px" }}>🏕️</span>
            <h3 style={{ marginTop: "10px", color: "var(--dark-navy)" }}>No Donation Camps Found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Check back soon or explore our voluntary donor registry.
            </p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {camps.map((camp) => (
              <div key={camp._id} className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span className={`badge ${camp.status === "UPCOMING" ? "badge-info" : camp.status === "ACTIVE" ? "badge-success" : "badge-neutral"}`}>
                      {camp.status}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{camp.city}</span>
                  </div>

                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
                    {camp.title}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "6px" }}>
                    📍 <strong>Venue:</strong> {camp.venue}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "10px" }}>
                    🗓️ <strong>Dates:</strong> {new Date(camp.startDate).toLocaleDateString()} – {new Date(camp.endDate).toLocaleDateString()}
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "14px" }}>
                    {camp.description || "Community voluntary blood drive in collaboration with regional health services."}
                  </p>

                  <div style={{ background: "#F8FAFC", padding: "10px", borderRadius: "6px", fontSize: "12px", color: "#475569", marginBottom: "16px" }}>
                    <div>Organizer: <strong>{camp.organizerName}</strong></div>
                    <div>Target: <strong>{camp.targetUnits} units</strong> • Registered: <strong>{camp.registeredDonorsCount} donors</strong></div>
                  </div>
                </div>

                <button
                  disabled={camp.status === "COMPLETED"}
                  onClick={() => handleRegister(camp._id)}
                  className="btn btn-primary"
                  style={{ width: "100%", fontSize: "13.5px" }}
                >
                  {camp.status === "COMPLETED" ? "Drive Concluded" : "Register as Donor for this Camp →"}
                </button>
              </div>
            ))}
          </div>
        )}
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
    maxWidth: "650px",
    lineHeight: "1.6",
  },
  alertBox: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13.5px",
  },
};

export default Camps;
