import { GoogleGenAI } from "@google/genai";
import { GEMINI_PRO_MODEL } from '../constants';

interface GameGuidanceResponse {
  hints: string;
  missables: string;
  strategies: string;
}

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === 'PLACEHOLDER_API_KEY') {
    throw new Error("Gemini API Key is not set or is still a placeholder in .env.local (Expected VITE_GEMINI_API_KEY)");
  }
  return key;
};

export const getGameGuidance = async (
  gameName: string,
  progress: string,
  signal?: AbortSignal,
): Promise<GameGuidanceResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey(), apiVersion: 'v1beta' });

    const systemInstruction = `You are an expert PlayStation trophy guide AI. 
      Your goal is to provide comprehensive, spoiler-free guidance, warnings about missable trophies, 
      and effective strategies for achieving trophies in video games. 
      Format your response strictly as a JSON object with three top-level keys: 'hints', 'missables', and 'strategies'. 
      Each key's value must be a markdown-formatted string relevant to the user's query and the specific game.`;

    const responseSchema = {
      type: 'object',
      properties: {
        hints: {
          type: 'string',
          description: 'Spoiler-free hints for general progress or current stuck point, formatted in markdown.',
        },
        missables: {
          type: 'string',
          description: 'Warnings about potentially missable trophies or items, formatted in markdown.',
        },
        strategies: {
          type: 'string',
          description: 'General or specific strategies for efficient trophy hunting, combat, or puzzle solving, formatted in markdown.',
        },
      },
      required: ['hints', 'missables', 'strategies'],
    };

    const prompt = `Game: ${gameName}\nMy Progress/Where I'm stuck: ${progress}\n\nPlease provide hints, missable trophy warnings, and strategies.`;

    const result = await ai.models.generateContent({
      model: GEMINI_PRO_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      } as any
    });

    console.log("Gemini API raw result:", result);

    const responseText = result.text || (result as any).candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      // Check if there was a finish reason or other issue
      const finishReason = (result as any).candidates?.[0]?.finishReason;
      if (finishReason) {
        throw new Error(`AI failed to generate content. Reason: ${finishReason}`);
      }
      throw new Error('No guidance could be generated. Please try again.');
    }

    console.log("Gemini API Text Output:", responseText);

    let parsedResponse: any;
    try {
      // Robust cleaning of potentially markdown-wrapped JSON
      const jsonContent = responseText.replace(/```json\n?|```/g, '').trim();
      parsedResponse = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      throw new Error("Failed to parse the AI guidance response. It might not be in valid JSON format.");
    }

    return parsedResponse as GameGuidanceResponse;
  } catch (error) {
    if ((error as any).name === 'AbortError') {
      console.log('Guidance fetch aborted');
      throw error;
    }
    console.error("Error getting game guidance from Gemini:", error);
    throw error;
  }
};
