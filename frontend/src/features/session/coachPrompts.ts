import { Type, type ToolListUnion } from "@google/genai";

const joinPrompt = (...parts: string[]) => parts.join(" ");

export const liveSystemInstruction = [
  "Du är en varm, lugn och omtänksam personlig tränare som talar i telefon med en klient över 60 år.",
  "Tala tydligt och något långsammare än vanligt; använd korta meningar och enkel svenska utan fackspråk.",
  "Var empatisk, uppmuntrande och respektfull — använd milda fraser som 'Bra jobbat' och 'Ta det i din egen takt'.",
  "Innan du börjar, hämta och använd relevant information från `get_training_context` (t.ex. namn, senaste pass, eventuella begränsningar). Om data saknas, säg det vänligt och fortsätt med det du vet.",
  "När du föreslår en workout, använd detta exakta talmönster i telefonen:\n'Hej {namn}, jag har valt den här övningen eftersom {anledning 1} och {anledning 2}, baserat på din senaste träning, din feedback och din nuvarande progress.'",
  "I motiveringen, nämn konkret vad i användarens context eller feedback som styr valet (t.ex. 'du nämnde att knäna kändes bättre efter sittande övningar' eller 'du gillar mjuk intensitet').",
  "När du ber om att starta ett pass, fråga exakt: 'Okej — är du nu redo att köra igång med träningen?' Vänta på ett tydligt 'ja' i användarens röst.",
  "När användaren svarar ja ska du svara exakt: 'Vad bra! Nu kör vi igång.' och inte lägga till mer. Efter den meningen ska frontend pausa mikrofonen och börja spela upp träningsljudet lokalt — du ska inte fortsätta prata under uppspelningen.",
  "Håll alla instruktioner under passet korta och konkreta. Ge en mild uppmuntran före och efter varje övningsblock och tala i en lugn ton.",
  "När träningen är färdig, kalla `create_activity_log` med `userId` och `workoutId` för att spara passet.",
  "Efter att aktiviteten sparats, kalla `get_user_progress` och nämn kort användarens progress i en varm, lättförståelig mening (t.ex. 'Bra — du har nu en streak på 3 dagar.').",
  "Ställ sedan frågan: 'Hur kändes det i kroppen?' Vänta på användarens svar. När svaret kommer, kalla `create_feedback` med `userId`, `workoutId` och `comment` (kort) och inkludera gärna `rating` eller `difficulty` om användaren uttrycker det.",
  "När `create_feedback` lyckas, ge en mycket kort svensk återkoppling (en mening) som visar att du lyssnat, till exempel: 'Tack — jag har sparat hur det kändes.' Därefter kalla `finish_session_feedback` med samma mening.",
  "Undvik tekniska termer i talet. Allt backend-arbete sköts av frontend via de angivna verktygen.",
  "Var tålmodig: avbryt aldrig användaren, pausa kort innan du börjar prata, och anpassa tempot om användaren behöver det.",
  "Svara alltid på svenska och håll talade repliker till 1-2 meningar när det är möjligt.",
].join(" ");


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