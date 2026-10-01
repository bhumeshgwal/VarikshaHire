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
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rise-in">
        <div className="mb-8 text-center">
          <div className="inline-flex w-9 h-9 rounded-lg bg-accent items-center justify-center mb-5">
            <span className="text-accent-ink font-bold text-sm">V</span>
          </div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">Log in</h1>
          <p className="text-muted text-sm mt-1.5">VrikshaHire placement portal</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/30 border border-border text-ink text-[15px] placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
              placeholder="you@college.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/30 border border-border text-ink text-[15px] placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-ink font-semibold text-[15px] py-2.5 rounded-lg hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          New here?{" "}
          <button onClick={goToSignup} className="text-accent font-medium hover:underline">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
