import { GoogleGenAI } from "@google/genai";
import { env } from "./env";
import { isGeminiQuotaError } from "../ai/gemini/geminiErrors";

// export const genAI = new GoogleGenAI({ apiKey: env.geminiApiKey });
export const GEMINI_MODEL = "gemini-2.5-flash";
// export const GEMINI_MODEL = "gemini-3.1-flash-lite";

const keys = [env.geminiApiKey, env.geminiApiKeySecondary].filter(
  Boolean,
) as string[];

let activeIndex = 0;

function getClient(index: number): GoogleGenAI {
  return new GoogleGenAI({ apiKey: keys[index] });
}

export async function generateContentWithFailover(params: {
  model: string;
  contents: any[];
}): Promise<any> {
  for (let attempt = 0; attempt < keys.length + 1; attempt++) {
    const keyIndex = (activeIndex + attempt) % keys.length;
    try {
      const client = getClient(keyIndex);
      const result = await client.models.generateContent(params);
      activeIndex = keyIndex;
      return result;
    } catch (error) {
      if (!isGeminiQuotaError(error)) throw error;
      console.warn(`[gemini] key ${keyIndex} quota exceeded`);
    }
  }

  throw new Error("AI service quota exceeded. Please try again tomorrow.");
}
