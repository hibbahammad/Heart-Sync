import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { getOrganizations } from "../api/organizationApi";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "DONOR",
    organizationId: "",
  });
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getOrganizations({ type: "ALL" })
      .then((data) => setOrgs(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await registerUser(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

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
      setErrorMsg(err.response?.data?.message || "Registration failed. Please check inputs.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "50px 20px", background: "var(--bg-light)" }}>
      <div className="card" style={{ maxWidth: "520px", width: "100%", padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🩸</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--dark-navy)" }}>
            Create Healthcare Account
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginTop: "4px" }}>
            Join Heart Sync as a donor, hospital staff, or blood bank coordinator
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: "12px 14px", background: "var(--danger-light)", color: "var(--danger-red)", borderRadius: "8px", fontSize: "13px", marginBottom: "18px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={styles.label}>Full Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Dr. Ayesha / Muhammad Usman"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label style={styles.label}>Email Address *</label>
              <input
                required
                type="email"
                placeholder="e.g. staff@health.org"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +92 300 1234567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Password (minimum 6 characters) *</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Platform Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={styles.input}
            >
              <option value="DONOR">Voluntary Donor</option>
              <option value="HOSPITAL_STAFF">Hospital Transfusion Staff</option>
              <option value="BLOOD_BANK_STAFF">Blood Bank Laboratory Staff</option>
              <option value="SUPER_ADMIN">System Administrator</option>
            </select>
          </div>

          {["HOSPITAL_STAFF", "BLOOD_BANK_STAFF"].includes(form.role) && (
            <div>
              <label style={styles.label}>Affiliated Healthcare Facility *</label>
              <select
                value={form.organizationId}
                onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                style={styles.input}
              >
                <option value="">Select Hospital or Blood Bank</option>
                {orgs.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.city}) - {org.type}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "12px", width: "100%", marginTop: "10px" }}>
            {loading ? "Registering Account..." : "Create Account &amp; Access Portal →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13.5px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary-red)", fontWeight: "700" }}>
            Sign In
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
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box",
  },
};

export default Register;