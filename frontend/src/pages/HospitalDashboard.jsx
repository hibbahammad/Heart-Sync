import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRequests, createRequest, updateRequestStatus } from "../api/requestApi";

function HospitalDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [newRequest, setNewRequest] = useState({
    hospitalName: "",
    city: "Lahore",
    requesterName: "",
    contact: "",
    bloodGroup: "O-",
    component: "PRBC",
    unitsRequired: 2,
    urgency: "EMERGENCY_IMMEDIATE",
    deliveryLocation: "Trauma ICU Bed 2",
    clinicalNotes: "",
  });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchHospitalRequests();
    if (user?.organization) {
      setNewRequest((prev) => ({
        ...prev,
        hospitalName: user.organization.name || prev.hospitalName,
        city: user.organization.city || prev.city,
        requesterName: user.name || prev.requesterName,
        contact: user.phone || user.organization.phone || prev.contact,
      }));
    }
  }, []);

  const fetchHospitalRequests = async () => {
    setLoading(true);
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRequest(newRequest);
      setShowModal(false);
      fetchHospitalRequests();
    } catch (e) {
      alert("Failed to submit request: " + (e.response?.data?.message || e.message));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this emergency request?")) return;
    try {
      await updateRequestStatus(id, "CANCELLED", "Cancelled by hospital staff.");
      fetchHospitalRequests();
    } catch (e) {
      alert("Cancellation error");
    }
  };

  // Metrics calculation
  const total = requests.length;
  const pending = requests.filter((r) => ["SUBMITTED", "UNDER_VERIFICATION"].includes(r.status)).length;
  const accepted = requests.filter((r) => r.status === "ACCEPTED").length;
  const fulfilled = requests.filter((r) => r.status === "FULFILLED").length;
  const emergency = requests.filter((r) => r.urgency === "EMERGENCY_IMMEDIATE" && r.status !== "FULFILLED").length;

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "PENDING") return ["SUBMITTED", "UNDER_VERIFICATION"].includes(r.status);
    if (activeTab === "ACCEPTED") return r.status === "ACCEPTED";
    if (activeTab === "FULFILLED") return r.status === "FULFILLED";
    return true;
  });

  return (
    <div style={{ minHeight: "85vh", padding: "40px 0 70px", background: "var(--bg-light)" }}>
      <div className="container">
        {/* Portal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-info">HOSPITAL TRANSFUSION DESK</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {user?.organization?.name || "Mayo Hospital Transfusion Unit"}
              </span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "6px" }}>
              Hospital Coordination Portal
            </h1>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              + New Emergency Blood Request
            </button>
            <Link to="/requests" className="btn btn-outline-navy">
              Public Triage Board →
            </Link>
          </div>
        </div>

        {/* Urgent Emergency Alert Bar */}
        {emergency > 0 && (
          <div style={{ ...styles.alertBar, background: "var(--danger-light)", borderColor: "var(--danger-red)", color: "var(--danger-red)" }}>
            <span>🚨</span>
            <div>
              <strong>Active Immediate Emergency:</strong> You have {emergency} high-urgency trauma blood request(s)
              under processing by regional blood banks.
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid-cols-4" style={{ marginBottom: "30px" }}>
          <div className="card">
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>TOTAL REQUESTS</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "4px" }}>{total}</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Lifetime hospital requisitions</div>
          </div>

          <div className="card">
            <div style={{ fontSize: "12px", color: "var(--warning-amber)", fontWeight: "700" }}>AWAITING VERIFICATION</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--warning-amber)", marginTop: "4px" }}>{pending}</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Screening &amp; review queue</div>
          </div>

          <div className="card">
            <div style={{ fontSize: "12px", color: "var(--info-blue)", fontWeight: "700" }}>ACCEPTED / CROSS-MATCHING</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--info-blue)", marginTop: "4px" }}>{accepted}</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Lab match in progress</div>
          </div>

          <div className="card">
            <div style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: "700" }}>FULFILLED</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--success-green)", marginTop: "4px" }}>{fulfilled}</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Delivered to hospital</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {["ALL", "PENDING", "ACCEPTED", "FULFILLED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                border: "1px solid",
                backgroundColor: activeTab === tab ? "var(--dark-navy)" : "#fff",
                color: activeTab === tab ? "#fff" : "var(--dark-navy)",
                borderColor: activeTab === tab ? "var(--dark-navy)" : "var(--border-color)",
              }}
            >
              {tab === "ALL" ? "All Requests" : tab}
            </button>
          ))}
        </div>

        {/* Requests Management Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "50px" }}>
            <span style={{ fontSize: "36px" }}>📋</span>
            <h3 style={{ marginTop: "10px", color: "var(--dark-navy)" }}>No Requests in this Queue</h3>
          </div>
        ) : (
          <div className="healthcare-table-wrap">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>Request Reference</th>
                  <th>Urgency</th>
                  <th>Component &amp; Group</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Fulfilling Blood Bank</th>
                  <th>Allocated Units</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "var(--dark-navy)" }}>{r.requestId}</div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>
                        Case: <strong>{r.patientReference}</strong> • 📍 {r.deliveryLocation}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.urgency === "EMERGENCY_IMMEDIATE" ? "badge-danger" : r.urgency === "URGENT_24H" ? "badge-warning" : "badge-neutral"}`}>
                        {r.urgency.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={styles.bloodTag}>{r.bloodGroup}</span>
                        <span style={{ fontSize: "12.5px", fontWeight: "600" }}>{r.component?.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{r.unitsFulfilled || 0} / {r.unitsRequired}</strong> Units
                    </td>
                    <td>
                      <span className={`badge ${r.status === "FULFILLED" ? "badge-success" : r.status === "ACCEPTED" ? "badge-info" : r.status === "CANCELLED" ? "badge-neutral" : "badge-warning"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "12.5px" }}>
                      {r.fulfilledByBloodBank?.name || <span style={{ color: "var(--text-muted)" }}>Assigning regional center...</span>}
                    </td>
                    <td>
                      {r.allocatedUnits && r.allocatedUnits.length > 0 ? (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {r.allocatedUnits.map((u) => (
                            <span key={u._id || u} style={styles.unitPill}>
                              🏷️ {u.unitBarcode || "Unit"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94A3B8" }}>None allocated yet</span>
                      )}
                    </td>
                    <td>
                      {r.status !== "FULFILLED" && r.status !== "CANCELLED" && (
                        <button onClick={() => handleCancel(r._id)} className="btn btn-outline btn-sm" style={{ borderColor: "#CBD5E1", color: "#64748B" }}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE REQUEST MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--dark-navy)" }}>
                Hospital Blood Requisition
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: "24px" }}>
              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Hospital Facility</label>
                  <input
                    required
                    type="text"
                    value={newRequest.hospitalName}
                    onChange={(e) => setNewRequest({ ...newRequest, hospitalName: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>City</label>
                  <input
                    required
                    type="text"
                    value={newRequest.city}
                    onChange={(e) => setNewRequest({ ...newRequest, city: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Attending Requester (Doctor/Staff)</label>
                  <input
                    required
                    type="text"
                    value={newRequest.requesterName}
                    onChange={(e) => setNewRequest({ ...newRequest, requesterName: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Official Contact Number</label>
                  <input
                    required
                    type="tel"
                    value={newRequest.contact}
                    onChange={(e) => setNewRequest({ ...newRequest, contact: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div className="form-grid-3-resp" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Blood Group</label>
                  <select
                    value={newRequest.bloodGroup}
                    onChange={(e) => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}
                    style={styles.formInput}
                  >
                    {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Component</label>
                  <select
                    value={newRequest.component}
                    onChange={(e) => setNewRequest({ ...newRequest, component: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="PRBC">Packed Red Blood Cells (PRBC)</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="PLATELETS">Platelet Concentrate</option>
                    <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                    <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Units Required</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="10"
                    value={newRequest.unitsRequired}
                    onChange={(e) => setNewRequest({ ...newRequest, unitsRequired: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Clinical Urgency</label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="EMERGENCY_IMMEDIATE">🚨 Immediate Emergency (&lt; 2h)</option>
                    <option value="URGENT_24H">⚠️ Urgent (&lt; 24h)</option>
                    <option value="ROUTINE_SCHEDULED">📅 Routine Scheduled Surgery</option>
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Delivery Location / Bed</label>
                  <input
                    type="text"
                    value={newRequest.deliveryLocation}
                    onChange={(e) => setNewRequest({ ...newRequest, deliveryLocation: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.formLabel}>Clinical Notes &amp; Cross-Match Reference</label>
                <textarea
                  rows="2"
                  value={newRequest.clinicalNotes}
                  onChange={(e) => setNewRequest({ ...newRequest, clinicalNotes: e.target.value })}
                  style={{ ...styles.formInput, resize: "none" }}
                  placeholder="e.g. Major orthopedic surgical blood loss, cross-match antibody screening clear..."
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-navy">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Transmit Request to Blood Banks →
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
  alertBar: {
    padding: "14px 20px",
    borderRadius: "var(--radius-md)",
    borderLeft: "4px solid",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
  },
  bloodTag: {
    background: "var(--primary-red-light)",
    color: "var(--primary-red)",
    fontWeight: "800",
    fontSize: "12.5px",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  unitPill: {
    fontSize: "11px",
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    color: "#1E40AF",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "600",
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

export default HospitalDashboard;
