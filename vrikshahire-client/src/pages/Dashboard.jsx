import { useState, useEffect } from "react";
import { getJobs, getNotices, applyToJob, logout } from "../api/api";

function formatNoticeDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function Dashboard({ onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [tab, setTab] = useState("jobs");
  const [sort, setSort] = useState("date");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");

  useEffect(() => {
    getJobs().then(data => setJobs(data.jobs || []));
    getNotices().then(data => setNotices(data.notices || []));
  }, []);

  // sort: [...arr] spreads to new array so we don't mutate state
  // (a,b) => b - a  →  descending (big first)
  const sortedJobs = [...jobs].sort((a, b) =>
    sort === "salary"
      ? b.salary - a.salary
      : new Date(b.postedAt) - new Date(a.postedAt)
  );

  const sortedNotices = [...notices]
    .filter(notice => typeof notice.message === "string" && notice.message.trim())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  async function handleApply(jobId) {
    setMessage("");
    try {
      await applyToJob(jobId);
      setMessage("Application submitted successfully.");
      setMsgType("ok");
    } catch (err) {
      setMessage(err.message);
      setMsgType("err");
    }
  }

  function canApply(jobId) {
    // The API only accepts persisted MongoDB job IDs. Demo fallback jobs use IDs like "j1".
    return typeof jobId === "string" && /^[a-f\d]{24}$/i.test(jobId);
  }

  return (
    <div className="app-wrap">
      <header className="header">
        <div className="header-logo">
          <div className="header-dot">V</div>
          <span className="header-title">VrikshaHire</span>
        </div>
        <button className="logout-btn" onClick={() => { logout(); onLogout(); }}>Log out</button>
      </header>

      <div className="main">
        {/* Tab bar */}
        <div className="tab-bar">
          {["jobs", "notices"].map(t => (
            <button
              key={t}
              className={`tab-btn${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort bar — jobs only */}
        {tab === "jobs" && (
          <div className="sort-bar">
            <span className="sort-label">Sort:</span>
            {[{ key: "date", label: "Latest" }, { key: "salary", label: "Salary" }].map(({ key, label }) => (
              <button
                key={key}
                className={`sort-btn${sort === key ? " active" : ""}`}
                onClick={() => setSort(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Flash message */}
        {message && (
          <div className={`flash ${msgType === "ok" ? "msg-ok" : "msg-error"}`}>
            {message}
          </div>
        )}

        {/* Jobs */}
        {tab === "jobs" && (
          <div className="list">
            {sortedJobs.length === 0 && <p className="empty">No jobs available.</p>}
            {sortedJobs.map(job => (
              <div key={job._id} className="job-card">
                <div className="job-info">
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">{job.companyName}</div>
                  <div className="job-tags">
                    <span className="tag tag-amber">₹{(job.salary / 100000).toFixed(1)} LPA</span>
                    <span className="tag tag-glass">Min CGPA {job.minCGPA}</span>
                    <span className="tag tag-glass">{job.allowedBranches?.join(", ")}</span>
                  </div>
                </div>
                <button
                  className="apply-btn"
                  onClick={() => handleApply(job._id)}
                  disabled={!canApply(job._id)}
                  title={!canApply(job._id) ? "This demo job is not saved on the server." : undefined}
                >
                  {canApply(job._id) ? "Apply" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notices */}
        {tab === "notices" && (
          <div className="list">
            {sortedNotices.length === 0 && <p className="empty">No notices yet.</p>}
            {sortedNotices.map(notice => (
              <div key={notice._id} className="notice-card">
                <p className="notice-msg">{notice.message}</p>
                {formatNoticeDate(notice.date) && (
                  <p className="notice-date">{formatNoticeDate(notice.date)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
