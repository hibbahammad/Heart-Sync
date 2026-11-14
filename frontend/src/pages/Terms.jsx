function Terms() {
  return (
    <div style={{ minHeight: "85vh", padding: "50px 0 80px" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        <span className="badge badge-neutral">LEGAL &amp; CLINICAL TERMS</span>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "10px", marginBottom: "20px" }}>
          Terms of Service &amp; Clinical Disclaimers
        </h1>

        <div className="card" style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "24px", lineHeight: "1.8" }}>
          <section>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
              1. Non-Commercial Voluntary Principle
            </h3>
            <p style={{ color: "var(--text-main)", fontSize: "14.5px" }}>
              Heart Sync is dedicated exclusively to voluntary, non-remunerated blood donation. The buying, selling, or commercial
              solicitation of blood components through this platform is strictly forbidden under national and international law.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--dark-navy)", marginBottom: "8px" }}>
              2. Medical Evaluation &amp; Liability Limitation
            </h3>
            <p style={{ color: "var(--text-main)", fontSize: "14.5px" }}>
              Heart Sync provides digital inventory traceability and voluntary coordination tools. It does not replace the
              clinical judgment, compatibility testing, cross-matching, or direct medical oversight of licensed physicians
              and blood transfusion specialists.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;