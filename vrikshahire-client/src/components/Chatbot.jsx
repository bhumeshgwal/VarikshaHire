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

  // All styling now lives in index.css (.vh-chat-*), including the phone bottom-sheet.
  return (
    <>
      <button className={`vh-chat-toggle${isOpen ? " open" : ""}`} type="button" onClick={() => setIsOpen(open => !open)} aria-label={isOpen ? "Close VrikshaBot" : "Open VrikshaBot"}>
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
    </>
  );
}