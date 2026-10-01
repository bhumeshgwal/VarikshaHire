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