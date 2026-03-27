import { Router } from 'express';
import { activeSessions } from '../state';
import { suspects } from '../data/scenario';
import { generateSuspectResponse, ChatMessage } from '../services/gemini';

export const suspectRouter = Router();

suspectRouter.post('/chat', async (req, res) => {
  const { suspectId, message } = req.body;
  const sessionId = req.headers['x-session-id'] as string || 'default-session';

  if (!message || !suspectId) {
    return res.status(400).json({ error: "Missing suspectId or message" });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Game session not initialized" });
  }

  const suspect = suspects.find(s => s.id === suspectId);
  if (!suspect) {
    return res.status(404).json({ error: "Suspect not found" });
  }

  if (!session.suspectHistories[suspectId]) {
    session.suspectHistories[suspectId] = [];
  }

  const history = session.suspectHistories[suspectId];

  try {
    const aiResponse = await generateSuspectResponse(
      suspect.systemInstruction,
      history,
      message
    );

    // Save history (user message and model response)
    const newUserMsg: ChatMessage = { role: 'user', parts: [{ text: message }] };
    const newModelMsg: ChatMessage = { role: 'model', parts: [{ text: aiResponse }] };
    
    session.suspectHistories[suspectId].push(newUserMsg, newModelMsg);
    
    // limit history size to prevent context overflow (e.g. keep last N messages)
    if (session.suspectHistories[suspectId].length > 40) {
      session.suspectHistories[suspectId] = session.suspectHistories[suspectId].slice(-20);
    }

    res.json({ response: aiResponse });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});
