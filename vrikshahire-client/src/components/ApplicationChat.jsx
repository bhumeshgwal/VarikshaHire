import { useEffect, useState } from "react";
import { getApplicationMessages, sendApplicationMessage } from "../api/api";
import ReportModal from "./ReportModal";

export default function ApplicationChat({ application, onClose, embedded = false }) {
  const [messages, setMessages] = useState([]); const [draft, setDraft] = useState(""); const [error, setError] = useState(""); const [sending, setSending] = useState(false); const [reply, setReply] = useState(null); const [reportMessage, setReportMessage] = useState(null);
  const role = localStorage.getItem("role");
  const studentCanSend = role !== "student" || ["shortlisted", "interview", "selected"].includes(application.status);
  useEffect(() => { getApplicationMessages(application._id).then(data => setMessages(data.messages || [])).catch(err => setError(err.message)); }, [application._id]);
  async function submit(event) {
    event.preventDefault(); if (!draft.trim() || !studentCanSend) return; setSending(true); setError("");
    try { const data = await sendApplicationMessage(application._id, draft.trim(), reply?._id); setMessages(current => [...current, data.message]); setDraft(""); setReply(null); }
    catch (err) { setError(err.message); } finally { setSending(false); }
  }
  const name = role === "company" ? application.studentId?.name || "Applicant" : application.jobId?.companyName || "Company";
  const content = <section className={`chat-card ${embedded ? "chat-page" : "modal-card"}`}>
    <div className="section-heading"><div><h2>Message {name}</h2><span>About {application.jobId?.title || "this application"}</span></div><button className="text-button" onClick={onClose}>{embedded ? "Back to inbox" : "Close"}</button></div>
    <div className="message-list">{messages.length === 0 ? <p className="empty">Start the conversation.</p> : messages.map(message => <div className={`message-bubble ${message.senderRole === role ? "mine" : ""}`} key={message._id}>{message.replyTo && <div className="reply-reference">Replying to {message.replyTo.senderRole}: {message.replyTo.message}</div>}<span>{message.message}</span><small>{new Date(message.createdAt).toLocaleString()}</small><div className="message-actions"><button onClick={() => setReply(message)}>Reply</button><button onClick={() => setReportMessage(message)}>Report</button></div></div>)}</div>
    {reply && <div className="reply-banner">Replying to: {reply.message}<button className="text-button" onClick={() => setReply(null)}>Cancel</button></div>}
    {!studentCanSend && <p className="flash msg-error">Messaging unlocks after the company shortlists you, invites you to interview, or selects you.</p>}
    {error && <p className="msg-error">{error}</p>}<form className="chat-compose" onSubmit={submit}><input value={draft} disabled={!studentCanSend} maxLength="2000" onChange={event => setDraft(event.target.value)} placeholder={studentCanSend ? "Write a message..." : "Messaging is locked until your application advances."} aria-label="Message" /><button className="apply-btn" disabled={sending || !studentCanSend}>{sending ? "Sending" : "Send"}</button></form>
  </section>;
  return <>{embedded ? <div className="app-wrap"><header className="header"><div className="header-logo"><div className="header-dot">V</div><span className="header-title">Messages</span></div></header><main className="main">{content}</main></div> : <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div onMouseDown={event => event.stopPropagation()}>{content}</div></div>}{reportMessage && <ReportModal initialType="message_report" messageContext={{ messageId: reportMessage._id, applicationId: application._id }} onClose={() => setReportMessage(null)} />}</>;
}
