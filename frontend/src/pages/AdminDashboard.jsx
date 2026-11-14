import { useState, useEffect } from "react";
import { getAdminMetrics, getUsers, updateUserRole, getAuditLogs } from "../api/adminApi";
import { getOrganizations, updateOrgStatus, createOrganization } from "../api/organizationApi";

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("METRICS");
  const [loading, setLoading] = useState(false);
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [newOrg, setNewOrg] = useState({
    name: "",
    type: "HOSPITAL",
    licenseNumber: "",
    city: "Lahore",
    area: "",
    address: "",
    phone: "",
    email: "",
    emergencyContact: "",
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [m, u, o, logs] = await Promise.all([
        getAdminMetrics(),
        getUsers(),
        getOrganizations({ type: "ALL" }),
        getAuditLogs(),
      ]);
      setMetrics(m.metrics);
      setUsers(u);
      setOrgs(o);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, { role: newRole });
      setSuccessMsg("User role updated successfully.");
      fetchAdminData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert("Role update error: " + (e.response?.data?.message || e.message));
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await updateUserRole(userId, { status: newStatus });
      fetchAdminData();
    } catch (e) {
      alert("Status update error");
    }
  };

  const handleToggleOrgStatus = async (orgId, currentStatus) => {
    const newStatus = currentStatus === "VERIFIED" ? "SUSPENDED" : "VERIFIED";
    try {
      await updateOrgStatus(orgId, newStatus);
      fetchAdminData();
    } catch (e) {
      alert("Organization update error");
    }
  };

  const handleCreateOrgSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrganization(newOrg);
      setShowAddOrg(false);
      setSuccessMsg("Healthcare organization registered and verified.");
      fetchAdminData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert("Error: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div style={{ minHeight: "85vh", padding: "40px 0 70px", background: "var(--bg-light)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="badge badge-danger">SUPER ADMIN OVERSIGHT</span>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "6px" }}>
              National Health Platform Administration
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowAddOrg(true)} className="btn btn-primary">
              + Onboard Healthcare Facility
            </button>
            <button onClick={fetchAdminData} className="btn btn-outline-navy">
              🔄 Refresh Analytics
            </button>
          </div>
        </div>

        {successMsg && (
          <div style={{ ...styles.alertBox, background: "var(--success-light)", color: "var(--success-green)", marginBottom: "20px" }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("METRICS")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "METRICS" ? "var(--dark-navy)" : "#fff",
              color: activeTab === "METRICS" ? "#fff" : "var(--dark-navy)",
            }}
          >
            📈 Platform KPIs &amp; Trends
          </button>
          <button
            onClick={() => setActiveTab("ORGS")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "ORGS" ? "var(--dark-navy)" : "#fff",
              color: activeTab === "ORGS" ? "#fff" : "var(--dark-navy)",
            }}
          >
            🏥 Organizations ({orgs.length})
          </button>
          <button
            onClick={() => setActiveTab("USERS")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "USERS" ? "var(--dark-navy)" : "#fff",
              color: activeTab === "USERS" ? "#fff" : "var(--dark-navy)",
            }}
          >
            👥 Users &amp; Roles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("AUDIT")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "AUDIT" ? "var(--dark-navy)" : "#fff",
              color: activeTab === "AUDIT" ? "#fff" : "var(--dark-navy)",
            }}
          >
            🛡️ Clinical Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* TAB 1: METRICS */}
        {activeTab === "METRICS" && metrics && (
          <div>
            <div className="grid-cols-4" style={{ marginBottom: "24px" }}>
              <div className="card">
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>TOTAL DONORS</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "4px" }}>{metrics.donorsCount}</div>
                <div style={{ fontSize: "12px", color: "var(--success-green)", marginTop: "4px" }}>Registered voluntary pool</div>
              </div>

              <div className="card">
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>SCREENED BLOOD UNITS</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary-red)", marginTop: "4px" }}>{metrics.availableUnitsCount}</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Ready in regional cold stores</div>
              </div>

              <div className="card">
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>ACTIVE URGENT REQUESTS</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--warning-amber)", marginTop: "4px" }}>{metrics.urgentRequestsCount}</div>
                <div style={{ fontSize: "12px", color: "var(--warning-amber)", marginTop: "4px" }}>Immediate trauma cases</div>
              </div>

              <div className="card">
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>AFFILIATED FACILITIES</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--info-blue)", marginTop: "4px" }}>
                  {metrics.hospitalsCount + metrics.bloodBanksCount}
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Hospitals &amp; Licensed Centers</div>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="card">
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "16px" }}>
                Recent System Security &amp; Clinical Transitions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {metrics.recentLogs?.map((log) => (
                  <div key={log._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", fontSize: "13px" }}>
                    <div>
                      <span className="badge badge-info" style={{ marginRight: "10px" }}>{log.action}</span>
                      <span>{log.userEmail} ({log.userRole})</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(log.createdAt).toLocaleTimeString()} • {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORGANIZATIONS */}
        {activeTab === "ORGS" && (
          <div className="healthcare-table-wrap">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>Facility Name</th>
                  <th>Type</th>
                  <th>License Number</th>
                  <th>City &amp; Address</th>
                  <th>Emergency Desk</th>
                  <th>Verification</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org._id}>
                    <td><strong>{org.name}</strong></td>
                    <td>
                      <span className="badge badge-info">{org.type.replace("_", " ")}</span>
                    </td>
                    <td><code>{org.licenseNumber}</code></td>
                    <td>📍 {org.city} • {org.area}</td>
                    <td>📞 {org.emergencyContact || org.phone}</td>
                    <td>
                      <span className={`badge ${org.verificationStatus === "VERIFIED" ? "badge-success" : "badge-danger"}`}>
                        {org.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleOrgStatus(org._id, org.verificationStatus)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "12px", padding: "4px 8px" }}
                      >
                        {org.verificationStatus === "VERIFIED" ? "Suspend" : "Verify Facility"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: USERS & ROLES */}
        {activeTab === "USERS" && (
          <div className="healthcare-table-wrap">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Affiliated Facility</th>
                  <th>Account Status</th>
                  <th>Role Governance</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-info">{u.role}</span>
                    </td>
                    <td style={{ fontSize: "12.5px" }}>
                      {u.organizationId?.name || <span style={{ color: "var(--text-muted)" }}>Independent / Voluntary</span>}
                    </td>
                    <td>
                      <span className={`badge ${u.status === "ACTIVE" ? "badge-success" : "badge-danger"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                          style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "12px" }}
                        >
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
                          <option value="HOSPITAL_STAFF">HOSPITAL_STAFF</option>
                          <option value="BLOOD_BANK_ADMIN">BLOOD_BANK_ADMIN</option>
                          <option value="BLOOD_BANK_STAFF">BLOOD_BANK_STAFF</option>
                          <option value="DONOR">DONOR</option>
                        </select>
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === "AUDIT" && (
          <div className="healthcare-table-wrap">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Entity Type</th>
                  <th>Actor Email &amp; Role</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-info">{log.action}</span>
                    </td>
                    <td>{log.entityType}</td>
                    <td>
                      <div><strong>{log.userEmail}</strong></div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>Role: {log.userRole}</div>
                    </td>
                    <td><code>{log.ipAddress || "127.0.0.1"}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ONBOARD FACILITY */}
      {showAddOrg && (
        <div className="modal-backdrop" onClick={() => setShowAddOrg(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--dark-navy)" }}>
                Onboard Healthcare Facility
              </h3>
              <button onClick={() => setShowAddOrg(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreateOrgSubmit} style={{ padding: "24px" }}>
              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Facility Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Services Hospital"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Facility Type *</label>
                  <select
                    value={newOrg.type}
                    onChange={(e) => setNewOrg({ ...newOrg, type: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="HOSPITAL">HOSPITAL</option>
                    <option value="BLOOD_BANK">BLOOD_BANK</option>
                    <option value="DONATION_CENTER">DONATION_CENTER</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>License / Registration Number *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. PB-HOSP-09912"
                    value={newOrg.licenseNumber}
                    onChange={(e) => setNewOrg({ ...newOrg, licenseNumber: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>City *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Lahore"
                    value={newOrg.city}
                    onChange={(e) => setNewOrg({ ...newOrg, city: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Official Phone *</label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. +92 42 99200000"
                    value={newOrg.phone}
                    onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Official Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. info@serviceshospital.pk"
                    value={newOrg.email}
                    onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.formLabel}>Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. Jail Road, Shadman, Lahore"
                  value={newOrg.address}
                  onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
                  style={styles.formInput}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setShowAddOrg(false)} className="btn btn-outline-navy">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify &amp; Register Facility ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabBtn: {
    padding: "9px 18px",
    borderRadius: "var(--radius-md)",
    fontSize: "13.5px",
    fontWeight: "700",
    border: "1px solid var(--border-color)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  alertBox: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13.5px",
  },
  formLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    marginBottom: "5px",
  },
  formInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box",
  },
};

export default AdminDashboard;
