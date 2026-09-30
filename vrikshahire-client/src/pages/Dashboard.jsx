import { useState, useEffect } from "react";
import { getEligibleJobs, getNotices, getMyApplications, applyToJob, getMyProfile, updateMyProfile, searchPeople, logout } from "../api/api";
import Chatbot from "../components/Chatbot";
import ReportModal from "../components/ReportModal";
import AccountMenu from "../components/AccountMenu";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

// Pipeline logic: If rejected, only "Applied" is marked done, and the bar dims
function getStepClass(currentStatus, stepIndex) {
  if (currentStatus === "rejected") return stepIndex === 0 ? "done" : "";
  const stages = ["applied", "shortlisted", "interview", "selected"];
  return stages.indexOf(currentStatus) >= stepIndex ? "done" : "";
}

export default function Dashboard({ onLogout, onViewProfile, onMessages }) {
  const [jobs, setJobs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({ skills: "", resumeUrl: "", projects: [] });
  
  const [tab, setTab] = useState("jobs");
  const [appFilter, setAppFilter] = useState("all");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [people, setPeople] = useState([]);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    Promise.all([getEligibleJobs(), getNotices(), getMyApplications(), getMyProfile()])
      .then(([jobsData, noticesData, appsData, profileData]) => {
        setJobs((jobsData.jobs || []).sort((a, b) => b.matchScore - a.matchScore));
        setNotices(noticesData.notices || []);
        setApplications(appsData.applications || []);
        
        if (profileData.student) {
          setProfile({
            ...profileData.student,
            skills: profileData.student.skills?.join(", ") || "",
            projects: profileData.student.projects || []
          });
        }
      })
      .catch(err => setMessage({ text: err.message, type: "err" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "people") return;
    searchPeople(peopleQuery).then(data => setPeople(data.students || [])).catch(err => setMessage({ text: err.message, type: "err" }));
  }, [tab, peopleQuery]);

  async function handleApply(jobId) {
    setApplyingId(jobId);
    setMessage({ text: "", type: "" });
    try {
      const result = await applyToJob(jobId);
      const appliedJob = jobs.find(j => j._id === jobId);
      setApplications(curr => [{ ...result.data, jobId: appliedJob }, ...curr]);
      setMessage({ text: "Application submitted successfully.", type: "ok" });
    } catch (err) {
      setMessage({ text: err.message, type: "err" });
    } finally {
      setApplyingId(null);
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const updates = {
        headline: profile.headline,
        bio: profile.bio,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        resumeLink: profile.resumeLink || profile.resumeUrl,
        skills: profile.skills.split(",").map(s => s.trim()).filter(Boolean),
        projects: profile.projects
      };
      await updateMyProfile(updates);
      setMessage({ text: "Profile updated successfully!", type: "ok" });
    } catch (err) {
      setMessage({ text: err.message, type: "err" });
    } finally {
      setSaving(false);
    }
  }

  function addEmptyProject() {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", techStack: "", liveUrl: "", githubUrl: "" }]
    }));
  }

  function updateProject(index, field, value) {
    const newProjects = [...profile.projects];
    newProjects[index][field] = value;
    setProfile(prev => ({ ...prev, projects: newProjects }));
  }

  const hasApplied = (jobId) => applications.some(a => (a.jobId?._id || a.jobId) === jobId);
  const filteredApps = appFilter === "all" ? applications : applications.filter(a => a.status === appFilter);
  const completeFields = [profile.headline, profile.bio, profile.skills, profile.resumeLink || profile.resumeUrl, profile.githubUrl, profile.linkedinUrl, profile.projects?.length].filter(Boolean).length;
  const completeness = Math.round((completeFields / 7) * 100);

  return (
    <div className="app-wrap">
      <header className="header">
        <div className="header-logo">
          <div className="header-dot">V</div>
          <span className="header-title">VrikshaHire</span>
        </div>
        <AccountMenu onInbox={onMessages} onReport={() => setReportOpen(true)} onLogout={() => { logout(); onLogout(); }} />
      </header>

      <div className="main">
        <div className="tab-bar">
          {["jobs", "applications", "profile", "people", "notices"].map(t => (
            <button key={t} className={`tab-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t === "applications" ? `Applications (${applications.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {message.text && (
          <div className={`flash ${message.type === "ok" ? "msg-ok" : "msg-error"}`}>
            {message.text}
          </div>
        )}

        {loading ? <p className="empty">Loading dashboard...</p> : (
          <>
            {/* JOBS TAB */}
            {tab === "jobs" && (
              <div className="list">
                {jobs.length === 0 && <p className="empty">No jobs available.</p>}
                {jobs.map(job => (
                  <div key={job._id} className={`job-card ${!job.isEligible ? "blocked" : ""}`}>
                    <div className="job-info">
                      <div className="job-title">{job.title}</div>
                      <div className="job-company">{job.companyName}</div>
                      <div className="job-tags">
                        <span className="tag tag-amber">₹{(job.salary / 100000).toFixed(1)} LPA</span>
                        <span className={`tag match ${job.matchScore >= 75 ? "match-ok" : job.matchScore < 50 ? "match-low" : "tag-glass"}`}>
                          {job.matchScore}% Match
                        </span>
                        {job.deadline && <span className="tag tag-glass">Closes {formatDate(job.deadline)}</span>}
                      </div>
                      
                      {!job.isEligible && (
                        <ul className="job-reason">
                          {job.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      )}
                    </div>
                    
                    <button
                      className={`apply-btn ${hasApplied(job._id) ? "applied" : ""}`}
                      onClick={() => handleApply(job._id)}
                      disabled={!job.isEligible || hasApplied(job._id) || applyingId === job._id}
                    >
                      {hasApplied(job._id) ? "Applied" : applyingId === job._id ? "Applying..." : !job.isEligible ? "Not Eligible" : "Apply"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {tab === "applications" && (
              <section className="student-applications">
                <div className="status-chips">
                  {["all", "applied", "shortlisted", "interview", "selected", "rejected"].map(filter => (
                    <button key={filter} className={`chip ${appFilter === filter ? "active" : ""}`} onClick={() => setAppFilter(filter)}>
                      {filter} <b>{filter === "all" ? applications.length : applications.filter(a => a.status === filter).length}</b>
                    </button>
                  ))}
                </div>

                <div className="application-list">
                  {filteredApps.length === 0 && <p className="empty">No applications found.</p>}
                  {filteredApps.map(app => (
                    <article className="application-card student-application-card" key={app._id}>
                      <div className="application-main">
                        <div>
                          <strong className="job-title">{app.jobId?.title || "Unknown Job"}</strong>
                          <span className="job-company">{app.jobId?.companyName}</span>
                        </div>
                        <span className={`status-${app.status} tag`} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                          {app.status}
                        </span>
                      </div>
                      
                      <ul className={`stepper ${app.status === 'rejected' ? 'rejected' : ''}`}>
                        {["Applied", "Shortlisted", "Interview", "Selected"].map((step, idx) => (
                          <li key={step} className={getStepClass(app.status, idx)}>
                            <div className="step-dot"></div>
                            {step}
                          </li>
                        ))}
                      </ul>
                      <button className="admin-refresh" onClick={onMessages}>Open in Messages</button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* PROFILE TAB */}
            {tab === "profile" && (
              <form className="company-form" onSubmit={handleProfileSave}>
                <div className="section-heading"><h2>Your Profile</h2></div>
                <p className="job-company">Profile completeness: {completeness}%</p>
                <div className="form-grid">
                  <div className="field full"><label>Headline</label><input value={profile.headline || ""} onChange={e => setProfile({...profile, headline: e.target.value})} placeholder="Aspiring backend developer" /></div>
                  <div className="field full"><label>About you</label><textarea value={profile.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Write a short introduction..." /></div>
                  <div className="field full">
                    <label>Skills (comma separated)</label>
                    <input value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="React, Node.js, MongoDB" />
                  </div>
                  <div className="field full">
                    <label>Resume Link (Google Drive / Portfolio)</label>
                    <input type="url" value={profile.resumeLink || profile.resumeUrl || ""} onChange={e => setProfile({...profile, resumeLink: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="field"><label>GitHub profile</label><input type="url" value={profile.githubUrl || ""} onChange={e => setProfile({...profile, githubUrl: e.target.value})} placeholder="https://github.com/..." /></div>
                  <div className="field"><label>LinkedIn profile</label><input type="url" value={profile.linkedinUrl || ""} onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." /></div>
                </div>

                <div className="section-heading" style={{ marginTop: '1.5rem' }}>
                  <h2>Projects</h2>
                  <button type="button" className="btn btn-sm" onClick={addEmptyProject} style={{ background: '#edf1ed', color: '#17241d' }}>+ Add Project</button>
                </div>
                
                {profile.projects.map((proj, i) => (
                  <div key={i} style={{ background: '#fbfcfb', padding: '1rem', border: '1px solid #e5eae5', borderRadius: '10px', marginBottom: '1rem' }}>
                    <div className="form-grid">
                      <div className="field full"><label>Project Title</label><input required value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} /></div>
                      <div className="field full"><label>Description</label><input value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} /></div>
                      <div className="field"><label>GitHub Link</label><input type="url" value={proj.githubUrl} onChange={e => updateProject(i, 'githubUrl', e.target.value)} /></div>
                      <div className="field"><label>Live Link</label><input type="url" value={proj.liveUrl} onChange={e => updateProject(i, 'liveUrl', e.target.value)} /></div>
                    </div>
                  </div>
                ))}

                <button type="submit" className="btn" disabled={saving} style={{ marginTop: '1rem' }}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </form>
            )}

            {tab === "people" && (
              <section className="list">
                <div className="field"><label>Search students</label><input value={peopleQuery} onChange={event => setPeopleQuery(event.target.value)} placeholder="Name, skill, or branch" /></div>
                {people.length === 0 && <p className="empty">No students found.</p>}
                {people.map(person => <button className="job-card profile-card" key={person._id} onClick={() => onViewProfile(person._id)}>
                  <span className="applicant-avatar">{person.name?.charAt(0)}</span><span className="job-info"><strong className="job-title">{person.name}</strong><span className="job-company">{person.branch} {person.headline ? `· ${person.headline}` : ""}</span><span className="job-tags">{person.skills?.slice(0, 3).map(skill => <span className="tag tag-glass" key={skill}>{skill}</span>)}</span></span>
                </button>)}
              </section>
            )}

            {/* NOTICES TAB */}
            {tab === "notices" && (
              <div className="list">
                {notices.length === 0 && <p className="empty">No notices yet.</p>}
                {notices.map(notice => (
                  <div key={notice._id} className="notice-card">
                    <p className="notice-msg">{notice.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.45rem' }}>
                      <span className="notice-date">{formatDate(notice.date)}</span>
                      <span className="tag tag-glass">{notice.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} onSubmitted={text => setMessage({ text, type: "ok" })} />}
      <Chatbot />
    </div>
  );
}
