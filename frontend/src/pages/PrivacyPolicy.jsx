function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "85vh", padding: "50px 0 80px" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        <span className="badge badge-danger">HEALTHCARE DATA PRIVACY</span>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "10px", marginBottom: "20px" }}>
          Healthcare Data Privacy &amp; Confidentiality Policy
        </h1>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "30px" }}>
          Effective: January 2026 • Compliant with National Transfusion Guidelines &amp; Ethical Standards
        </div>

        <div className="card" style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "24px", lineHeight: "1.8" }}>
          <section>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
              1. Donor Contact Information Minimization
            </h3>
            <p style={{ color: "var(--text-main)", fontSize: "14.5px" }}>
              Heart Sync never displays raw personal telephone numbers, private residential addresses, or precise GPS coordinates
              to the general public or unauthenticated web visitors. Public registries display only the donor's first name,
              city/area, and blood group. Full contact details are accessible strictly to authenticated and licensed hospital
              transfusion coordinators during active, verified emergency shortages.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
              2. Patient Identity Protection &amp; Anonymization
            </h3>
            <p style={{ color: "var(--text-main)", fontSize: "14.5px" }}>
              Emergency blood requests submitted by hospitals reference anonymous clinical identifiers (e.g. <code>PT-MAY-901</code>)
              rather than a patient's national identity card number, surname, or full medical chart. Transfusion compatibility
              data remains confidential between the attending hospital and the fulfilling blood bank.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
              3. Right to Withdraw &amp; Data Deletion
            </h3>
            <p style={{ color: "var(--text-main)", fontSize: "14.5px" }}>
              Voluntary donors hold the absolute right to deactivate their availability status or request total removal of
              their profile from our active matching registry at any time without penalty.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
