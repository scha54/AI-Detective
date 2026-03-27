import { ChatMessage } from './services/gemini';

export interface GameSession {
  id: string;
  suspectHistories: Record<string, ChatMessage[]>;
}

export const activeSessions = new Map<string, GameSession>();
