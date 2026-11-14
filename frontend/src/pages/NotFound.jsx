import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="card" style={{ maxWidth: "520px", textAlign: "center", padding: "48px 30px" }}>
        <div style={{ fontSize: "60px", marginBottom: "10px" }}>🩸</div>
        <span className="badge badge-danger">404 ERROR</span>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--dark-navy)", marginTop: "12px", marginBottom: "10px" }}>
          Clinical Route Not Found
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "26px" }}>
          The requested page does not exist or may have been relocated within our hospital network.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link to="/" className="btn btn-primary">
            Return to Homepage
          </Link>
          <Link to="/requests" className="btn btn-outline-navy">
            Emergency Requests
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
