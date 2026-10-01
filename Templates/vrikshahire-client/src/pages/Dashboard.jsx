import { useState, useEffect } from "react";
import { getJobs, getNotices, applyToJob, logout } from "../api/api";

export default function Dashboard({ studentId, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [tab, setTab] = useState("jobs");
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getJobs().then((data) => setJobs(data.jobs || []));
    getNotices().then((data) => setNotices(data.notices || []));
  }, []);

  async function handleApply(job) {
    setApplyingId(job._id);
    try {
      await applyToJob(studentId, job._id);
      setAppliedIds((prev) => new Set(prev).add(job._id));
      showToast(`Applied to ${job.title}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setApplyingId(null);
    }
  }

  function showToast(message, kind) {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 2600);
  }

  function handleLogout() {
    logout();
    onLogout();
  }

  return (
    <div className="min-h-screen mesh-bg">
      <header className="sticky top-0 z-20 glass border-b border-border">
        <div
          className="max-w-2xl mx-auto px-5 flex items-center justify-between"
          style={{ paddingTop: "calc(0.9rem + env(safe-area-inset-top, 0px))", paddingBottom: "0.9rem" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <span className="text-accent-ink font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">VrikshaHire</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-muted hover:text-ink transition-colors">
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        <div className="rise-in flex gap-1 mb-6 bg-surface/60 border border-border rounded-xl p-1 w-fit">
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")}>Jobs</TabButton>
          <TabButton active={tab === "notices"} onClick={() => setTab("notices")}>Notices</TabButton>
        </div>

        {tab === "jobs" && (
          <div className="space-y-3">
            {jobs.length === 0 && <EmptyState text="No open positions right now." />}
            {jobs.map((job, i) => {
              const applied = appliedIds.has(job._id);
              const isApplying = applyingId === job._id;
              return (
                <div
                  key={job._id}
                  className="rise-in glass rounded-2xl p-5"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[15px] truncate">{job.title}</h3>
                      <p className="text-sm text-muted mt-0.5 truncate">{job.companyName}</p>
                    </div>
                    <button
                      onClick={() => handleApply(job)}
                      disabled={applied || isApplying}
                      className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-lg transition active:scale-[0.97] ${
                        applied
                          ? "bg-accent/15 text-accent border border-accent/30"
                          : "bg-accent text-accent-ink hover:brightness-110"
                      } disabled:active:scale-100`}
                    >
                      {applied ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Applied
                        </span>
                      ) : isApplying ? (
                        "Applying…"
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-muted">
                    <span>{job.salary}</span>
                    <span>Min CGPA {job.minCGPA}</span>
                    <span>Max backlogs {job.maxBacklogs}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "notices" && (
          <div className="space-y-3">
            {notices.length === 0 && <EmptyState text="No notices yet." />}
            {notices.map((notice, i) => (
              <div
                key={notice._id}
                className="rise-in glass rounded-2xl p-5"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <p className="text-[15px] text-ink">{notice.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-30 glass-high rounded-xl px-4 py-3 shadow-2xl check-pop"
          style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <p className={`text-sm font-medium ${toast.kind === "error" ? "text-rose" : "text-accent"}`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rise-in glass rounded-2xl p-8 text-center">
      <p className="text-muted text-sm">{text}</p>
    </div>
  );
}
