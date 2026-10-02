import { useState } from "react";
import { login } from "../api/api";
import Brand from "../components/Brand";

export default function Login({ onLogin, goToSignup }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password, role);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "student" && data.data?._id) {
        localStorage.setItem("studentId", data.data._id);
      } else {
        localStorage.removeItem("studentId");
      }

      onLogin(data.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-hero">
        <Brand />
        <h1>Access<br />Portal</h1>
        <p>Encrypted session</p>
      </div>

      <div className="bento-card auth-card">
        <div className="role-tabs" role="tablist" aria-label="Account type">
          <button type="button" role="tab" aria-selected={role === "student"} className={`role-tab ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>Student</button>
          <button type="button" role="tab" aria-selected={role === "company"} className={`role-tab ${role === "company" ? "active" : ""}`} onClick={() => setRole("company")}>Company</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="login-email">Identifier</label>
            <input id="login-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={e => setEmail(e.target.value)} required placeholder={role === "student" ? "student@college.edu" : "hr@company.com"} />
          </div>

          <div className="field">
            <label htmlFor="login-password">Secret key</label>
            <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          {error && <p className="msg-error" role="alert">{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Decrypting..." : "Initialize dashboard"}
          </button>
        </form>

        <div className="auth-foot">
          New to VrikshaHire?
          <button type="button" onClick={goToSignup}>Create profile</button>
        </div>
      </div>
    </div>
  );
}