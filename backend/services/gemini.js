import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

export const generateCase = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      }
    });
    return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini Error generating case:", err);
    throw new Error("Failed to generate case");
  }
};

export const evaluateResponseConsistency = async (responseTxt, suspectInfo) => {
  const prompt = `You are a consistency checker. 
Check if this response: "${responseTxt}"
Contradicts this suspected person's alibi: "${suspectInfo.alibi}"
Reply strict JSON: {"contradiction": boolean}`;
  
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.1 }
    });
    return JSON.parse(res.text).contradiction;
  } catch (e) {
    return false; // assume okay on error
  }
};

export const chatWithSuspect = async (systemInstruction, history, newMessage, suspectInfo, attempt = 1) => {
  try {
    const contents = [
      ...history,
      { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I have nothing to say.";

    if (attempt === 1) {
      const isContradiction = await evaluateResponseConsistency(reply, suspectInfo);
      if (isContradiction) {
        console.log("Contradiction detected, regenerating...");
        return await chatWithSuspect(systemInstruction, history, newMessage, suspectInfo, 2);
      }
    }

    return reply;
  } catch (err) {
    console.error("Gemini API Error in Chat:", err);
    return "I can't answer that right now... (Server Error)";
  }
};

export const evaluateAccusation = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });
    return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini Error evaluating accusation:", err);
    throw new Error("Failed to evaluate explanation");
  }
};
