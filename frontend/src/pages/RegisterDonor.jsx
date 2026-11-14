import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { addDonor } from "../api/donorApi";
import { getOrganizations } from "../api/organizationApi";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const contactMethods = ["PHONE", "SMS", "WHATSAPP", "EMAIL"];

function RegisterDonor() {
  const [centers, setCenters] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "Lahore",
    area: "",
    bloodGroup: "O+",
    lastDonationDate: "",
    preferredCenter: "",
    preferredContactMethod: "PHONE",
    available: true,
    medicalDisclaimerAck: false,
    privacyConsent: false,
  });

  useEffect(() => {
    getOrganizations({ type: "BLOOD_BANK" })
      .then((data) => setCenters(data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
        setErrorMsg("Please complete all personal details before proceeding.");
        return;
      }
    }
    if (step === 2) {
      if (!form.city.trim() || !form.bloodGroup) {
        setErrorMsg("Please provide your city and blood group.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setErrorMsg("");
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.medicalDisclaimerAck || !form.privacyConsent) {
      setErrorMsg("You must accept the clinical safety disclaimer and privacy consent to register.");
      return;
    }

    setLoading(true);
    try {
      const res = await addDonor(form);
      setSuccessData(res.donor);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit registration. Please verify details.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "85vh", padding: "50px 0 80px", background: "var(--bg-light)" }}>
      <div className="container" style={{ maxWidth: "760px" }}>
        {/* Title Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="badge badge-danger">VOLUNTARY BLOOD DONOR ENROLLMENT</span>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "10px" }}>
            Register as a Voluntary Donor
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14.5px", maxWidth: "560px", margin: "8px auto 0" }}>
            Become part of Pakistan's emergency blood reserve. Your voluntary pledge connects with
            trauma centers when lives hang in the balance.
          </p>
        </div>

        {/* Step Progression Bar */}
        {!successData && (
          <div style={styles.stepProgressContainer}>
            <div style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, background: step >= 1 ? "var(--primary-red)" : "#CBD5E1" }}>1</div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: step >= 1 ? "var(--dark-navy)" : "#94A3B8" }}>
                Personal Info
              </span>
            </div>
            <div style={{ ...styles.stepLine, background: step >= 2 ? "var(--primary-red)" : "#E2E8F0" }} />
            <div style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, background: step >= 2 ? "var(--primary-red)" : "#CBD5E1" }}>2</div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: step >= 2 ? "var(--dark-navy)" : "#94A3B8" }}>
                Location & Blood
              </span>
            </div>
            <div style={{ ...styles.stepLine, background: step >= 3 ? "var(--primary-red)" : "#E2E8F0" }} />
            <div style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, background: step >= 3 ? "var(--primary-red)" : "#CBD5E1" }}>3</div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: step >= 3 ? "var(--dark-navy)" : "#94A3B8" }}>
                Clinical Consent
              </span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="card" style={{ padding: "36px" }}>
          {errorMsg && (
            <div style={{ ...styles.alertBox, background: "var(--danger-light)", color: "var(--danger-red)" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successData ? (
            /* Success State */
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div style={{ fontSize: "52px", marginBottom: "14px" }}>🎉</div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--dark-navy)" }}>
                Voluntary Enrollment Confirmed!
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px", maxWidth: "520px", margin: "8px auto 20px" }}>
                Thank you for pledging to save lives. You have been assigned a secure voluntary donor reference:
              </p>

              <div style={styles.donorRefBox}>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>YOUR UNIQUE DONOR REFERENCE</div>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--primary-red)", letterSpacing: "1px" }}>
                  {successData.donorRefId}
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                  Blood Group: <strong>{successData.bloodGroup}</strong> • City: <strong>{successData.city}</strong>
                </div>
              </div>

              <div className="medical-alert-banner" style={{ textAlign: "left", marginTop: "24px" }}>
                <span>ℹ️</span>
                <div>
                  <strong>Next Steps:</strong> When an emergency match arises, an authorized hospital or blood bank will
                  coordinate with you via <strong>{form.preferredContactMethod}</strong>. Final medical screening (Hb count,
                  vital signs, and serological cross-match) will occur at the collection facility.
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px" }}>
                <Link to="/donors" className="btn btn-primary">
                  View Donors Directory
                </Link>
                <Link to="/" className="btn btn-outline-navy">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            /* Multi-step Form */
            <form onSubmit={handleSubmit}>
              {/* STEP 1: Personal Profile */}
              {step === 1 && (
                <div className="animate-fade">
                  <h3 style={styles.formSectionTitle}>Step 1: Personal & Contact Information</h3>
                  <p style={styles.formSectionSub}>
                    We collect only essential identification details to securely coordinate during blood crises.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                    <div>
                      <label style={styles.label}>Full Name (as per CNIC / Official ID) *</label>
                      <input
                        required
                        type="text"
                        name="name"
                        placeholder="e.g. Muhammad Usman"
                        value={form.name}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>

                    <div className="form-grid-2">
                      <div>
                        <label style={styles.label}>Email Address *</label>
                        <input
                          required
                          type="email"
                          name="email"
                          placeholder="e.g. usman@example.com"
                          value={form.email}
                          onChange={handleChange}
                          style={styles.input}
                        />
                      </div>
                      <div>
                        <label style={styles.label}>Mobile Phone Number (Active) *</label>
                        <input
                          required
                          type="tel"
                          name="phone"
                          placeholder="e.g. +92 300 1234567"
                          value={form.phone}
                          onChange={handleChange}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={styles.label}>Date of Birth (Optional - Must be 18+ to donate)</label>
                      <input
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
                    <button type="button" onClick={handleNext} className="btn btn-primary">
                      Next: Location & Blood Group →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Location & Blood Type */}
              {step === 2 && (
                <div className="animate-fade">
                  <h3 style={styles.formSectionTitle}>Step 2: Location & Blood Group</h3>
                  <p style={styles.formSectionSub}>
                    Helps trauma centers near your vicinity find you quickly in critical hours.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                    <div className="form-grid-2">
                      <div>
                        <label style={styles.label}>City *</label>
                        <input
                          required
                          type="text"
                          name="city"
                          placeholder="e.g. Lahore"
                          value={form.city}
                          onChange={handleChange}
                          style={styles.input}
                        />
                      </div>
                      <div>
                        <label style={styles.label}>Area / Sector (Optional)</label>
                        <input
                          type="text"
                          name="area"
                          placeholder="e.g. Johar Town / Gulberg"
                          value={form.area}
                          onChange={handleChange}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div>
                        <label style={styles.label}>Blood Group (if known) *</label>
                        <select
                          name="bloodGroup"
                          value={form.bloodGroup}
                          onChange={handleChange}
                          style={styles.input}
                        >
                          {bloodGroups.map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={styles.label}>Preferred Contact Method</label>
                        <select
                          name="preferredContactMethod"
                          value={form.preferredContactMethod}
                          onChange={handleChange}
                          style={styles.input}
                        >
                          {contactMethods.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={styles.label}>Preferred Regional Donation Center (Optional)</label>
                      <select
                        name="preferredCenter"
                        value={form.preferredCenter}
                        onChange={handleChange}
                        style={styles.input}
                      >
                        <option value="">Any Nearby Certified Blood Center</option>
                        {centers.map((c) => (
                          <option key={c._id} value={c._id}>{c.name} ({c.city})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={styles.label}>Last Blood Donation Date (if any)</label>
                      <input
                        type="date"
                        name="lastDonationDate"
                        value={form.lastDonationDate}
                        onChange={handleChange}
                        style={styles.input}
                      />
                      <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                        Standard clinical rest period between whole blood donations is at least 3 months (90 days).
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
                    <button type="button" onClick={handlePrev} className="btn btn-outline-navy">
                      ← Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn btn-primary">
                      Next: Clinical Consent →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Clinical Consent & Disclaimers */}
              {step === 3 && (
                <div className="animate-fade">
                  <h3 style={styles.formSectionTitle}>Step 3: Clinical Consent & Privacy Acknowledgement</h3>
                  <p style={styles.formSectionSub}>
                    Please review and accept standard clinical transfusion governance rules.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                    <div style={styles.consentCard}>
                      <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer" }}>
                        <input
                          required
                          type="checkbox"
                          name="medicalDisclaimerAck"
                          checked={form.medicalDisclaimerAck}
                          onChange={handleChange}
                          style={{ marginTop: "3px", width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "13.5px", color: "var(--text-main)", lineHeight: "1.6" }}>
                          <strong>Clinical Eligibility Disclaimer:</strong> I acknowledge that voluntary registration on
                          Heart Sync does <em>not</em> constitute a medical certification of donor fitness. Final clinical
                          eligibility (vital signs, Hb &gt; 12.5 g/dL, negative infection screening) will be determined by
                          certified clinical transfusion staff at the hospital or blood bank.
                        </span>
                      </label>
                    </div>

                    <div style={styles.consentCard}>
                      <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer" }}>
                        <input
                          required
                          type="checkbox"
                          name="privacyConsent"
                          checked={form.privacyConsent}
                          onChange={handleChange}
                          style={{ marginTop: "3px", width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "13.5px", color: "var(--text-main)", lineHeight: "1.6" }}>
                          <strong>Privacy &amp; Data Consent:</strong> I agree that my blood group and general locality may be
                          listed in the protected voluntary donor registry. My raw phone number and email will remain masked
                          and only shared with verified clinical staff during active hospital blood shortages.
                        </span>
                      </label>
                    </div>

                    <div style={{ padding: "12px 16px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "13.5px", color: "var(--dark-navy)" }}>Current Availability</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>You can toggle this off anytime if you are traveling or medically unfit.</div>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                        <input
                          type="checkbox"
                          name="available"
                          checked={form.available}
                          onChange={handleChange}
                          style={{ width: "18px", height: "18px" }}
                        />
                        Available Now
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
                    <button type="button" onClick={handlePrev} className="btn btn-outline-navy">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "12px 28px" }}>
                      {loading ? "Submitting Registration..." : "Complete Voluntary Registration ✓"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  stepProgressContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "28px",
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  stepCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px",
  },
  stepLine: {
    height: "2px",
    width: "70px",
    margin: "0 10px 18px",
  },
  formSectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--dark-navy)",
  },
  formSectionSub: {
    fontSize: "13.5px",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
  label: {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  },
  consentCard: {
    background: "#F8FAFC",
    border: "1px solid var(--border-color)",
    padding: "16px",
    borderRadius: "var(--radius-md)",
  },
  alertBox: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13.5px",
    marginBottom: "20px",
  },
  donorRefBox: {
    background: "var(--primary-red-light)",
    border: "1px dashed var(--primary-red-muted)",
    padding: "18px",
    borderRadius: "10px",
    maxWidth: "400px",
    margin: "0 auto",
  },
};

export default RegisterDonor;