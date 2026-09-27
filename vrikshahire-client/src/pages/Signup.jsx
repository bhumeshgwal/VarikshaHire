import { useState } from "react";
import { signup } from "../api/api";

export default function Signup({ goToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", branch: "", cgpa: "", backlogs: "0" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.branch, parseFloat(form.cgpa), parseInt(form.backlogs));
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-wrap">
        <div className="auth-card card" style={{ textAlign: "center" }}>
          <div className="success-icon">✓</div>
          <h1 className="auth-title">Account created</h1>
          <p className="auth-sub">You can now log in with your credentials.</p>
          <button className="btn btn-amber" onClick={goToLogin}>Go to login</button>
        </div>
      </div>
    );
  }

  const fields = [
    { name: "name", label: "Full name", type: "text", placeholder: "Bhumesh Gwal" },
    { name: "email", label: "Email", type: "email", placeholder: "xyz@hotmail.com" },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
    { name: "branch", label: "Branch" },
    { name: "cgpa", label: "CGPA", type: "number", placeholder: "7.5" },
    { name: "backlogs", label: "Backlogs", type: "number", placeholder: "0" },
  ];

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <div className="logo-dot">V</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Register to browse and apply for jobs.</p>

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type, placeholder }) => (
            <div className="field" key={name}>
              <label>{label}</label>
              {name === "branch" ? (
                <select name={name} value={form[name]} onChange={handleChange} required>
                  <option value="" disabled>Select your branch</option>
                  <option value="CS">Computer Science (CS)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="EC">Electronics (EC)</option>
                  <option value="ME">Mechanical (ME)</option>
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  step={name === "cgpa" ? "0.01" : undefined}
                />
              )}
            </div>
          ))}
          {error && <p className="msg-error">{error}</p>}
          <button type="submit" className="btn btn-amber" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="switch-link">
          Already have an account? <button onClick={goToLogin}>Log in</button>
        </div>
      </div>
    </div>
  );
}
