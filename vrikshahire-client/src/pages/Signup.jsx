import { useState } from "react";
import { signup, signupCompany } from "../api/api";

export default function Signup({ goToLogin }) {
  const [role, setRole] = useState("student");
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
    if (role === "student" && (Number(form.cgpa) < 0 || Number(form.cgpa) > 10 || Number(form.backlogs) < 0)) {
      setError("CGPA must be between 0 and 10, and backlogs cannot be negative.");
      return;
    }
    setLoading(true);
    try {
      if (role === "company") {
        await signupCompany({ name: form.name, email: form.email, password: form.password, website: form.website });
      } else {
        await signup(form.name, form.email, form.password, form.branch, parseFloat(form.cgpa), parseInt(form.backlogs));
      }
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
          <p className="auth-sub">{role === "company" ? "Your company account will work after admin approval." : "You can now log in with your credentials."}</p>
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
        <p className="auth-sub">Choose the account you need for the placement portal.</p>

        <div className="tab-bar" aria-label="Account type">
          {["student", "company"].map(item => (
            <button type="button" key={item} className={`tab-btn ${role === item ? "active" : ""}`} onClick={() => setRole(item)}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {fields.filter(field => role === "student" || ["name", "email", "password"].includes(field.name)).map(({ name, label, type, placeholder }) => (
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
                  min={name === "cgpa" ? "0" : name === "backlogs" ? "0" : undefined}
                  max={name === "cgpa" ? "10" : undefined}
                />
              )}
            </div>
          ))}
          {role === "company" && (
            <div className="field">
              <label>Company website</label>
              <input type="url" name="website" value={form.website || ""} onChange={handleChange} placeholder="https://company.com" />
            </div>
          )}
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
