import express from 'express';
import cors from 'cors';
import { generateCase, chatWithSuspect, evaluateAccusation } from './services/gemini.js';
import { casePrompt } from './prompts/casePrompt.js';
import { getSuspectPrompt } from './prompts/suspectPrompt.js';
import { getEvaluationPrompt } from './prompts/evaluationPrompt.js';
import { saveCase, getCase, getHistory, appendHistory } from './utils/memory.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/start', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || Date.now().toString();
    const caseData = await generateCase(casePrompt);
    
    saveCase(sessionId, caseData);

    const safeSuspects = caseData.suspects.map(s => ({
      id: s.id,
      name: s.name,
      identity: s.identity,
      personality: s.personality,
      alibi: s.alibi
    }));

    res.json({
      sessionId,
      case_summary: caseData.case_summary,
      victim: caseData.victim,
      suspects: safeSuspects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate case." });
  }
});

app.post('/api/interrogate', async (req, res) => {
  const { suspectId, userMessage } = req.body;
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !suspectId || !userMessage) {
    return res.status(400).json({ error: "Missing sessionId, suspectId, or userMessage" });
  }

  const caseData = getCase(sessionId);
  if (!caseData) return res.status(404).json({ error: "Case not found for session." });

  const suspect = caseData.suspects.find(s => s.id === suspectId);
  if (!suspect) return res.status(404).json({ error: "Suspect not found." });

  const systemPrompt = getSuspectPrompt(suspect, caseData);
  const history = getHistory(sessionId, suspectId);

  const reply = await chatWithSuspect(systemPrompt, history, userMessage, suspect);

  appendHistory(sessionId, suspectId, { role: 'user', parts: [{ text: userMessage }] });
  appendHistory(sessionId, suspectId, { role: 'model', parts: [{ text: reply }] });

  res.json({ response: reply });
});

app.post('/api/accuse', async (req, res) => {
  const { suspectId, reasoning } = req.body;
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !suspectId || !reasoning) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const caseData = getCase(sessionId);
  if (!caseData) return res.status(404).json({ error: "Case not found." });

  const suspect = caseData.suspects.find(s => s.id === suspectId);
  if (!suspect) return res.status(404).json({ error: "Suspect not found." });

  const isCulprit = (suspect.id === caseData.culprit_id);
  const prompt = getEvaluationPrompt(suspect.name, isCulprit, reasoning, caseData.case_summary);

  try {
    const evaluation = await evaluateAccusation(prompt);
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: "Evaluation failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(\`Backend running on port \${PORT}\`);
});
