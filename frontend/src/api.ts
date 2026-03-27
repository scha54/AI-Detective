export interface Suspect {
  id: string;
  name: string;
  age: number;
  description: string;
}

export interface Scenario {
  title: string;
  description: string;
  victim: string;
}

export interface GameInitResponse {
  scenario: Scenario;
  suspects: Suspect[];
}

export interface Message {
  id: string;
  role: 'user' | 'suspect';
  text: string;
}

export const API = {
  getInit: async (): Promise<GameInitResponse> => {
    const res = await fetch('/api/game/init');
    return res.json();
  },
  
  chat: async (suspectId: string, message: string): Promise<{ response: string }> => {
    const res = await fetch('/api/suspect/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspectId, message })
    });
    return res.json();
  },

  accuse: async (suspectId: string, reason: string): Promise<{ success: boolean, message: string }> => {
    const res = await fetch('/api/game/accuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspectId, reason })
    });
    return res.json();
  }
};
