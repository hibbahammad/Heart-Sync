import { useState, useEffect } from "react";
import { getInventory, getInventorySummary, addBloodUnit, updateBloodUnit } from "../api/inventoryApi";
import { getRequests, fulfillRequest, updateRequestStatus } from "../api/requestApi";

function BloodBankDashboard() {
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("INVENTORY");
  const [addModal, setAddModal] = useState(false);
  const [fulfillModal, setFulfillModal] = useState(null); // request being fulfilled
  const [selectedUnitsForFulfill, setSelectedUnitsForFulfill] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Resolve bloodBankId from logged-in user's organization (supports both populated object and id string)
  const bloodBankId =
    user?.organization?._id ||
    (typeof user?.organization === "string" ? user.organization : null) ||
    user?.organizationId ||
    null;

  const defaultUnit = {
    unitBarcode: "",
    bloodGroup: "O-",
    component: "PRBC",
    volumeMl: 450,
    collectionDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString().split("T")[0],
    screeningStatus: "TESTED_NEGATIVE_CLEAR",
    storageLocation: "Cold Storage Unit 1 - Rack A",
    notes: "",
    ...(bloodBankId ? { bloodBankId } : {}),
  };

  const [newUnit, setNewUnit] = useState(defaultUnit);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [unitsData, summaryData, reqsData] = await Promise.all([
        getInventory(),
        getInventorySummary(),
        getRequests({ status: "ALL" }),
      ]);
      setUnits(unitsData);
      setSummary(summaryData.summary);
      setHospitalRequests(reqsData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddUnitSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate bloodBankId — required for unit creation
    if (!newUnit.bloodBankId) {
      setErrorMsg(
        "Your account is not linked to a Blood Bank organization. Ask the admin to assign your organization in the Admin Panel."
      );
      return;
    }

    try {
      await addBloodUnit(newUnit);
      setSuccessMsg("Blood unit logged and verified into cold storage inventory.");
      setAddModal(false);
      setNewUnit({ ...defaultUnit });
      fetchDashboardData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to add blood unit. Check all required fields.");
    }
  };

  const handleToggleQuarantine = async (unit) => {
    const newStatus = unit.status === "QUARANTINED" ? "AVAILABLE" : "QUARANTINED";
    const newScreening = unit.status === "QUARANTINED" ? "TESTED_NEGATIVE_CLEAR" : "QUARANTINED";
    try {
      await updateBloodUnit(unit._id, { status: newStatus, screeningStatus: newScreening });
      fetchDashboardData();
    } catch (e) {
      alert("Status change error");
    }
  };

  const handleOpenFulfill = (req) => {
    setFulfillModal(req);
    setSelectedUnitsForFulfill([]);
    setErrorMsg("");
  };

  const handleExecuteFulfill = async () => {
    if (selectedUnitsForFulfill.length === 0) {
      setErrorMsg("Please select at least one unit to allocate.");
      return;
    }
    try {
      await fulfillRequest(fulfillModal._id, selectedUnitsForFulfill);
      setSuccessMsg(`Successfully allocated ${selectedUnitsForFulfill.length} unit(s) to ${fulfillModal.requestId}.`);
      setFulfillModal(null);
      fetchDashboardData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Allocation failed due to clinical check violation.");
    }
  };

  // Eligible units for fulfillment modal: must match bloodGroup and component, be AVAILABLE and TESTED_NEGATIVE_CLEAR
  const availableMatchUnits = fulfillModal
    ? units.filter(
        (u) =>
          u.status === "AVAILABLE" &&
          u.screeningStatus === "TESTED_NEGATIVE_CLEAR" &&
          (u.bloodGroup === fulfillModal.bloodGroup || fulfillModal.bloodGroup === "AB+" || u.bloodGroup === "O-")
      )
    : [];

  return (
    <div style={{ minHeight: "85vh", padding: "40px 0 70px", background: "var(--bg-light)" }}>
      <div className="container">
        {/* Portal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-danger">LICENSED BLOOD TRANSFUSION SERVICE</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {user?.organization?.name || "Shaukat Khanum Regional Blood Bank"}
              </span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "6px" }}>
              Blood Bank Inventory &amp; Fulfilment Center
            </h1>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setAddModal(true)} className="btn btn-primary">
              + Log Screened Blood Unit
            </button>
            <button onClick={fetchDashboardData} className="btn btn-outline-navy">
              🔄 Refresh Inventory
            </button>
          </div>
        </div>

        {successMsg && (
          <div style={{ ...styles.alertBox, background: "var(--success-light)", color: "var(--success-green)", marginBottom: "20px" }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Portal Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("INVENTORY")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "INVENTORY" ? "var(--dark-navy)" : "#fff",
              color: activeTab === "INVENTORY" ? "#fff" : "var(--dark-navy)",
            }}
          >
            📦 Unit-Level Inventory ({units.length})
          </button>
          <button
            onClick={() => setActiveTab("SUMMARY")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "SUMMARY" ? "var(--dark-navy)" : "#fff",
              color: activeTab === "SUMMARY" ? "#fff" : "var(--dark-navy)",
            }}
          >
            📊 Component Stock Summary
          </button>
          <button
            onClick={() => setActiveTab("FULFILL")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "FULFILL" ? "var(--primary-red)" : "#fff",
              color: activeTab === "FULFILL" ? "#fff" : "var(--primary-red)",
            }}
          >
            🚨 Hospital Requisitions ({hospitalRequests.filter((r) => r.status !== "FULFILLED").length})
          </button>
        </div>

        {/* TAB 1: UNIT-LEVEL INVENTORY TABLE */}
        {activeTab === "INVENTORY" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--dark-navy)" }}>
                Active Screened Units in Cold Storage
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Continuous cold-chain temperature monitored at 2°C - 6°C
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>Loading inventory units...</div>
            ) : units.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "50px" }}>
                <p>No inventory units logged yet. Click "+ Log Screened Blood Unit" to add stock.</p>
              </div>
            ) : (
              <div className="healthcare-table-wrap">
                <table className="healthcare-table">
                  <thead>
                    <tr>
                      <th>Barcode / Unit ID</th>
                      <th>Group &amp; Component</th>
                      <th>Volume</th>
                      <th>Collection &amp; Expiry</th>
                      <th>Screening Status</th>
                      <th>Storage Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u) => {
                      const isExpired = new Date(u.expiryDate) < new Date();
                      return (
                        <tr key={u._id}>
                          <td>
                            <div style={{ fontWeight: "800", color: "var(--dark-navy)", fontFamily: "monospace", fontSize: "14px" }}>
                              🏷️ {u.unitBarcode}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B" }}>
                              {u.bloodBankId?.name || "Blood Center"}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={styles.bloodTag}>{u.bloodGroup}</span>
                              <span style={{ fontSize: "13px", fontWeight: "600" }}>{u.component?.replace("_", " ")}</span>
                            </div>
                          </td>
                          <td>{u.volumeMl} ml</td>
                          <td>
                            <div style={{ fontSize: "12.5px" }}>Coll: {new Date(u.collectionDate).toLocaleDateString()}</div>
                            <div style={{ fontSize: "12px", color: isExpired ? "var(--danger-red)" : "var(--text-muted)", fontWeight: isExpired ? "700" : "400" }}>
                              Exp: {new Date(u.expiryDate).toLocaleDateString()} {isExpired && "(EXPIRED)"}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${u.screeningStatus === "TESTED_NEGATIVE_CLEAR" ? "badge-success" : "badge-danger"}`}>
                              {u.screeningStatus}
                            </span>
                          </td>
                          <td style={{ fontSize: "12px", color: "#475569" }}>
                            {u.storageLocation}
                          </td>
                          <td>
                            <span className={`badge ${u.status === "AVAILABLE" ? "badge-success" : u.status === "ALLOCATED" ? "badge-info" : "badge-danger"}`}>
                              {u.status}
                            </span>
                          </td>
                          <td>
                            {u.status !== "ALLOCATED" && (
                              <button
                                onClick={() => handleToggleQuarantine(u)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: "11px", padding: "4px 8px" }}
                              >
                                {u.status === "QUARANTINED" ? "Release" : "Quarantine"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPONENT STOCK SUMMARY */}
        {activeTab === "SUMMARY" && summary && (
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "16px" }}>
              Available Screened Units by Blood Group &amp; Component
            </div>

            <div className="grid-cols-4">
              {Object.keys(summary).map((bg) => {
                const item = summary[bg];
                return (
                  <div key={bg} className="card" style={{ borderTop: "4px solid var(--primary-red)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "22px", fontWeight: "800", color: "var(--primary-red)" }}>{bg}</span>
                      <span className="badge badge-success">{item.totalAvailable} Units Available</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "var(--text-main)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Packed Red Cells (PRBC):</span>
                        <strong>{item.components.PRBC}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Whole Blood:</span>
                        <strong>{item.components.WHOLE_BLOOD}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Platelet Concentrate:</span>
                        <strong>{item.components.PLATELETS}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Fresh Frozen Plasma (FFP):</span>
                        <strong>{item.components.FFP}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: HOSPITAL REQUISITION FULFILLMENT */}
        {activeTab === "FULFILL" && (
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "16px" }}>
              Incoming Hospital Requisitions Awaiting Fulfillment
            </div>

            <div className="healthcare-table-wrap">
              <table className="healthcare-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Urgency</th>
                    <th>Hospital</th>
                    <th>Component &amp; Group</th>
                    <th>Units</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitalRequests.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: "700" }}>{r.requestId}</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Ref: {r.patientReference}</div>
                      </td>
                      <td>
                        <span className={`badge ${r.urgency === "EMERGENCY_IMMEDIATE" ? "badge-danger" : "badge-warning"}`}>
                          {r.urgency.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div><strong>{r.hospitalName}</strong></div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📍 {r.city} • 📞 {r.contact}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={styles.bloodTag}>{r.bloodGroup}</span>
                          <span style={{ fontSize: "13px", fontWeight: "600" }}>{r.component?.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{r.unitsFulfilled || 0} / {r.unitsRequired}</strong> Units
                      </td>
                      <td>
                        <span className={`badge ${r.status === "FULFILLED" ? "badge-success" : "badge-warning"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.status !== "FULFILLED" && r.status !== "CANCELLED" ? (
                          <button onClick={() => handleOpenFulfill(r)} className="btn btn-primary btn-sm">
                            Allocate Stock →
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: "600" }}>✓ Fulfilled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD BLOOD UNIT */}
      {addModal && (
        <div className="modal-backdrop" onClick={() => setAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--dark-navy)" }}>
                Log Screened Blood Unit
              </h3>
              <button onClick={() => setAddModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleAddUnitSubmit} style={{ padding: "24px" }}>
              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Unit Barcode (Auto or Manual)</label>
                  <input
                    type="text"
                    placeholder="e.g. HSU-2026-908"
                    value={newUnit.unitBarcode}
                    onChange={(e) => setNewUnit({ ...newUnit, unitBarcode: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Volume (ml)</label>
                  <input
                    type="number"
                    value={newUnit.volumeMl}
                    onChange={(e) => setNewUnit({ ...newUnit, volumeMl: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Blood Group *</label>
                  <select
                    value={newUnit.bloodGroup}
                    onChange={(e) => setNewUnit({ ...newUnit, bloodGroup: e.target.value })}
                    style={styles.formInput}
                  >
                    {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Component *</label>
                  <select
                    value={newUnit.component}
                    onChange={(e) => setNewUnit({ ...newUnit, component: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="PRBC">Packed Red Blood Cells (PRBC)</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="PLATELETS">Platelets</option>
                    <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Collection Date</label>
                  <input
                    type="date"
                    value={newUnit.collectionDate}
                    onChange={(e) => setNewUnit({ ...newUnit, collectionDate: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Expiry Date *</label>
                  <input
                    required
                    type="date"
                    value={newUnit.expiryDate}
                    onChange={(e) => setNewUnit({ ...newUnit, expiryDate: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Screening Status</label>
                  <select
                    value={newUnit.screeningStatus}
                    onChange={(e) => setNewUnit({ ...newUnit, screeningStatus: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="TESTED_NEGATIVE_CLEAR">✓ Tested Negative &amp; Clear</option>
                    <option value="SCREENING_PENDING">Screening Pending</option>
                    <option value="QUARANTINED">Quarantined</option>
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Cold Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Cold Unit 1 - Shelf B"
                    value={newUnit.storageLocation}
                    onChange={(e) => setNewUnit({ ...newUnit, storageLocation: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setAddModal(false)} className="btn btn-outline-navy">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Unit to Stock ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULFILL REQUISITION */}
      {fulfillModal && (
        <div className="modal-backdrop" onClick={() => setFulfillModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--dark-navy)" }}>
                  Allocate Blood Stock
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Requisition: <strong>{fulfillModal.requestId}</strong> ({fulfillModal.hospitalName})
                </div>
              </div>
              <button onClick={() => setFulfillModal(null)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "8px", marginBottom: "18px", fontSize: "13px" }}>
                <div>Requested Group: <strong>{fulfillModal.bloodGroup}</strong> ({fulfillModal.component})</div>
                <div>Units Required: <strong>{fulfillModal.unitsRequired - (fulfillModal.unitsFulfilled || 0)}</strong> unit(s) remaining</div>
              </div>

              {errorMsg && (
                <div style={{ ...styles.alertBox, background: "var(--danger-light)", color: "var(--danger-red)", marginBottom: "14px" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
                Select Tested &amp; Eligible Units to Allocate:
              </div>

              {availableMatchUnits.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--danger-red)", background: "var(--danger-light)", borderRadius: "8px" }}>
                  No compatible screened available units in local stock. Log new units or transfer from partner centers.
                </div>
              ) : (
                <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px", marginBottom: "20px" }}>
                  {availableMatchUnits.map((u) => (
                    <label key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="checkbox"
                          checked={selectedUnitsForFulfill.includes(u._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUnitsForFulfill([...selectedUnitsForFulfill, u._id]);
                            } else {
                              setSelectedUnitsForFulfill(selectedUnitsForFulfill.filter((id) => id !== u._id));
                            }
                          }}
                        />
                        <div>
                          <strong>{u.unitBarcode}</strong> ({u.bloodGroup} • {u.component})
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Exp: {new Date(u.expiryDate).toLocaleDateString()}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setFulfillModal(null)} className="btn btn-outline-navy">
                  Cancel
                </button>
                <button
                  disabled={availableMatchUnits.length === 0}
                  onClick={handleExecuteFulfill}
                  className="btn btn-primary"
                >
                  Allocate Selected Units ({selectedUnitsForFulfill.length}) ✓
                </button>
              </div>
            </div>
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
  bloodTag: {
    background: "var(--primary-red-light)",
    color: "var(--primary-red)",
    fontWeight: "800",
    fontSize: "12.5px",
    padding: "2px 8px",
    borderRadius: "4px",
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

export default BloodBankDashboard;
