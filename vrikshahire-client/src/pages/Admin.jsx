import { useEffect, useState } from "react";
import { getAdminOverview, logout } from "../api/api";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function AdminDashboard({ onLogout }) {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOverview()
      .then(setOverview)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    onLogout();
  }

  return (
    <div className="app-wrap">
      <header className="header">
        <div className="header-logo">
          <div className="header-dot">V</div>
          <span className="header-title">VrikshaHire <span className="admin-badge">Admin</span></span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </header>

      <main className="main admin-main">
        <div className="admin-heading">
          <div>
            <p className="admin-eyebrow">PLACEMENT OVERVIEW</p>
            <h1>Applications</h1>
            <p className="admin-description">Review the latest student applications and job details.</p>
          </div>
          <button className="admin-refresh" onClick={() => window.location.reload()}>Refresh</button>
        </div>

        {error && <p className="msg-error">{error}</p>}

        <section className="admin-stats" aria-label="Placement totals">
          {[
            { label: "Students", value: overview?.stats?.students },
            { label: "Jobs", value: overview?.stats?.jobs },
            { label: "Applications", value: overview?.stats?.applications },
          ].map(item => (
            <div className="admin-stat" key={item.label}>
              <span>{item.label}</span>
              <strong>{loading ? "—" : item.value ?? 0}</strong>
            </div>
          ))}
        </section>

        <section className="admin-applications">
          <div className="section-heading">
            <h2>Recent applications</h2>
            <span>{overview?.applications?.length || 0} shown</span>
          </div>
          {loading ? (
            <p className="empty">Loading applications…</p>
          ) : overview?.applications?.length ? (
            <div className="application-list">
              {overview.applications.map(application => (
                <article className="application-card" key={application._id}>
                  <div className="application-main">
                    <div className="applicant-avatar">
                      {(application.studentId?.name || "?").trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="application-person">
                      <h3>{application.studentId?.name || "Student record unavailable"}</h3>
                      <p>{application.studentId?.email || "—"}{application.studentId?.branch ? ` · ${application.studentId.branch}` : ""}</p>
                    </div>
                  </div>
                  <div className="application-job">
                    <strong>{application.jobId?.title || "Job record unavailable"}</strong>
                    <span>{application.jobId?.companyName || ""}</span>
                  </div>
                  <div className="application-meta">
                    <span className="application-status">{application.status || "applied"}</span>
                    <time dateTime={application.appliedAt}>{formatDate(application.appliedAt)}</time>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty">No applications have been submitted yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
