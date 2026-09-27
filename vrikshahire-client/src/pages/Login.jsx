import { useState } from "react";
import { login } from "../api/api";

export default function Login({ onLogin, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      if (data.data?._id) localStorage.setItem("studentId", data.data._id);
      onLogin(data.data?._id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <div className="logo-dot">V</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to your VrikshaHire account.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@college.edu" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <p className="msg-error">{error}</p>}
          <button type="submit" className="btn btn-amber" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="switch-link">
          New here? <button onClick={goToSignup}>Create an account</button>
        </div>
      </div>
    </div>
  );
}
