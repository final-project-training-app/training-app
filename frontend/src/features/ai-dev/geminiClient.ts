import { GoogleGenAI } from "@google/genai";

// ------------------------------------------------------------------
// GEMINI CLIENT
// Enkel initiering av det nya Google GenAI-SDK:t.
// Se till att du har VITE_GEMINI_API_KEY i din .env.local!
// ------------------------------------------------------------------
export const gemini = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});
