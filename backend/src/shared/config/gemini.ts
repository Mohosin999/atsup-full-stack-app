import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

export const genAI = new GoogleGenAI({ apiKey: env.geminiApiKey });
export const GEMINI_MODEL = "gemini-2.5-flash";
// export const GEMINI_MODEL = "gemini-3.1-flash-lite";
