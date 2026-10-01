import { useState } from "react";
import { signup, signupCompany } from "../api/api";

export default function Signup({ goToLogin }) {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", branch: "", cgpa: "", backlogs: "0" });
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="auth-page signup-page">
        <div className="auth-panel">
          <div className="auth-box success-box">
            <div className="success-icon">✓</div>
            <h1 className="auth-box-title success-title">Account created</h1>
            <p className="auth-box-subtitle">{role === "company" ? "Your company account will work after admin approval." : "You can now log in with your credentials."}</p>
            <button className="btn btn-primary" onClick={goToLogin}>Go to login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page signup-page">
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
          Create your profile and take the next step towards your dream career.
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
        <div className="auth-box auth-box-wide">
          <div className="auth-avatar">◔</div>
          <h2 className="auth-box-title">Create Account</h2>
          <p className="auth-box-subtitle">Choose the account you need for the placement portal</p>

          <div className="tab-bar" aria-label="Account type">
            {['student', 'company'].map(item => (
              <button type="button" key={item} className={`tab-btn ${role === item ? 'active' : ''}`} onClick={() => setRole(item)}>
                <span>{item === 'student' ? '🎓' : '🏢'}</span>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form signup-form">
            <div className="form-grid">
              <div className="field">
                <label>Full name</label>
                <div className="input-shell">
                  <span className="input-icon">👤</span>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Bhumesh Gwal" />
                </div>
              </div>

              <div className="field">
                <label>Email</label>
                <div className="input-shell">
                  <span className="input-icon">✉</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="xyz@hotmail.com" />
                </div>
              </div>

              <div className="field full">
                <label>Password</label>
                <div className="input-shell">
                  <span className="input-icon">🔒</span>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">{showPassword ? '◉' : '◌'}</button>
                </div>
              </div>

              {role === 'student' && (
                <>
                  <div className="field">
                    <label>Branch</label>
                    <div className="input-shell select-shell">
                      <span className="input-icon">🎯</span>
                      <select name="branch" value={form.branch} onChange={handleChange} required>
                        <option value="" disabled>Select your branch</option>
                        <option value="CS">Computer Science (CS)</option>
                        <option value="IT">Information Technology (IT)</option>
                        <option value="EC">Electronics (EC)</option>
                        <option value="ME">Mechanical (ME)</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label>Backlogs</label>
                    <div className="input-shell">
                      <span className="input-icon">📊</span>
                      <input type="number" name="backlogs" value={form.backlogs} onChange={handleChange} placeholder="0" min="0" required />
                    </div>
                  </div>

                  <div className="field full">
                    <label>CGPA</label>
                    <div className="input-shell">
                      <span className="input-icon">⭐</span>
                      <input type="number" name="cgpa" value={form.cgpa} onChange={handleChange} placeholder="7.5" step="0.01" min="0" max="10" required />
                    </div>
                  </div>
                </>
              )}

              {role === 'company' && (
                <div className="field full">
                  <label>Company website</label>
                  <div className="input-shell">
                    <span className="input-icon">🌐</span>
                    <input type="url" name="website" value={form.website || ''} onChange={handleChange} placeholder="https://company.com" />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="msg-error">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="switch-link">
            <span>Already have an account?</span>
            <button type="button" onClick={goToLogin}>Log in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
