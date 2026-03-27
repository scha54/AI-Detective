// In-memory store
const sessions = new Map();

export const getSession = (sessionId) => {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      caseData: null,
      chatHistory: {} // suspectId -> array of messages
    });
  }
  return sessions.get(sessionId);
};

export const saveCase = (sessionId, caseData) => {
  const session = getSession(sessionId);
  session.caseData = caseData;
};

export const getCase = (sessionId) => {
  return getSession(sessionId).caseData;
};

export const getHistory = (sessionId, suspectId) => {
  const session = getSession(sessionId);
  if (!session.chatHistory[suspectId]) {
    session.chatHistory[suspectId] = [];
  }
  return session.chatHistory[suspectId];
};

export const appendHistory = (sessionId, suspectId, message) => {
  const session = getSession(sessionId);
  const history = getHistory(sessionId, suspectId);
  history.push(message);
  
  // Keep last 10 messages (5 turns)
  if (history.length > 10) {
    session.chatHistory[suspectId] = history.slice(-10);
  }
};
