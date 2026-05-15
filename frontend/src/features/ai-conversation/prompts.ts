import { Type, type ToolListUnion } from "@google/genai";
import type { CoachCallSession } from "../session/types";

export const liveSystemInstruction = [
  "Inled samtalet med en kort personlig hälsning och kolla om användaren är redo att höra om dagens pass.",
  "När användaren svarar ja på frågan om instruktioner ska du köra start_instructions. Du ska inte fortsätta prata under uppspelningen.",
  "När användaren svarar ja på frågan i mp3-filen start_instructions om att starta passet ska du köra start_workout. Du ska INTE prata alls efter start_workout — varken under eller efter uppspelningen. Vänta tyst på användarens nästa yttrande.",
  "Tränings-mp3:n avslutas med en fråga om hur passet kändes. Ställ INTE den frågan — vänta tyst på användarens svar.",
  "När användaren svarat på hur passet kändes, ge en kort återkoppling och kalla `finish_session_feedback` med en kort summering av vad användaren sade.",
  "Undvik tekniska termer i talet.",
].join(" ");

export function buildUserContext(session: CoachCallSession): string {
  const parts: string[] = [];
  parts.push(`Användarens namn är ${session.userName}.`);
  if (session.currentStreak && session.currentStreak > 0) {
    parts.push(`Nuvarande streak: ${session.currentStreak} dag(ar) i rad.`);
  }
  const last = session.completedWorkouts?.[0];
  if (last) {
    parts.push(`Senaste pass: ${last.workoutName} (${last.dateLabel}).`);
  }
  if (session.context?.trim()) {
    parts.push(`Bakgrund: ${session.context.trim()}`);
  }
  parts.push(`Dagens pass heter "${session.workoutName ?? session.name}".`);
  return parts.join(" ");
}

export const COACH_PROMPTS = {
  INSTRUCTIONS_DONE:
    "Instruktionerna har precis spelats klart. Invänta användarens svar på om de är redo att starta passet.",

  WORKOUT_DONE: (workoutName: string, progressSummary = "") =>
    `Passet "${workoutName}" är klart och sparat.${progressSummary ? ` ${progressSummary}` : ""} Invänta användarens svar på hur det kändes.`,

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
