function Accessibility() {
  return (
    <div style={{ minHeight: "85vh", padding: "50px 0 80px" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        <span className="badge badge-info">DIGITAL INCLUSIVITY</span>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "10px", marginBottom: "20px" }}>
          Accessibility Statement
        </h1>

        <div className="card" style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "20px", lineHeight: "1.8" }}>
          <p style={{ color: "var(--text-main)", fontSize: "14.5px" }}>
            Heart Sync is committed to ensuring that critical healthcare platforms are accessible to all individuals,
            including users with visual, auditory, cognitive, and motor impairments.
          </p>

          <section>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "6px" }}>
              Key Accessibility Standards
            </h3>
            <ul style={{ paddingLeft: "20px", color: "var(--text-muted)", fontSize: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>High-contrast color palettes complying with WCAG 2.1 AA standards.</li>
              <li>Clear typographic hierarchy with responsive font scaling for readability.</li>
              <li>Descriptive text and ARIA labels on all critical emergency triage buttons.</li>
              <li>Keyboard navigable menus, forms, and dialog overlays.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Accessibility;
