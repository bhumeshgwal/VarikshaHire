import { useState } from "react";
import { signup } from "../api/api";

export default function Signup({ goToLogin }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", branch: "", cgpa: "", backlogs: "0",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.branch, form.cgpa, form.backlogs);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center px-5">
        <div className="text-center max-w-sm rise-in">
          <div className="check-pop inline-flex w-14 h-14 rounded-full bg-accent/15 border border-accent/30 items-center justify-center mb-5">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">Account created</h1>
          <p className="text-muted text-sm mb-7">You can log in now with your new account.</p>
          <button
            onClick={goToLogin}
            className="bg-accent text-accent-ink font-semibold px-6 py-2.5 rounded-lg hover:brightness-110 active:scale-[0.98] transition"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rise-in">
        <div className="mb-7 text-center">
          <div className="inline-flex w-9 h-9 rounded-lg bg-amber items-center justify-center mb-5">
            <span className="text-accent-ink font-bold text-sm">V</span>
          </div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">Create account</h1>
          <p className="text-muted text-sm mt-1.5">Register to browse and apply for jobs</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-3.5">
          <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} placeholder="Your name" />
          <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="you@college.edu" autoComplete="email" />
          <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="••••••••" autoComplete="new-password" />
          <Field label="Branch" value={form.branch} onChange={(v) => update("branch", v)} placeholder="CSE, ECE, etc." />
          <div className="grid grid-cols-2 gap-3">
            <Field label="CGPA" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={(v) => update("cgpa", v)} placeholder="8.5" />
            <Field label="Backlogs" type="number" min="0" value={form.backlogs} onChange={(v) => update("backlogs", v)} placeholder="0" />
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
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          Already have an account?{" "}
          <button onClick={goToLogin} className="text-accent font-medium hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, ...rest }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg bg-black/30 border border-border text-ink text-[15px] placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
        {...rest}
      />
    </div>
  );
}
