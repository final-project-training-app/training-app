import { Type, type ToolListUnion } from "@google/genai";
import type { CoachCallSession } from "../session/types";

export const liveSystemInstruction = [
  "Inled telefonsamtalet som att du just lyft luren och ge en kort personlig hälsning. Gör endast detta och fråga inte om instruktioner än.",
  "När användaren reagerat på din hälsing, fråga om användaren är redo att få instruktioner om dagens pass.",
  "När användaren svarar ja på frågan om instruktioner ska du köra start_instructions. Du ska inte fortsätta prata under uppspelningen.",
  "När användaren svarar ja på frågan i mp3-filen start_instructions om att starta passet ska du köra start_workout. Du ska INTE prata alls efter start_workout — varken under eller efter uppspelningen. Vänta tyst på användarens nästa yttrande.",
  "Tränings-mp3:n avslutas med en fråga om hur passet kändes. Ställ INTE den frågan — vänta tyst på användarens svar.",
  "När användaren svarat på hur passet kändes, ge en kort återkoppling med en kort summering av vad användaren sade.",
  "Du får inte avsluta sessionen om inte användaren indikerat att de vill avsluta.",
  "När du upplever att användaren förväntar sig att du lägger på ska du kalla på `finish_session`.",
  "Kalla ALDRIG på `finish_session` medan du pratar.",
  "Undvik tekniska termer i talet.",
  "Om samtalet avslöjar att användarens intensitetsnivå (1–5) eller bakgrundsbeskrivning (Bakgrund-fältet) borde uppdateras, ange det i `suggested_intensity_level` respektive `suggested_context` när du kallar på `finish_session`. `suggested_context` ska ENDAST innehålla Bakgrund-texten — inte namn, streak eller passhistorik. Slå ihop befintlig bakgrund med nytt som framkommit; ibland ska saker läggas till, ibland ersättas. Utelämna parametern om inget behöver ändras.",
].join(" ");

export function buildUserContext(session: CoachCallSession): string {
  const parts: string[] = [];
  if (session.userName) {
    parts.push(`Användarens namn är ${session.userName}.`);
  }
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
  const workoutName = session.workoutName ?? session.name;
  if (workoutName) {
    parts.push(`Dagens pass heter "${workoutName}".`);
  }
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

export const ALREADY_COMPLETED_TODAY_INSTRUCTION =
  "Användaren har redan utfört dagens träningspass. Uppmuntra användaren att ringa upp imorgon för att få ett nytt träningspass.";

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
        name: "finish_session",
        description:
          "Finish the session after the user has indicated that they want to end it and the user expects you to hang up.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A short Swedish summary of the user's feedback.",
            },
            suggested_intensity_level: {
              type: Type.INTEGER,
              description:
                "Suggested new intensity level (1–5) if the conversation revealed the current level is wrong. Omit if unchanged.",
            },
            suggested_context: {
              type: Type.STRING,
              description:
                "The updated value of the 'Bakgrund' field only — the user's personal background and goals. Do NOT include the user's name, streak, or workout history; those are tracked separately. Merge existing background info with anything new learned in the conversation. Omit entirely if nothing changed.",
            },
          },
        },
      },
    ],
  },
];
