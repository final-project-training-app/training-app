import { Type, type ToolListUnion } from "@google/genai";

const joinPrompt = (...parts: string[]) => parts.join(" ");

export const READY_ACK_PHRASE = "vad bra! nu kör vi igång";

export const COACH_PROMPTS = {
  ASK_PLAY_INSTRUCTIONS: (name: string) =>
    joinPrompt(
      `Vi har ett kort träningspass: "${name}".`,
      "Vill du att jag spelar instruktionerna?",
      "Fråga: 'Okej — är du nu redo att köra igång med träningen?'",
      "När användaren svarar ja, säg exakt 'Vad bra! Nu kör vi igång.' och kalla start_instructions.",
    ),

  INSTRUCTIONS_DONE: joinPrompt(
    "Instruktionerna är klara.",
    "Fråga: 'Okej — är du nu redo att köra igång med träningen?'",
    "När användaren svarar 'ja', säg exakt 'Vad bra! Nu kör vi igång.' och kalla start_workout.",
  ),

  WORKOUT_DONE: (workoutName: string, progressSummary = "") =>
    joinPrompt(
      `Workouten "${workoutName}" är klar.`,
      progressSummary ? `Jag har sparat passet åt dig. ${progressSummary}` : "Jag har sparat passet åt dig.",
      "Fråga: 'Hur kändes det i kroppen?'",
      "När användaren svarar, kalla `create_feedback` med `userId`, `workoutId` och `comment`. Efter att feedback sparats, säg en varm bekräftelse att feedbacken är sparad och att den kommer användas nästa gång, och kalla `finish_session_feedback` med en kort svensk sammanfattning.",
    ),

  FEEDBACK_THANKS:
    "Tack för din feedback. Vi sparade den lokalt men något gick fel med lagringen — vi försöker igen nästa gång. Vi hörs snart. Hej då!",

  FEEDBACK_SAVED:
    "Tack — jag har sparat din feedback. Det hjälper mig att anpassa nästa pass. Ta hand om dig, vi hörs snart igen. Hej då!",

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
          "Queue instruction audio only after the user clearly says they are ready for the instructions, for example 'ja', 'okej', 'kör igång', or 'det blir bra'. Use this during the first ready question, before instruction audio has played. Before calling this, say exactly: 'Vad bra! Nu kör vi igång.'",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "start_workout",
        description:
          "Queue workout audio only after instruction audio has finished and the user clearly says they are ready to start the workout, for example 'ja', 'kör igång', 'jag är redo', or 'starta'. Do not use this before instruction audio has played. Before calling this, say exactly: 'Vad bra! Nu kör vi igång.'",
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