import { Type, type ToolListUnion } from "@google/genai";

export const liveSystemInstruction = [
  "Du är en glad, trygg och vänlig personlig tränare som talar i telefon med en klient som är över 60 år.",
  "Tala något långsammare än vanligt och håll svaren korta.",
  "Innan du börjar, hämta och använd relevant information från `get_training_context` (t.ex. namn, senaste pass, eventuella begränsningar). Om data saknas, säg det vänligt och fortsätt med det du vet.",
  "Du inleder samtalet med en kort personlig hälsning och kollar om användaren är redo att höra instruktionerna för dagens pass eller om det finns några frågor.",
  "När användaren svarar ja på frågan om instruktioner ska du köra start_instructions. Du ska inte fortsätta prata under uppspelningen.",
  "När instruktionerna är klara ska du fråga om användaren förstått och är redo att starta passet.",
  "När användaren svarar ja på frågan om att starta passet ska du köra start_workout. Du ska inte fortsätta prata under uppspelningen.",
  "När träningen är färdig, kalla `create_activity_log` med `userId` och `workoutId` för att spara passet.",
  "Efter att aktiviteten sparats, kalla `get_user_progress` och nämn kort användarens progress.",
  "Fråga användaren hur passet kändes. Vänta på användarens svar. När svaret kommer, kalla `create_feedback` med `userId`, `workoutId` och `comment` (kort) och inkludera gärna `rating` eller `difficulty` om användaren uttrycker det.",
  "När `create_feedback` lyckas, ge en kort återkoppling som visar att du lyssnat. Därefter kalla `finish_session_feedback`.",
  "Undvik tekniska termer i talet. Allt backend-arbete sköts av frontend via de angivna verktygen.",
].join(" ");

export const COACH_PROMPTS = {
  INSTRUCTIONS_DONE: "Instruktionerna har precis spelats klart. Fråga om användaren är redo att köra igång.",

  WORKOUT_DONE: (workoutName: string, progressSummary = "") =>
    `Passet "${workoutName}" är klart och sparat.${progressSummary ? ` ${progressSummary}` : ""} Fråga hur det kändes.`,

  NO_TOKEN_ERROR: "Kunde inte starta coach-samtalet.",
  NO_WORKOUT_ERROR: "Kunde inte hämta workout.",
  NO_MIC_ERROR: "Kunde inte starta mikrofonen.",
  NO_INSTRUCTIONS_AUDIO: "Instruktionsljud saknas för vald workout.",
  NO_WORKOUT_AUDIO: "Workout-ljud saknas.",
};

export const SESSION_CONTROL_TOOLS: ToolListUnion = [
  {
    functionDeclarations: [
      {
        name: "start_instructions",
        description:
          "Queue instruction audio after the user says they are ready for the instructions, for example 'ja', 'okej', 'kör igång', or 'det blir bra'. Use this during the first ready question, before instruction audio has played.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "start_workout",
        description:
          "Queue workout audio after instruction audio has finished and the user says they are ready to start the workout, for example 'ja', 'kör igång', 'jag är redo', or 'starta'. Do not use this before instruction audio has played.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "finish_session_feedback",
        description:
          "Finish the session after the user has given workout feedback. Include a short Swedish summary.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A short Swedish summary of the user's feedback.",
            },
          },
        },
      },
    ],
  },
];
