import { Type } from "@google/genai";

// ------------------------------------------------------------------
// TOOL DECLARATIONS (Verktygsdefinitioner)
// Här definierar vi för AI-modellen VILKA funktioner (verktyg) som
// finns tillgängliga och VAD de gör. Detta är instruktioner till Gemini.
// ------------------------------------------------------------------

export const sayHelloDeclaration = {
  // Namnet måste matcha exakt i toolExecutor när funktionen körs
  name: "say_hello",
  // En tydlig beskrivning är superviktig för att AI:n ska förstå när
  // den ska välja detta verktyg.
  description:
    "A simple test function that prints hello in the browser console and returns a hello message. Use this to verify that frontend function calling works.",
  parameters: {
    // Definierar vilka argument (inputs) funktionen behöver
    type: Type.OBJECT,
    properties: {}, // say_hello tar inga argument just nu
  },
};

// Samla alla deklarationer i en array som vi kan skicka till modellen
export const aiDevTools = [
  {
    functionDeclarations: [sayHelloDeclaration],
  },
];
