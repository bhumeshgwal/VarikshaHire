import { useEffect, useMemo, useState } from "react";
import { getInbox, getNotices } from "../api/api";
import ApplicationChat from "../components/ApplicationChat";

function formatDate(value) { return value ? new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : ""; }

export default function MessagesPage({ onBack }) {
  const [applications, setApplications] = useState([]); const [notices, setNotices] = useState([]); const [active, setActive] = useState(null); const [tab, setTab] = useState("inbox"); const [error, setError] = useState("");
  const role = localStorage.getItem("role");
  useEffect(() => { Promise.all([getInbox(), getNotices()]).then(([inbox, noticeData]) => { setApplications(inbox.applications || []); setNotices(noticeData.notices || []); }).catch(err => setError(err.message)); }, []);
  const priority = useMemo(() => applications.filter(item => ["shortlisted", "interview", "selected"].includes(item.status)), [applications]);
  const publicInquiries = useMemo(() => applications.filter(item => !["shortlisted", "interview", "selected"].includes(item.status)), [applications]);
  const items = role === "company" ? (tab === "priority" ? priority : publicInquiries) : applications;
  if (active) return <ApplicationChat application={active} embedded onClose={() => setActive(null)} />;
  return <div className="app-wrap"><header className="header"><div className="header-logo"><div className="header-dot">V</div><span className="header-title">Inbox</span></div><button className="logout-btn" onClick={onBack}>Back</button></header><main className="main">
    <div className="section-heading"><div><h1>Messages</h1><span>{role === "company" ? "Manage applicant conversations." : "Messages unlock after a shortlist, interview, or selection."}</span></div></div>
    {error && <p className="flash msg-error">{error}</p>}
    {role === "company" && <div className="tab-bar"><button className={`tab-btn ${tab === "inbox" ? "active" : ""}`} onClick={() => setTab("inbox")}>Public inquiries ({publicInquiries.length})</button><button className={`tab-btn ${tab === "priority" ? "active" : ""}`} onClick={() => setTab("priority")}>Shortlisted / selected ({priority.length})</button></div>}
    {role === "student" && <section className="inbox-notices"><div className="section-heading"><h2>System notices</h2></div>{notices.length ? notices.slice(0, 5).map(notice => <article className="notice-card" key={notice._id}><p className="notice-msg">{notice.message}</p><p className="notice-date">{formatDate(notice.date)} · {notice.author}</p></article>) : <p className="empty">No notices yet.</p>}</section>}
    <section className="inbox-conversations"><div className="section-heading"><h2>{role === "company" ? tab === "priority" ? "Shortlisted / selected students" : "Public inquiries" : "Company conversations"}</h2></div>{items.length ? <div className="application-list">{items.map(item => <article className="application-card" key={item._id}><div className="application-main"><div className="applicant-avatar">{(role === "company" ? item.studentId?.name : item.jobId?.companyName)?.charAt(0) || "?"}</div><div className="application-person"><h3>{role === "company" ? item.studentId?.name : item.jobId?.companyName}</h3><p>{item.jobId?.title || "Application"}</p></div></div><span className="tag tag-glass">{item.status}</span><button className="admin-refresh" onClick={() => setActive(item)}>Open chat</button></article>)}</div> : <p className="empty">No conversations in this section.</p>}</section>
  </main></div>;
}
