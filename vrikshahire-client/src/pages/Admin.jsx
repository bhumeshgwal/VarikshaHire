import { useEffect, useState } from "react";
import { 
  logout, 
  getAdminOverview, 
  getPendingApprovals, 
  approveCompany, 
  approveJob, 
  getNotices, 
  postNotice, 
  deleteNotice,
  getAdminCompanies,
  getAdminJobs,
  getAdminStudents,
  updateAdminRecord,
  deleteAdminRecord,
  getAdminReports,
  updateReportStatus
} from "../api/api";
import AccountMenu from "../components/AccountMenu";
import Brand from "../components/Brand";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function AdminDashboard({ onLogout, onViewProfile }) {
  const [tab, setTab] = useState("overview"); // 'overview', 'approvals', 'notices'
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });

  // Overview State
  const [stats, setStats] = useState({ students: 0, companies: 0, jobs: 0, applications: 0, placed: 0, unplaced: 0 });
  const [recentApps, setRecentApps] = useState([]);

  // Approvals State
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);

  // Notices State
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [reports, setReports] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, pendingData, noticesData, companiesData, jobsData, studentsData, reportsData] = await Promise.all([
        getAdminOverview(),
        getPendingApprovals(),
        getNotices(),
        getAdminCompanies(),
        getAdminJobs(),
        getAdminStudents(),
        getAdminReports()
      ]);
      setStats(overviewData.stats);
      setRecentApps(overviewData.applications || []);
      setPendingCompanies(pendingData.pendingCompanies || []);
      setPendingJobs(pendingData.pendingJobs || []);
      setNotices(noticesData.notices || []);
      setCompanies(companiesData.companies || []);
      setJobs(jobsData.jobs || []);
      setStudents(studentsData.students || []);
      setReports(reportsData.reports || []);
    } catch (err) {
      setMsg({ text: err.message, type: "err" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- Handlers ---
  async function handleApproveCompany(id) {
    try {
      await approveCompany(id);
      setPendingCompanies(prev => prev.filter(c => c._id !== id));
      setCompanies(prev => prev.map(company => company._id === id ? { ...company, approved: true } : company));
      setMsg({ text: "Company approved successfully.", type: "ok" });
    } catch (err) {
      setMsg({ text: err.message, type: "err" });
    }
  }

  async function handleApproveJob(id) {
    try {
      await approveJob(id);
      setPendingJobs(prev => prev.filter(j => j._id !== id));
      setJobs(prev => prev.map(job => job._id === id ? { ...job, approved: true } : job));
      setMsg({ text: "Job approved and is now live.", type: "ok" });
    } catch (err) {
      setMsg({ text: err.message, type: "err" });
    }
  }

  async function handlePostNotice(e) {
    e.preventDefault();
    if (!newNotice.trim()) return;
    try {
      const result = await postNotice({ message: newNotice, author: "Admin" });
      setNotices(prev => [result.data, ...prev]);
      setNewNotice("");
      setMsg({ text: "Notice posted to all students.", type: "ok" });
    } catch (err) {
      setMsg({ text: err.message, type: "err" });
    }
  }

  async function handleDeleteNotice(id) {
    try {
      await deleteNotice(id);
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      setMsg({ text: err.message, type: "err" });
    }
  }

  async function handleDelete(type, id) {
    if (!window.confirm(`Delete this ${type} and related application data?`)) return;
    try {
      await deleteAdminRecord(type, id);
      const setters = { company: setCompanies, job: setJobs, student: setStudents };
      setters[type](current => current.filter(item => item._id !== id));
      setPendingCompanies(current => type === "company" ? current.filter(item => item._id !== id) : current);
      setPendingJobs(current => type === "job" ? current.filter(item => item._id !== id) : current);
      setMsg({ text: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`, type: "ok" });
    } catch (err) { setMsg({ text: err.message, type: "err" }); }
  }

  async function handleEdit(type, item, field, label) {
    const value = window.prompt(label, item[field] ?? "");
    if (value === null) return;
    try {
      const updates = { [field]: field === "salary" || field === "cgpa" || field === "minCGPA" ? Number(value) : value };
      const result = await updateAdminRecord(type, item._id, updates);
      const setters = { company: setCompanies, job: setJobs, student: setStudents };
      setters[type](current => current.map(row => row._id === item._id ? result.data : row));
      setMsg({ text: `${type.charAt(0).toUpperCase() + type.slice(1)} updated.`, type: "ok" });
    } catch (err) { setMsg({ text: err.message, type: "err" }); }
  }

  async function handleReportStatus(id, status) {
    try {
      const data = await updateReportStatus(id, status);
      setReports(current => current.map(report => report._id === id ? data.report : report));
      setMsg({ text: "Report status updated.", type: "ok" });
    } catch (err) { setMsg({ text: err.message, type: "err" }); }
  }

  return (
    <div className="app-wrap">
      <header className="header">
        <Brand badge="Admin" />
        <AccountMenu onLogout={() => { logout(); onLogout(); }} />
      </header>

      <main className="main admin-main">
        
        <div className="admin-heading">
          <div>
            <div className="admin-eyebrow">CONTROL PANEL</div>
            <h1>Admin Dashboard</h1>
            <p className="admin-description">Manage placements, approve companies, and monitor platform activity.</p>
          </div>
          <button className="admin-refresh" onClick={loadData}>↻ Refresh Data</button>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
          <button className={`tab-btn ${tab === "approvals" ? "active" : ""}`} onClick={() => setTab("approvals")}>
            Approval Queue <b>({pendingCompanies.length + pendingJobs.length})</b>
          </button>
          <button className={`tab-btn ${tab === "companies" ? "active" : ""}`} onClick={() => setTab("companies")}>Companies</button>
          <button className={`tab-btn ${tab === "jobs" ? "active" : ""}`} onClick={() => setTab("jobs")}>Jobs</button>
          <button className={`tab-btn ${tab === "students" ? "active" : ""}`} onClick={() => setTab("students")}>Students</button>
          <button className={`tab-btn ${tab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}>Reports <b>({reports.filter(report => report.status === "open").length})</b></button>
          <button className={`tab-btn ${tab === "notices" ? "active" : ""}`} onClick={() => setTab("notices")}>Notices</button>
        </div>

        {msg.text && (
          <div className={`flash ${msg.type === "ok" ? "msg-ok" : "msg-error"}`} onClick={() => setMsg({ text: "", type: "" })}>
            {msg.text}
          </div>
        )}

        {loading ? <p className="empty">Loading admin data...</p> : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <>
                <div className="admin-stats">
                  <div className="admin-stat"><span>Total Students</span><strong>{stats.students}</strong></div>
                  <div className="admin-stat">
                    <span>Placed Students</span>
                    <strong className="ok">{stats.placed}</strong>
                  </div>
                  <div className="admin-stat">
                    <span>Unplaced Students</span>
                    <strong className="bad">{stats.unplaced}</strong>
                  </div>
                  <div className="admin-stat"><span>Live Companies</span><strong>{stats.companies}</strong></div>
                  <div className="admin-stat"><span>Active Jobs</span><strong>{stats.jobs}</strong></div>
                  <div className="admin-stat"><span>Total Applications</span><strong>{stats.applications}</strong></div>
                </div>

                <div className="section-heading"><h2>Recent Applications</h2></div>
                <div className="application-list">
                  {recentApps.length === 0 && <p className="empty">No applications yet.</p>}
                  {recentApps.slice(0, 15).map(app => (
                    <div className="application-card" key={app._id}>
                      <div className="application-main">
                        <div className="applicant-avatar">{app.studentId?.name?.charAt(0)}</div>
                        <div className="application-person">
                          <h3><button className="profile-link" onClick={() => onViewProfile(app.studentId?._id)}>{app.studentId?.name}</button></h3>
                          <p>{app.studentId?.branch} • {app.studentId?.email}</p>
                        </div>
                      </div>
                      <div className="application-job">
                        <strong>{app.jobId?.title}</strong>
                        <span>{app.jobId?.companyName}</span>
                      </div>
                      <div className="application-meta">
                        <span className={`status-${app.status} tag`} style={{ textTransform: 'capitalize' }}>{app.status}</span>
                        <span>{formatDate(app.appliedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* APPROVALS TAB */}
            {tab === "approvals" && (
              <div className="stack">
                
                <section>
                  <div className="section-heading"><h2>Pending Companies ({pendingCompanies.length})</h2></div>
                  {pendingCompanies.length === 0 ? <p className="empty">No pending companies.</p> : (
                    <div className="list">
                      {pendingCompanies.map(comp => (
                        <div className="job-card" key={comp._id}>
                          <div className="job-info">
                            <div className="job-title">{comp.name}</div>
                            <div className="job-company">{comp.email}</div>
                            {comp.website && <a className="site-link" href={comp.website} target="_blank" rel="noreferrer">Visit Website ↗</a>}
                          </div>
                          <div className="row-actions"><button className="apply-btn" onClick={() => handleApproveCompany(comp._id)}>Approve</button><button className="admin-refresh danger" onClick={() => handleDelete("company", comp._id)}>Reject</button></div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="section-heading"><h2>Pending Jobs ({pendingJobs.length})</h2></div>
                  {pendingJobs.length === 0 ? <p className="empty">No pending jobs.</p> : (
                    <div className="list">
                      {pendingJobs.map(job => (
                        <div className="job-card" key={job._id}>
                          <div className="job-info">
                            <div className="job-title">{job.title}</div>
                            <div className="job-company">{job.companyName}</div>
                            <div className="job-tags">
                              <span className="tag tag-amber">₹{(job.salary / 100000).toFixed(1)} LPA</span>
                              <span className="tag tag-glass">Min CGPA {job.minCGPA}</span>
                              <span className="tag tag-glass">{job.allowedBranches?.join(", ")}</span>
                            </div>
                          </div>
                          <div className="row-actions"><button className="apply-btn" onClick={() => handleApproveJob(job._id)}>Approve</button><button className="admin-refresh danger" onClick={() => handleDelete("job", job._id)}>Reject</button></div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            )}

            {tab === "companies" && (
              <div className="list">
                {companies.length === 0 && <p className="empty">No companies registered.</p>}
                {companies.map(company => <article className="job-card" key={company._id}>
                  <div className="job-info"><div className="job-title">{company.name}</div><div className="job-company">{company.email}</div><div className="job-tags"><span className={`tag ${company.approved ? "match-ok" : "tag-glass"}`}>{company.approved ? "Approved" : "Pending"}</span></div></div>
                  <div className="row-actions"><button className="admin-refresh" onClick={() => handleEdit("company", company, "website", "Company website")}>Edit website</button><button className="admin-refresh danger" onClick={() => handleDelete("company", company._id)}>Delete</button></div>
                </article>)}
              </div>
            )}

            {tab === "jobs" && (
              <div className="list">
                {jobs.length === 0 && <p className="empty">No jobs posted.</p>}
                {jobs.map(job => <article className="job-card" key={job._id}>
                  <div className="job-info"><div className="job-title">{job.title}</div><div className="job-company">{job.companyName}</div><div className="job-tags"><span className={`tag ${job.approved ? "match-ok" : "tag-glass"}`}>{job.approved ? "Approved" : "Pending"}</span><span className="tag tag-glass">{job.status}</span></div></div>
                  <div className="row-actions"><button className="admin-refresh" onClick={() => handleEdit("job", job, "title", "Job title")}>Edit</button><button className="admin-refresh danger" onClick={() => handleDelete("job", job._id)}>Delete</button></div>
                </article>)}
              </div>
            )}

            {tab === "students" && (
              <div className="list">
                {students.length === 0 && <p className="empty">No students registered.</p>}
                {students.map(student => <article className="job-card" key={student._id}>
                  <div className="job-info"><div className="job-title"><button className="profile-link" onClick={() => onViewProfile(student._id)}>{student.name}</button></div><div className="job-company">{student.branch} · CGPA {student.cgpa} · {student.email}</div></div>
                  <div className="row-actions"><button className="admin-refresh" onClick={() => handleEdit("student", student, "cgpa", "CGPA (0 to 10)")}>Edit CGPA</button><button className="admin-refresh danger" onClick={() => handleDelete("student", student._id)}>Delete</button></div>
                </article>)}
              </div>
            )}

            {tab === "reports" && (
              <section className="list">
                {reports.length === 0 && <p className="empty">No reports submitted.</p>}
                {reports.map(report => <article className="notice-card report-card" key={report._id}>
                  <div><div className="job-tags"><span className="tag tag-amber">{report.type === "system_bug" ? "System bug" : `${report.subjectRole || "Account"} report`}</span><span className="tag tag-glass">{report.status}</span></div><p className="notice-msg">{report.description}</p><p className="notice-date">{report.reporterRole} report · {report.reporterName || report.reporterEmail || "Unknown reporter"} · {formatDate(report.createdAt)}</p></div>
                  <select value={report.status} onChange={event => handleReportStatus(report._id, event.target.value)} aria-label="Report status"><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option></select>
                </article>)}
              </section>
            )}

            {/* NOTICES TAB */}
            {tab === "notices" && (
              <>
                <form className="company-form" onSubmit={handlePostNotice}>
                  <div className="section-heading"><h2>Post a Notice</h2></div>
                  <div className="field full">
                    <textarea 
                      rows="3"
                      required
                      placeholder="Announce a placement drive, deadline, or update..."
                      value={newNotice}
                      onChange={e => setNewNotice(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-sm" style={{ marginTop: '0.5rem' }}>Broadcast Notice</button>
                </form>

                <div className="section-heading"><h2>Active Notices</h2></div>
                <div className="list">
                  {notices.length === 0 && <p className="empty">No active notices.</p>}
                  {notices.map(notice => (
                    <div className="notice-card notice-row" key={notice._id}>
                      <div>
                        <p className="notice-msg">{notice.message}</p>
                        <p className="notice-date">{formatDate(notice.date)} • By {notice.author}</p>
                      </div>
                      <button className="text-button danger" onClick={() => handleDeleteNotice(notice._id)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}