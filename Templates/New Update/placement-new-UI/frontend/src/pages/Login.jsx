import { useState } from "react";
import { login } from "../api/api";

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
    <div className="auth-page login-page">
      <div className="auth-hero-section">
        <div className="brand-row">
          <div className="brand-mark">✓</div>
          <div className="brand-copy">
            <div className="brand-title">PlacementPortal</div>
            <div className="brand-subtitle">Your Career • Our Priority</div>
          </div>
        </div>

        <h1 className="hero-title">
          Welcome to
          <span>Placement Portal</span>
        </h1>

        <p className="hero-description">
          Log in to your placement account and take the next step towards your dream career.
        </p>

        <div className="feature-row">
          <div className="feature-pill"><span className="feature-icon">💼</span>Latest Job Openings</div>
          <div className="feature-pill"><span className="feature-icon">🏢</span>Top Companies</div>
          <div className="feature-pill"><span className="feature-icon">📈</span>Track Your Progress</div>
        </div>

        <div className="campus-scene" aria-hidden="true">
          <div className="scene-backpack">
            <div className="bag-top"></div>
            <div className="bag-body"></div>
            <div className="bag-straps"></div>
            <div className="bag-label">Better<br/>Opportunities<br/>Brighter<br/>Future</div>
          </div>
          <div className="scene-grounds"></div>
          <div className="scene-building">
            <div className="roof"></div>
            <div className="windows"></div>
            <div className="tower"></div>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-box">
          <div className="auth-avatar">◔</div>
          <h2 className="auth-box-title">Welcome Back</h2>
          <p className="auth-box-subtitle">Log in to your placement account</p>

          <div className="tab-bar" aria-label="Account type">
            {['student', 'company'].map(item => (
              <button type="button" key={item} className={`tab-btn ${role === item ? "active" : ""}`} onClick={() => setRole(item)}>
                <span>{item === 'student' ? '🎓' : '🏢'}</span>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Email</label>
              <div className="input-shell">
                <span className="input-icon">✉</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@college.edu" />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-shell">
                <span className="input-icon">🔒</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
                <span className="password-toggle" aria-hidden="true">◉</span>
              </div>
            </div>

            <div className="meta-row">
              <label className="check-row"><input type="checkbox" defaultChecked /> Remember me</label>
              <button type="button" className="text-link">Forgot password?</button>
            </div>

            {error && <p className="msg-error">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>

          <div className="switch-link">
            <span>New here?</span>
            <button type="button" onClick={goToSignup}>Create an account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
