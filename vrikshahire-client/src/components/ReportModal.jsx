import { useState } from "react";
import { submitReport } from "../api/api";

export default function ReportModal({ onClose, onSubmitted, initialType = "system_bug", subjectContext, messageContext }) {
  const [type, setType] = useState(initialType);
  const [subjectRole, setSubjectRole] = useState("student");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      await submitReport({ type, subjectRole: type === "account_report" ? subjectRole : undefined, subjectId: subjectContext?.subjectId, messageId: messageContext?.messageId, applicationId: messageContext?.applicationId, description });
      onSubmitted?.("Your report was sent to the placement admin."); onClose();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <form className="modal-card" onSubmit={submit} onMouseDown={event => event.stopPropagation()}>
      <div className="section-heading"><h2>Report an issue</h2><button type="button" className="text-button" onClick={onClose}>Close</button></div>
      <div className="field"><label>Report type</label><select disabled={initialType === "message_report"} value={type} onChange={event => setType(event.target.value)}><option value="system_bug">System bug</option><option value="account_report">Company or student report</option>{initialType === "message_report" && <option value="message_report">Message report</option>}</select></div>
      {type === "account_report" && <div className="field"><label>Account type</label><select value={subjectRole} onChange={event => setSubjectRole(event.target.value)}><option value="student">Student</option><option value="company">Company</option></select></div>}
      <div className="field"><label>What happened?</label><textarea required minLength="10" maxLength="2000" value={description} onChange={event => setDescription(event.target.value)} placeholder="Describe the bug or explain the concern, such as a false profile or incorrect salary." /></div>
      {error && <p className="msg-error">{error}</p>}<button className="btn" disabled={saving}>{saving ? "Sending..." : "Send report"}</button>
    </form>
  </div>;
}
