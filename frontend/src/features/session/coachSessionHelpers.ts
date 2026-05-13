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

export type GeminiServerMessage = {
  serverContent?: {
    turnComplete?: boolean;
    modelTurn?: {
      parts?: Array<{ text?: string }>;
    };
  };
};

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

//──────────────────────
// Wait until the AI's turnComplete flag is true.
// Returns true if the AI finished before timeout, false on timeout.
//──────────────────────
export type WaitForAIToFinishSpeakingOptions = {
  intervalMs?: number;
  timeoutMs?: number;
};

type TurnLike = {
  serverContent?: {
    turnComplete?: boolean;
  };
};

function isTurnLike(value: unknown): value is TurnLike {
  return typeof value === "object" && value !== null;
}

export function waitForAIToFinishSpeaking(
  currentTurn: unknown,
  options?: WaitForAIToFinishSpeakingOptions,
): Promise<boolean> {
  const { intervalMs = 100, timeoutMs = 10000 } = options ?? {};
  const start = performance.now();
  let timerId: number | undefined;

  return new Promise<boolean>((resolve) => {
    const cleanup = () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
        timerId = undefined;
      }
    };

    const check = () => {
      const turnComplete =
        isTurnLike(currentTurn) &&
        Boolean(currentTurn.serverContent?.turnComplete);

      if (turnComplete) {
        cleanup();
        resolve(true);
        return;
      }

      if (performance.now() - start > timeoutMs) {
        cleanup();
        resolve(false);
        return;
      }

      timerId = window.setTimeout(check, intervalMs);
    };

    check();
  });
}