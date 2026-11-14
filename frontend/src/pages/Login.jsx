import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // Redirect according to role
      if (data.role === "SUPER_ADMIN") {
        navigate("/admin/dashboard");
      } else if (["HOSPITAL_ADMIN", "HOSPITAL_STAFF"].includes(data.role)) {
        navigate("/hospital/dashboard");
      } else if (["BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(data.role)) {
        navigate("/blood-bank/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid clinical credentials. Please verify your login.");
    }
    setLoading(false);
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg("");
  };

  return (
    <div style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "50px 20px", background: "var(--bg-light)" }}>
      <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "36px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🩸</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--dark-navy)" }}>
            Heart Sync Clinical Sign In
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginTop: "4px" }}>
            Secure authentication for authorized staff &amp; registered donors
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: "12px 14px", background: "var(--danger-light)", color: "var(--danger-red)", borderRadius: "8px", fontSize: "13px", marginBottom: "18px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={styles.label}>Official Email Address</label>
            <input
              required
              type="email"
              placeholder="e.g. staff@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "12px", width: "100%", fontSize: "14.5px" }}>
            {loading ? "Authenticating..." : "Sign In to Healthcare Portal →"}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div style={{ marginTop: "28px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", marginBottom: "10px", textAlign: "center" }}>
            ⚡ 1-Click Role Login (Demo Credentials)
          </div>
          <div className="demo-btns-grid">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@heartsync.org", "admin123")}
              style={styles.demoBtn}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("hospital@heartsync.org", "hospital123")}
              style={styles.demoBtn}
            >
              🏥 Hospital Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("bloodbank@heartsync.org", "bloodbank123")}
              style={styles.demoBtn}
            >
              🩸 Blood Bank Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("donor@heartsync.org", "donor123")}
              style={styles.demoBtn}
            >
              ❤️ Voluntary Donor
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13.5px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary-red)", fontWeight: "700" }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--dark-navy)",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  demoBtn: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    background: "#F8FAFC",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--dark-navy)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default Login;