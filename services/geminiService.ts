import { GoogleGenAI } from "@google/genai";
import { GEMINI_PRO_MODEL } from '../constants';

// The API key is provided via process.env.GEMINI_API_KEY (mapped in vite.config.ts)
// Use the 'process.env.GEMINI_API_KEY' which is defined in vite.config.ts

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === 'PLACEHOLDER_API_KEY') {
    throw new Error("Gemini API Key is not set or is still a placeholder in .env.local (Expected VITE_GEMINI_API_KEY)");
  }
  return key;
};

export const sendMessageStream = async (message: string, onChunk: (text: string) => void) => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey(), apiVersion: 'v1beta' });

    // Using simple generateContentStream for now
    const response = await ai.models.generateContentStream({
      model: GEMINI_PRO_MODEL,
      contents: [{ role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are an expert PlayStation trophy guide assistant. 
        Your goal is to help users find trophies, understand requirements, and provide tips for getting the Platinum trophy.
        Keep your responses helpful, encouraging, and focused on PlayStation trophies.`,
      } as any
    });

    for await (const chunk of response) {
      const text = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};