import { useState, useEffect } from "react";
import { getOrganizations } from "../api/organizationApi";

function Directory() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrgs();
  }, [typeFilter]);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const data = await getOrganizations({ type: typeFilter, search });
      setOrgs(data);
    } catch (e) {
      console.error(e);
      setOrgs([]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "85vh", paddingBottom: "70px" }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <span className="badge badge-success">ACCREDITED HEALTHCARE FACILITIES</span>
          <h1 style={styles.headerTitle}>Hospitals &amp; Blood Bank Directory</h1>
          <p style={styles.headerSub}>
            Licensed blood transfusion services, tertiary care hospital trauma centers, and regional storage facilities
            registered with Heart Sync.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "30px" }}>
        {/* Search & Filter Bar */}
        <div className="card" style={{ padding: "18px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            {["ALL", "BLOOD_BANK", "HOSPITAL"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "1px solid",
                  backgroundColor: typeFilter === t ? "var(--primary-red)" : "#F1F5F9",
                  color: typeFilter === t ? "#fff" : "var(--dark-navy)",
                  borderColor: typeFilter === t ? "var(--primary-red)" : "transparent",
                }}
              >
                {t === "ALL" ? "All Facilities" : t.replace("_", " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              placeholder="Search by facility name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchOrgs()}
              style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "13.5px", flex: 1, minWidth: "140px" }}
            />
            <button onClick={fetchOrgs} className="btn btn-primary btn-sm">Search</button>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "var(--text-muted)" }}>Loading verified facilities...</p>
          </div>
        ) : orgs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
            <span style={{ fontSize: "36px" }}>🏥</span>
            <h3 style={{ marginTop: "10px", color: "var(--dark-navy)" }}>No Facilities Found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Try searching with a different name or facility type.
            </p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {orgs.map((org) => (
              <div key={org._id} className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span className="badge badge-info">{org.type.replace("_", " ")}</span>
                    <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: "700" }}>✓ VERIFIED</span>
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "6px" }}>
                    {org.name}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
                    📍 {org.address}, {org.city}
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--dark-navy)", fontWeight: "600", marginBottom: "4px" }}>
                    📞 Emergency Desk: {org.phone}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    ✉️ {org.email}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", marginBottom: "14px" }}>
                    License / Reg No: <strong>{org.licenseNumber}</strong>
                  </div>

                  {org.availableComponents && org.availableComponents.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                      {org.availableComponents.map((c) => (
                        <span key={c} style={{ fontSize: "10.5px", background: "#F1F5F9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
                          {c.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11.5px", color: "var(--success-green)", fontWeight: "600" }}>
                    ● 24/7 Transfusion Active
                  </span>
                  <a href={`tel:${org.emergencyContact || org.phone}`} className="btn btn-outline btn-sm">
                    Call Center 📞
                  </a>
                </div>
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
    maxWidth: "680px",
    lineHeight: "1.6",
  },
};

export default Directory;
