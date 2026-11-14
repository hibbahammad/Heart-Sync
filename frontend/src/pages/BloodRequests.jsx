import { useState, useEffect } from "react";
import { getRequests, createRequest } from "../api/requestApi";

const bloodGroups = ["ALL", "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const components = ["WHOLE_BLOOD", "PRBC", "PLATELETS", "FFP", "CRYOPRECIPITATE"];
const urgencies = ["ALL", "EMERGENCY_IMMEDIATE", "URGENT_24H", "ROUTINE_SCHEDULED"];

function BloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [filters, setFilters] = useState({
    status: "ALL",
    bloodGroup: "ALL",
    urgency: "ALL",
    city: "",
  });

  const [form, setForm] = useState({
    hospitalName: "",
    city: "Lahore",
    requesterName: "",
    contact: "",
    bloodGroup: "O-",
    component: "PRBC",
    unitsRequired: 1,
    urgency: "URGENT_24H",
    deliveryLocation: "",
    clinicalNotes: "",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRequests(filters);
      setRequests(data);
    } catch (e) {
      console.error(e);
      setRequests([]);
    }
    setLoading(false);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await createRequest(form);
      setSuccessMsg("Blood request submitted successfully to regional blood bank network.");
      setShowModal(false);
      setForm({
        hospitalName: "",
        city: "Lahore",
        requesterName: "",
        contact: "",
        bloodGroup: "O-",
        component: "PRBC",
        unitsRequired: 1,
        urgency: "URGENT_24H",
        deliveryLocation: "",
        clinicalNotes: "",
      });
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create blood request.");
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUBMITTED": return <span className="badge badge-warning">Submitted • Awaiting Verification</span>;
      case "UNDER_VERIFICATION": return <span className="badge badge-info">Under Clinical Verification</span>;
      case "ACCEPTED": return <span className="badge badge-info">Accepted • Cross-matching</span>;
      case "PARTIALLY_FULFILLED": return <span className="badge badge-warning">Partially Fulfilled</span>;
      case "FULFILLED": return <span className="badge badge-success">✓ Fulfilled</span>;
      case "REJECTED": return <span className="badge badge-danger">Rejected</span>;
      case "CANCELLED": return <span className="badge badge-neutral">Cancelled</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === "EMERGENCY_IMMEDIATE") {
      return <span className="badge badge-danger">🚨 IMMEDIATE EMERGENCY</span>;
    }
    if (urgency === "URGENT_24H") {
      return <span className="badge badge-warning">⚠️ Urgent (&lt; 24h)</span>;
    }
    return <span className="badge badge-neutral">📅 Routine Scheduled</span>;
  };

  return (
    <div style={{ minHeight: "85vh", paddingBottom: "70px" }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container" style={styles.headerFlex}>
          <div>
            <span className="badge badge-danger">CLINICAL TRIAGE &amp; DISPATCH</span>
            <h1 className="page-header-title">Hospital Blood Requests</h1>
            <p style={styles.headerSub}>
              Active emergency requests submitted by authorized hospital trauma centers, surgical departments,
              and critical care units across Pakistan.
            </p>
          </div>
          <div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: "13px 26px" }}>
              + Submit Hospital Blood Request
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "30px" }}>
        {/* Notice */}
        <div className="medical-alert-banner">
          <span style={{ fontSize: "18px" }}>🛡️</span>
          <div>
            <strong>Patient Privacy Compliance:</strong> In accordance with medical ethics, patient identifying names
            and clinical diagnoses are anonymized to clinical codes. Only verified authorized hospital personnel and
            attending blood banks can access confidential patient cross-match records.
          </div>
        </div>

        {successMsg && (
          <div style={{ ...styles.alertBox, background: "var(--success-light)", color: "var(--success-green)", marginBottom: "20px" }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Filters bar */}
        <div className="card" style={{ padding: "18px 24px", marginBottom: "24px" }}>
          <div className="filter-bar-grid">
            <div>
              <label style={styles.filterLabel}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={styles.filterInput}
              >
                <option value="ALL">All Request Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_VERIFICATION">Under Verification</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="FULFILLED">Fulfilled</option>
              </select>
            </div>

            <div>
              <label style={styles.filterLabel}>Blood Group</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                style={styles.filterInput}
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg === "ALL" ? "All Blood Groups" : bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.filterLabel}>Urgency</label>
              <select
                value={filters.urgency}
                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                style={styles.filterInput}
              >
                {urgencies.map((u) => (
                  <option key={u} value={u}>{u.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.filterLabel}>City</label>
              <input
                type="text"
                placeholder="Filter city..."
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                style={styles.filterInput}
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ display: "inline-block", width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "var(--primary-red)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Loading hospital blood requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
            <span style={{ fontSize: "36px" }}>📋</span>
            <h3 style={{ marginTop: "10px", color: "var(--dark-navy)" }}>No Blood Requests Found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              No requests match your current filters.
            </p>
          </div>
        ) : (
          <div className="healthcare-table-wrap">
            <table className="healthcare-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Urgency</th>
                  <th>Hospital &amp; Location</th>
                  <th>Blood Group &amp; Component</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "var(--dark-navy)", fontSize: "13.5px" }}>
                        {r.requestId || `REQ-${r._id.slice(-4)}`}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>
                        Case: {r.patientReference || "PT-REF"}
                      </div>
                    </td>
                    <td>{getUrgencyBadge(r.urgency)}</td>
                    <td>
                      <div style={{ fontWeight: "600", color: "var(--dark-navy)" }}>{r.hospitalName}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📍 {r.city} • {r.deliveryLocation || "Emergency OT"}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={styles.bloodTag}>{r.bloodGroup}</span>
                        <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#334155" }}>
                          {r.component?.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "700", fontSize: "14px" }}>
                        {r.unitsFulfilled || 0} / {r.unitsRequired} Units
                      </div>
                      <div style={{ fontSize: "11px", color: r.unitsFulfilled >= r.unitsRequired ? "var(--success-green)" : "var(--primary-red)" }}>
                        {r.unitsFulfilled >= r.unitsRequired ? "Complete" : `${r.unitsRequired - (r.unitsFulfilled || 0)} required`}
                      </div>
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                      {new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--dark-navy)" }}>
                  Submit Emergency Hospital Blood Request
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Transfusion requisition for regional blood bank fulfillment
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: "24px" }}>
              {errorMsg && (
                <div style={{ ...styles.alertBox, background: "var(--danger-light)", color: "var(--danger-red)" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateSubmit}>
                <div className="form-grid-2" style={{ marginBottom: "16px" }}>
                  <div>
                    <label style={styles.formLabel}>Hospital / Healthcare Facility *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Mayo Hospital Trauma Center"
                      value={form.hospitalName}
                      onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>City *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Lahore"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: "16px" }}>
                  <div>
                    <label style={styles.formLabel}>Authorized Requester (Doctor/Staff) *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dr. Farhan Qureshi"
                      value={form.requesterName}
                      onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Official Hospital Phone / Ext *</label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. +92 42 99211100"
                      value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div className="form-grid-3-resp" style={{ marginBottom: "16px" }}>
                  <div>
                    <label style={styles.formLabel}>Blood Group *</label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      style={styles.modalInput}
                    >
                      {bloodGroups.filter(bg => bg !== "ALL").map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.formLabel}>Component *</label>
                    <select
                      value={form.component}
                      onChange={(e) => setForm({ ...form, component: e.target.value })}
                      style={styles.modalInput}
                    >
                      {components.map((c) => (
                        <option key={c} value={c}>{c.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.formLabel}>Units Required *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="20"
                      value={form.unitsRequired}
                      onChange={(e) => setForm({ ...form, unitsRequired: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: "16px" }}>
                  <div>
                    <label style={styles.formLabel}>Clinical Urgency *</label>
                    <select
                      value={form.urgency}
                      onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                      style={styles.modalInput}
                    >
                      <option value="EMERGENCY_IMMEDIATE">🚨 Immediate Emergency (&lt; 2h)</option>
                      <option value="URGENT_24H">⚠️ Urgent (&lt; 24h)</option>
                      <option value="ROUTINE_SCHEDULED">📅 Routine Scheduled Surgery</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.formLabel}>Delivery Location / Desk</label>
                    <input
                      type="text"
                      placeholder="e.g. ICU Room 3 / Surgical OT"
                      value={form.deliveryLocation}
                      onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.formLabel}>Clinical Notes &amp; Patient Cross-match Reference</label>
                  <textarea
                    rows="2"
                    placeholder="Enter relevant cross-matching specifications or surgical timeline (Do not include patient CNIC or raw identity)..."
                    value={form.clinicalNotes}
                    onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })}
                    style={{ ...styles.modalInput, resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-navy">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: "11px 24px" }}>
                    {submitting ? "Transmitting Requisition..." : "Submit Clinical Blood Request →"}
                  </button>
                </div>
              </form>
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
  headerFlex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
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
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  filterLabel: {
    display: "block",
    fontSize: "11.5px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    textTransform: "uppercase",
    marginBottom: "5px",
  },
  filterInput: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  },
  bloodTag: {
    display: "inline-block",
    background: "var(--primary-red-light)",
    color: "var(--primary-red)",
    fontWeight: "800",
    fontSize: "13px",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "1px solid var(--primary-red-muted)",
  },
  formLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    marginBottom: "5px",
  },
  modalInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box",
  },
  alertBox: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13.5px",
    marginBottom: "16px",
  },
};

export default BloodRequests;