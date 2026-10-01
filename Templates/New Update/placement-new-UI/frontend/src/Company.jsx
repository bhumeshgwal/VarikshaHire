import { useEffect, useState } from "react";
import { deleteMyJob, getJobApplicants, getMyJobs, logout, postJob, updateApplicationStatus, updateMyJob } from "./api/api";
import ReportModal from "./components/ReportModal";
import AccountMenu from "./components/AccountMenu";

const emptyJob = { title: "", salary: "", minCGPA: "0", maxBacklogs: "0", deadline: "", allowedBranches: "CS, IT" };
function today() { return new Date().toISOString().slice(0, 10); }
function latestDeadline() { const date = new Date(); date.setFullYear(date.getFullYear() + 1); return date.toISOString().slice(0, 10); }

function toPayload(form) {
  return { ...form, salary: Number(form.salary), minCGPA: Number(form.minCGPA), maxBacklogs: Number(form.maxBacklogs), allowedBranches: form.allowedBranches.split(",").map(value => value.trim()).filter(Boolean) };
}

export default function CompanyDashboard({ onLogout, onViewProfile, onMessages }) {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  async function loadJobs() {
    setLoading(true);
    try { const data = await getMyJobs(); setJobs(data.jobs || []); }
    catch (error) { setMessage({ text: error.message, type: "err" }); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadJobs(); }, []);

  async function submitJob(event) {
    event.preventDefault();
    try {
      const data = editingId ? await updateMyJob(editingId, toPayload(form)) : await postJob(toPayload(form));
      setMessage({ text: data.message, type: "ok" }); setForm(emptyJob); setEditingId(null); loadJobs();
    } catch (error) { setMessage({ text: error.message, type: "err" }); }
  }

  function startEdit(job) {
    setEditingId(job._id);
    setForm({ ...job, deadline: job.deadline ? job.deadline.slice(0, 10) : "", allowedBranches: (job.allowedBranches || []).join(", ") });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeJob(id) {
    if (!window.confirm("Delete this job and all applications for it?")) return;
    try { await deleteMyJob(id); setJobs(current => current.filter(job => job._id !== id)); setMessage({ text: "Job deleted.", type: "ok" }); }
    catch (error) { setMessage({ text: error.message, type: "err" }); }
  }

  async function openApplicants(job) {
    setSelectedJob(job);
    setApplicationsLoading(true);
    try {
      const data = await getJobApplicants(job._id);
      setApplications(data.applications || []);
    } catch (error) { setMessage({ text: error.message, type: "err" }); }
    finally { setApplicationsLoading(false); }
  }

  async function changeStatus(applicationId, status) {
    try {
      const data = await updateApplicationStatus(applicationId, status);
      setApplications(current => current.map(application => application._id === applicationId ? data.application : application));
      setMessage({ text: "Applicant status updated.", type: "ok" });
    } catch (error) { setMessage({ text: error.message, type: "err" }); }
  }

  return <div className="app-wrap">
    <header className="header"><div className="header-logo"><div className="header-dot">V</div><span className="header-title">VrikshaHire <span className="admin-badge">Company</span></span></div><AccountMenu onInbox={onMessages} onReport={() => setReportOpen(true)} onLogout={() => { logout(); onLogout(); }} /></header>
    <main className="main">
      <div className="section-heading"><div><h2>{editingId ? "Edit job" : "Post a job"}</h2><span>New jobs need admin approval before students can view them.</span></div></div>
      {message.text && <div className={`flash ${message.type === "ok" ? "msg-ok" : "msg-error"}`}>{message.text}</div>}
      <form className="company-form" onSubmit={submitJob}>
        <div className="form-grid">
          <div className="field full"><label>Job title</label><input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Software Engineer" /></div>
          <div className="field"><label>Salary (per year)</label><input required type="number" min="0" value={form.salary} onChange={event => setForm({ ...form, salary: event.target.value })} /></div>
          <div className="field"><label>Minimum CGPA</label><input required type="number" min="0" max="10" step="0.1" value={form.minCGPA} onChange={event => setForm({ ...form, minCGPA: event.target.value })} /></div>
          <div className="field"><label>Maximum backlogs</label><input required type="number" min="0" value={form.maxBacklogs} onChange={event => setForm({ ...form, maxBacklogs: event.target.value })} /></div>
          <div className="field"><label>Application deadline</label><input type="date" min={today()} max={latestDeadline()} value={form.deadline} onChange={event => setForm({ ...form, deadline: event.target.value })} /><small className="field-help">Choose a date from today through the next year.</small></div>
          <div className="field full"><label>Allowed branches (comma separated)</label><input value={form.allowedBranches} onChange={event => setForm({ ...form, allowedBranches: event.target.value })} placeholder="CS, IT, EC" /></div>
        </div>
        <button className="btn" type="submit">{editingId ? "Save changes" : "Submit for approval"}</button>
        {editingId && <button className="btn" type="button" onClick={() => { setEditingId(null); setForm(emptyJob); }} style={{ marginLeft: "0.6rem", background: "#edf1ed", color: "#17241d" }}>Cancel</button>}
      </form>
      <div className="section-heading" style={{ marginTop: "2rem" }}><h2>My jobs</h2><button className="admin-refresh" onClick={loadJobs}>Refresh</button></div>
      {loading ? <p className="empty">Loading jobs...</p> : <div className="list">
        {jobs.length === 0 && <p className="empty">No jobs posted yet.</p>}
        {jobs.map(job => <article className="job-card" key={job._id}>
          <div className="job-info"><div className="job-title">{job.title}</div><div className="job-tags"><span className="tag tag-amber">₹{(job.salary / 100000).toFixed(1)} LPA</span><span className="tag tag-glass">CGPA {job.minCGPA}</span><span className={`tag ${job.approved ? "match-ok" : "tag-glass"}`}>{job.approved ? "Live" : "Awaiting approval"}</span></div></div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}><button className="admin-refresh" onClick={() => openApplicants(job)}>Applicants</button><button className="admin-refresh" onClick={() => startEdit(job)}>Edit</button><button className="admin-refresh" style={{ color: "#a43d35" }} onClick={() => removeJob(job._id)}>Delete</button></div>
        </article>)}
      </div>}
      {selectedJob && <section style={{ marginTop: "2rem" }}>
        <div className="section-heading"><div><h2>Applicants: {selectedJob.title}</h2><span>Update a student after each placement stage.</span></div><button className="admin-refresh" onClick={() => { setSelectedJob(null); setApplications([]); }}>Close</button></div>
        {applicationsLoading ? <p className="empty">Loading applicants...</p> : <div className="application-list">
          {applications.length === 0 && <p className="empty">No applications for this job yet.</p>}
          {applications.map(application => <article className="application-card" key={application._id}>
            <div className="application-main"><div className="applicant-avatar">{application.studentId?.name?.charAt(0) || "?"}</div><div className="application-person"><h3><button className="profile-link" onClick={() => onViewProfile(application.studentId?._id)}>{application.studentId?.name || "Student"}</button></h3><p>{application.studentId?.branch} · CGPA {application.studentId?.cgpa}</p></div></div>
            <div className="application-job"><strong>{application.studentId?.skills?.join(", ") || "No skills added"}</strong><span>{application.studentId?.email || "Email unavailable"}</span><span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span><button className="text-button" onClick={onMessages}>Open in Messages</button></div>
            <select value={application.status} onChange={event => changeStatus(application._id, event.target.value)} aria-label={`Application status for ${application.studentId?.name}`}>
              {["applied", "shortlisted", "interview", "selected", "rejected"].map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </article>)}
        </div>}
      </section>}
    </main>
    {reportOpen && <ReportModal onClose={() => setReportOpen(false)} onSubmitted={text => setMessage({ text, type: "ok" })} />}
  </div>;
}
