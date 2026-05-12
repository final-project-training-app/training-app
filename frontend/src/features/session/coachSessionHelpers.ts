import { type FunctionCall, type FunctionResponse } from "@google/genai";
import type { BackendWorkoutResponse } from "../ai-dev/live/tools/workout/workoutTypes";
import { READY_ACK_PHRASE } from "./coachPrompts";

export type CoachSessionStep =
  | "idle"
  | "live_intro"
  | "waiting_instruction_approval"
  | "playing_instructions"
  | "asking_ready"
  | "playing_workout"
  | "collecting_feedback"
  | "completed"
  | "error";

export type UseCoachSessionOptions = {
  session: unknown;
  autoStart?: boolean;
};

export type CoachSessionDebugEvent = {
  id: number;
  elapsedMs: number;
  label: string;
  detail?: string;
};

export type PendingCoachAction = "start_instructions" | "start_workout" | null;

//──────────────────────
// Simple sleep helper
//──────────────────────
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

//──────────────────────
// Read feedback summary from tool call
//──────────────────────
export function readFeedbackSummary(functionCall: FunctionCall): string {
  const args = functionCall.args ?? {};
  const summary = args.summary;
  return typeof summary === "string" ? summary : "";
}

//──────────────────────
// Read workout from tool response
//──────────────────────
export function readWorkoutFromResponse(
  response: FunctionResponse,
): BackendWorkoutResponse | null {
  if (response.name !== "get_workout_details") {
    return null;
  }

  const body = response.response;
  if (!body || typeof body !== "object" || !("output" in body)) {
    return null;
  }

  const output = (body as { output?: { workout?: unknown } }).output;
  const workout = output?.workout;

  return workout && typeof workout === "object"
    ? (workout as BackendWorkoutResponse)
    : null;
}

//──────────────────────
// Map session step to queued action
//──────────────────────
export function getQueuedActionForStep(
  step: CoachSessionStep,
): PendingCoachAction {
  if (step === "waiting_instruction_approval") {
    return "start_instructions";
  }

  if (step === "asking_ready") {
    return "start_workout";
  }

  return null;
}

//──────────────────────
// Extract model text from Gemini message
//──────────────────────
export function getModelText(message: unknown): string {
  const parts =
    (
      message as {
        serverContent?: { modelTurn?: { parts?: Array<{ text?: string }> } };
      }
    ).serverContent?.modelTurn?.parts ?? [];

  return parts
    .map((part) => part.text)
    .filter(Boolean)
    .join(" ");
}

//──────────────────────
// Check ready acknowledgement phrase
//──────────────────────
export function hasReadyAckPhrase(text: string): boolean {
  return text
    .toLocaleLowerCase("sv-SE")
    .replace(/\s+/g, " ")
    .includes(READY_ACK_PHRASE);
}