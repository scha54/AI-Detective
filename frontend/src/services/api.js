// Use Vite env var for production API endpoint, fallback to relative path locally
const BASE_URL = import.meta.env.VITE_API_URL || '';

let currentSessionId = localStorage.getItem('detectiveSessionId') || Date.now().toString();
localStorage.setItem('detectiveSessionId', currentSessionId);

export const authHeader = () => ({
  'Content-Type': 'application/json',
  'x-session-id': currentSessionId
});

export const api = {
  start: async () => {
    currentSessionId = Date.now().toString();
    localStorage.setItem('detectiveSessionId', currentSessionId);
    
    const res = await fetch(`${BASE_URL}/api/start`, {
      method: 'POST',
      headers: authHeader(),
    });
    return res.json();
  },

  interrogate: async (suspectId, userMessage) => {
    const res = await fetch(`${BASE_URL}/api/interrogate`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ suspectId, userMessage })
    });
    return res.json();
  },

  accuse: async (suspectId, reasoning) => {
    const res = await fetch(`${BASE_URL}/api/accuse`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ suspectId, reasoning })
    });
    return res.json();
  }
};
