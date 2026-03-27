import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// ensure .env from root is loaded if run from backend folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY not found in environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const generateSuspectResponse = async (
  systemInstruction: string,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I have nothing to say.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I... I can't speak right now. (Error generating response)";
  }
};
