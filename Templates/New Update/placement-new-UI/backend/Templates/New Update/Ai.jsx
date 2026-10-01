const { GoogleGenAI } = require('@google/genai');

// Use the environment variable in production!
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', verifyStudent, async (req, res) => {
    try {
        const { message, history } = req.body;
        const student = await Student.findById(req.user.id);
        
        // Context injection: Give the AI the student's data so it can personalize answers
        const systemInstruction = `
            You are VrikshaBot, the official AI career advisor for the VrikshaHire placement portal.
            You are currently talking to ${student.name}. 
            Student Profile: 
            - Branch: ${student.branch}
            - CGPA: ${student.cgpa}
            - Skills: ${student.skills?.join(', ') || 'Not specified yet'}
            
            Your job is to give short, highly practical advice on placements, interview preparation, and resume building. 
            Keep answers very concise (under 3 paragraphs). Be encouraging, professional, and directly reference their branch or skills when relevant.
        `;

        // Format history for the Gemini API
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        
        // Append the newest message
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        res.json({ reply: response.text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI is currently taking a coffee break. Try again in a moment.' });
    }
});



// Add to the bottom of src/api/api.js
export async function sendChatMessage(message, history) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message, history }),
  });
  return handleRes(res);
}

// make chatbot.jsx for below code  
import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/api";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "model", text: "Hi! I'm VrikshaBot ✨. I can help you prep for interviews or review your skills. What do you need help with?" }
  ]);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isOpen]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    
    // Optimistically add user message to UI
    const newHistory = [...history, { role: "user", text: userMsg }];
    setHistory(newHistory);
    setLoading(true);

    try {
      // Send previous context (excluding the very first greeting to save tokens)
      const apiHistory = newHistory.slice(1, -1);
      const data = await sendChatMessage(userMsg, apiHistory);
      
      setHistory([...newHistory, { role: "model", text: data.reply }]);
    } catch (err) {
      setHistory([...newHistory, { role: "model", text: "Oops, something went wrong connecting to my brain. Try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', width: '56px', height: '56px',
          borderRadius: '50%', background: '#24543b', color: '#fff', border: 'none',
          boxShadow: '0 8px 24px rgba(36, 84, 59, 0.25)', fontSize: '1.5rem',
          cursor: 'pointer', zIndex: 1000, display: 'grid', placeItems: 'center',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? "✕" : "✨"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '2rem', width: '350px', height: '480px',
          background: '#fff', borderRadius: '16px', boxShadow: '0 12px 32px rgba(28, 52, 37, 0.15)',
          border: '1px solid #e5eae5', display: 'flex', flexDirection: 'column', zIndex: 999,
          overflow: 'hidden', animation: 'appear 0.2s ease-out'
        }}>
          {/* Chat Header */}
          <div style={{ background: '#24543b', color: '#fff', padding: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✨</span> VrikshaBot AI
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#fbfcfb' }}>
            {history.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#edf4ef' : '#fff',
                border: `1px solid ${msg.role === 'user' ? '#cce0d3' : '#e5eae5'}`,
                color: '#17241d', padding: '0.6rem 0.9rem', borderRadius: '12px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: msg.role === 'model' ? '4px' : '12px',
                maxWidth: '85%', fontSize: '0.88rem', lineHeight: 1.5
              }}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid #e5eae5', padding: '0.6rem 0.9rem', borderRadius: '12px', borderBottomLeftRadius: '4px', fontSize: '0.88rem', color: '#718078' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ display: 'flex', padding: '0.8rem', background: '#fff', borderTop: '1px solid #e5eae5' }}>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask for interview tips..."
              style={{ flex: 1, padding: '0.6rem 0.8rem', border: '1px solid #dfe6df', borderRadius: '8px', outline: 'none', fontSize: '0.88rem' }}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{
              background: 'transparent', border: 'none', color: '#24543b', fontWeight: 700,
              padding: '0 0.8rem', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', opacity: input.trim() && !loading ? 1 : 0.5
            }}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}


// 1. Add this import at the top of Dashboard.jsx:
import Chatbot from "../components/Chatbot";


// ... inside your Dashboard component return statement ...
    
        {/* Drop it right at the bottom, just before the closing </div> of app-wrap */}
        <Chatbot />
      </div>
    </div>
  );
}