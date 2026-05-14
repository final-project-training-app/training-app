import { type FunctionCall, type FunctionResponse } from "@google/genai";
import type { BackendWorkoutResponse } from "../ai-dev/live/tools/workout/workoutTypes";

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

import type { CoachCallSession } from "./types";

export type UseCoachSessionOptions = {
  session: CoachCallSession;
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
    generationComplete?: boolean;
    waitingForInput?: boolean;
    interrupted?: boolean;
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
// Wait until the AI's turnComplete flag is true.
// Returns true if the AI finished before timeout, false on timeout.
//──────────────────────

export type AITurnState = {
  started: boolean;
  complete: boolean;
  waitingForInput?: boolean;
  interrupted?: boolean;
};

export type WaitForAIToFinishSpeakingOptions = {
  intervalMs?: number;
  timeoutMs?: number;
};

export async function waitForAIToFinishSpeaking(
  getTurnState: () => AITurnState,
  getRemainingPlaybackMs: () => number,
  options: WaitForAIToFinishSpeakingOptions = {},
): Promise<boolean> {
  const { intervalMs = 50, timeoutMs = 15000 } = options;

  const startedAt = performance.now();

  while (performance.now() - startedAt < timeoutMs) {
    const state = getTurnState();
    const remainingAudio = getRemainingPlaybackMs();

    /**
     * TERMINAL CONDITIONS:
     * 1. If it never started, it's effectively "finished".
     * 2. If started:
     * - The stream is terminal (complete, interrupted, or waiting)
     * - AND the physical audio buffer has finished playing (remaining <= 0)
     */

    const isStreamTerminal =
      !state.started ||
      state.complete ||
      state.waitingForInput ||
      state.interrupted;

    const isAudioSilent = remainingAudio <= 0;
    console.log("remainingAudio:", remainingAudio);
    if (isStreamTerminal && isAudioSilent) {
      return true;
    }

    // Wait for the next poll
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }

  // If we hit the timeout, we return false so the caller can decide to proceed anyway
  console.warn("[GeminiLive] waitForAIToFinishSpeaking timed out.");
  return false;
}
