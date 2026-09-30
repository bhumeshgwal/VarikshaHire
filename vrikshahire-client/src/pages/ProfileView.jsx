import { useEffect, useState } from "react";
import { getStudentProfile } from "../api/api";

export default function ProfileView({ studentId, onBack, onEdit }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentProfile(studentId).then(data => setProfile(data.profile)).catch(err => setError(err.message));
  }, [studentId]);

  if (error) return <main className="main"><button className="admin-refresh" onClick={onBack}>Back</button><p className="flash msg-error">{error}</p></main>;
  if (!profile) return <main className="main"><p className="empty">Loading profile...</p></main>;

  return <div className="app-wrap">
    <header className="header"><div className="header-logo"><div className="header-dot">V</div><span className="header-title">Student profile</span></div><button className="logout-btn" onClick={onBack}>Back</button></header>
    <main className="main">
      <section className="company-form profile-view">
        <div className="application-main"><div className="applicant-avatar profile-avatar">{profile.name?.charAt(0)}</div><div><h1>{profile.name}</h1><p className="job-company">{profile.branch}</p></div></div>
        {onEdit && <button className="admin-refresh" onClick={onEdit}>Edit profile</button>}
        {profile.headline && <h2 className="profile-headline">{profile.headline}</h2>}
        {profile.bio && <p className="notice-msg">{profile.bio}</p>}
        {(profile.email || profile.cgpa !== undefined || profile.backlogs !== undefined) && <div className="job-tags"><span className="tag tag-glass">{profile.email}</span>{profile.cgpa !== undefined && <span className="tag tag-glass">CGPA {profile.cgpa}</span>}{profile.backlogs !== undefined && <span className="tag tag-glass">Backlogs {profile.backlogs}</span>}</div>}
        <div className="section-heading" style={{ marginTop: "1.5rem" }}><h2>Skills</h2></div>
        <div className="job-tags">{profile.skills.length ? profile.skills.map(skill => <span className="tag tag-glass" key={skill}>{skill}</span>) : <span className="job-company">No skills added.</span>}</div>
        <div className="section-heading" style={{ marginTop: "1.5rem" }}><h2>Projects</h2></div>
        <div className="list">{profile.projects.length ? profile.projects.map((project, index) => <article className="notice-card" key={`${project.title}-${index}`}><strong>{project.title}</strong><p className="notice-msg">{project.description}</p></article>) : <p className="empty">No projects added.</p>}</div>
        <div className="job-tags" style={{ marginTop: "1rem" }}>{profile.githubUrl && <a className="tag tag-glass" href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}{profile.linkedinUrl && <a className="tag tag-glass" href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}{profile.resumeLink && <a className="tag tag-glass" href={profile.resumeLink} target="_blank" rel="noreferrer">Resume</a>}</div>
      </section>
    </main>
  </div>;
}
