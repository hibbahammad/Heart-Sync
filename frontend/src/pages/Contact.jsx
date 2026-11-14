import { useState } from "react";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "85vh", paddingBottom: "70px" }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container">
          <span className="badge badge-danger">24/7 COORDINATION &amp; DISPATCH</span>
          <h1 className="page-header-title">Contact Heart Sync Support</h1>
          <p style={styles.headerSub}>
            Reach out to our emergency coordination desk, hospital onboarding department, or voluntary donor support team.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "40px", maxWidth: "980px" }}>
        <div className="contact-layout-grid">
          {/* Left Emergency Contacts */}
          <div>
            <div className="card" style={{ padding: "28px", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", color: "var(--primary-red)", fontWeight: "800", textTransform: "uppercase", marginBottom: "6px" }}>
                Emergency Hotline
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--dark-navy)", marginBottom: "8px" }}>
                24/7 Trauma Dispatch
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Dedicated to urgent hospital cross-match allocations and acute surgical hemorrhage requirements.
              </p>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#64748B", background: "#F1F5F9", padding: "12px", borderRadius: "8px", textAlign: "center", border: "1px dashed #CBD5E1" }}>
                📞 Dedicated Emergency Hotline: [Pending Configuration]
              </div>
            </div>

            <div className="card" style={{ padding: "28px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "14px" }}>
                Operational Desks
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                <div>
                  <strong>Hospital Onboarding Desk:</strong><br />
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>[Pending Organization Email Configuration]</span>
                </div>
                <div>
                  <strong>Blood Bank Compliance Desk:</strong><br />
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>[Pending Organization Email Configuration]</span>
                </div>
                <div>
                  <strong>Voluntary Donor Outreach:</strong><br />
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>[Pending Organization Email Configuration]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--dark-navy)", marginBottom: "6px" }}>
              Submit an Official Inquiry
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              For general administrative inquiries, partnership requests, or feedback.
            </p>

            {submitted ? (
              <div style={{ padding: "20px", background: "var(--info-light, #EFF6FF)", border: "1px solid #BFDBFE", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--dark-navy)", fontWeight: "700", fontSize: "15px" }}>
                  <span>ℹ️</span> Inquiry Captured Locally
                </div>
                <p style={{ fontSize: "13.5px", color: "#334155", lineHeight: "1.5", marginBottom: "12px" }}>
                  Notice: Dedicated operational hotlines and production email routing are currently awaiting institutional configuration.
                  Your inquiry details have been safely captured in this session.
                </p>
                <div style={{ background: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "16px" }}>
                  Official verified phone lines and department email addresses will be published upon institutional deployment.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="btn btn-outline-navy btn-sm"
                >
                  ← Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={styles.formLabel}>Your Full Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div className="form-grid-2">
                  <div>
                    <label style={styles.formLabel}>Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Contact Phone *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.formLabel}>Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Hospital Integration / Camp Organization"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.formLabel}>Message *</label>
                  <textarea
                    required
                    rows="4"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ ...styles.input, resize: "none" }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: "12px", width: "100%" }}>
                  Send Message →
                </button>
              </form>
            )}
          </div>
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
  formLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box",
  },
};

export default Contact;
