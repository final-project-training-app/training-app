// ------------------------------------------------------------------
// TOOL EXECUTOR (Verktygsutförare)
// Detta är själva motorn som utför handlingen på klientsidan NÄR
// Gemini ber oss att köra en specifik funktion.
// Den här filen är platsen där du senare kan lägga till anrop till er backend.
// ------------------------------------------------------------------
export async function executeAiDevTool(name: string, _args?: any) {
  // Steg 1: Matcha namnet från AI:ns functionCall
  if (name === "say_hello") {
    // Steg 2: Utför logiken lokalt på maskinen (här: logga i webbläsaren)
    console.log("hej");

    // Steg 3: Returnera ett resultat som vi kan skicka tillbaka till AI:n
    return {
      ok: true,
      message: "hej från frontend-tool",
    };
  }

  // Om AI:n hittat på en funktion som inte finns
  throw new Error(`Unknown tool: ${name}`);
}
