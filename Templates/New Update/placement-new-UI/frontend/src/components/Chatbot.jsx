import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../api/api";

const greeting = "Hi! I'm VrikshaBot. I can help with interview preparation, placements, and resumes. What would you like help with?";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([{ role: "model", text: greeting }]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isOpen]);

  async function handleSend(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const previous = history.slice(1);
    const updated = [...history, { role: "user", text: message }];
    setHistory(updated);
    setInput("");
    setLoading(true);
    try {
      const result = await sendChatMessage(message, previous.slice(-8));
      setHistory(current => [...current, { role: "model", text: result.reply }]);
    } catch (error) {
      setHistory(current => [...current, { role: "model", text: error.message || "The assistant could not reply. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="vh-chat-toggle" type="button" onClick={() => setIsOpen(open => !open)} aria-label={isOpen ? "Close VrikshaBot" : "Open VrikshaBot"}>
        {isOpen ? "×" : "Ask VrikshaBot"}
      </button>
      {isOpen && (
        <section className="vh-chat-panel" aria-label="VrikshaBot career assistant">
          <header className="vh-chat-header">
            <div><strong>VrikshaBot</strong><small>Career assistant</small></div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">×</button>
          </header>
          <div className="vh-chat-messages" aria-live="polite">
            {history.map((item, index) => (
              <p className={`vh-chat-message ${item.role === "user" ? "user" : "bot"}`} key={`${index}-${item.role}`}>
                {item.text}
              </p>
            ))}
            {loading && <p className="vh-chat-typing">Thinking...</p>}
            <div ref={messagesEndRef} />
          </div>
          <form className="vh-chat-form" onSubmit={handleSend}>
            <input aria-label="Message VrikshaBot" maxLength={2000} value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about interview preparation..." disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()}>Send</button>
          </form>
        </section>
      )}
      <style>{`
        .vh-chat-toggle{position:fixed;right:24px;bottom:24px;z-index:1000;border:0;border-radius:999px;padding:15px 20px;background:#24543b;color:#fff;font:600 14px/1.2 sans-serif;box-shadow:0 8px 24px #183c2933;cursor:pointer}
        .vh-chat-panel{position:fixed;right:24px;bottom:84px;z-index:1000;width:min(370px,calc(100vw - 32px));height:min(520px,calc(100vh - 120px));display:flex;flex-direction:column;overflow:hidden;background:#fff;border:1px solid #e5eae5;border-radius:16px;box-shadow:0 14px 40px #1c342529;color:#17241d;font-family:inherit}
        .vh-chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#24543b;color:#fff}
        .vh-chat-header div{display:grid;gap:2px}.vh-chat-header small{opacity:.8}.vh-chat-header button{border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer}
        .vh-chat-messages{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#fbfcfb}
        .vh-chat-message{max-width:88%;margin:0;padding:10px 12px;border:1px solid #e5eae5;border-radius:12px;background:#fff;font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
        .vh-chat-message.user{align-self:flex-end;background:#edf4ef;border-color:#cce0d3}.vh-chat-message.bot{align-self:flex-start}.vh-chat-typing{margin:0;color:#718078;font-size:13px}
        .vh-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid #e5eae5}.vh-chat-form input{min-width:0;flex:1;padding:10px;border:1px solid #dfe6df;border-radius:8px;font:inherit}.vh-chat-form button{padding:0 12px;border:0;border-radius:8px;background:#24543b;color:#fff;font:inherit;cursor:pointer}.vh-chat-form button:disabled{opacity:.5;cursor:not-allowed}
        @media(max-width:480px){.vh-chat-toggle{right:16px;bottom:16px}.vh-chat-panel{right:16px;bottom:76px}}
      `}</style>
    </>
  );
}
