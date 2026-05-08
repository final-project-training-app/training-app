// frontend/src/features/ai-dev/runSimpleFunctionCall.ts
import { gemini } from "./geminiClient";
import { aiDevTools } from "./toolDeclarations";
import { executeAiDevTool } from "./toolExecutor";

export async function runSimpleFunctionCall() {
  // STEG 1: Förbered vad användaren säger
  // Vi ber Gemini att använda funktionen say_hello.
  const userMessage: any = {
    role: "user",
    parts: [
      {
        text: "Call the say_hello function. After it returns, tell me what happened in Swedish.",
      },
    ],
  };

  // STEG 2: Skicka till Gemini.
  // Vi skickar med "aiDevTools" (vår toolDeclaration) och tvingar den med mode "ANY".
  const firstResponse = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [userMessage],
    config: {
      tools: aiDevTools,
      toolConfig: {
        functionCallingConfig: {
          mode: "ANY" as any, // TypeScript workaround: "ANY" tvingar modellen att kalla funktionen
          allowedFunctionNames: ["say_hello"],
        },
      },
    },
  });

  // STEG 3: Kontrollera vad Gemini bestämde sig för att göra.
  // Vi tittar i svaret för att se om AI:n faktiskt gjorde en "functionCall".
  const functionCall = firstResponse.functionCalls?.[0];

  if (!functionCall || !functionCall.name) {
    return {
      modelText: "Ingen function call kom tillbaka, modellen gav bara text.",
      toolResult: null,
      functionCall: null,
    };
  }

  // STEG 4: Frontend utför jobbet!
  // Gemini hämtar ingen data, Gemini bara säger -> "Kör say_hello".
  // executeAiDevTool är VÅR lokala funktion i toolExecutor.ts.
  const toolResult = await executeAiDevTool(functionCall.name);

  // STEG 5: Bygg upp historiken
  // För att Gemini ska förstå svaret, måste vi skicka en historia som innehåller:
  // 1. Vår fråga (userMessage)
  // 2. Geminis försök till functionCall (firstResponse.candidates[0].content)
  // 3. Vårt svar tillbaka från executionen (functionResponse)
  const history: any[] = [
    userMessage,
    firstResponse.candidates![0].content,
    {
      role: "user",
      parts: [
        {
          functionResponse: {
            name: functionCall.name,
            id: functionCall.id,
            response: { result: toolResult }, // Svaret som kom tillbaka från executeAiDevTool
          },
        },
      ],
    },
  ];

  // STEG 6: Det sista anropet.
  // Vi skickar hela historiken till Gemini. Nu ser den sitt toolResult och svarar riktigt.
  const finalResponse = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: history,
    config: {
      tools: aiDevTools, // Fortsätt ge den tools ifall den behöver dem
    },
  });

  // Returnera resultaten så de kan visas på er Dev Page
  return {
    modelText: finalResponse.text ?? "",
    toolResult,
    functionCall: {
      id: functionCall.id,
      name: functionCall.name,
      args: functionCall.args,
    },
  };
}
