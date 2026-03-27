import { Router } from 'express';
import { scenario, suspects, killerId } from '../data/scenario';
import { activeSessions } from '../state';

export const gameRouter = Router();

gameRouter.get('/init', (req, res) => {
  // Normally generate a unique session ID and set in cookie.
  // For MVP, just return one fixed ID or let client manage it.
  const sessionId = req.headers['x-session-id'] as string || 'default-session';
  
  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, {
      id: sessionId,
      suspectHistories: {}
    });
  }

  res.json({
    scenario: {
      title: scenario.title,
      description: scenario.description,
      victim: scenario.victim,
    },
    suspects: suspects.map(s => ({
      id: s.id,
      name: s.name,
      age: s.age,
      description: s.description
    }))
  });
});

gameRouter.post('/accuse', (req, res) => {
  const { suspectId, reason } = req.body;

  if (suspectId === killerId) {
    res.json({
      success: true,
      message: "Congratulations, Detective! You correctly identified the killer. The evidence holds up in court.",
    });
  } else {
    res.json({
      success: false,
      message: "You accused the wrong person. The real killer slipped away, and the police commissioner wants your badge.",
    });
  }
});
