import { useCallback, useEffect, useRef, useState } from "react";
import {
  Type,
  type FunctionCall,
  type FunctionResponse,
  type ToolListUnion,
} from "@google/genai";
import { useGeminiLive } from "../../hooks/useGeminiLive";
import { useLiveToken } from "../../hooks/useLiveToken";
import {
  executeLiveToolCall,
  liveSystemInstruction,
  liveTools,
} from "../ai-dev/live/tools";
import { fixedLiveUserId } from "../ai-dev/live/tools/shared/liveIntroDefaults";
import { getWorkoutEndpoint } from "../ai-dev/live/tools/workout/workoutEndpoint";
import type { BackendWorkoutResponse } from "../ai-dev/live/tools/workout/workoutTypes";
import {
  preloadSessionAudio,
  startSessionAudio,
  stopSessionAudio,
} from "./audio";
import type { CoachCallSession } from "./types";

export type CoachSessionStep =
  | "idle"
  | "choosing_workout"
  | "live_intro"
  | "waiting_instruction_approval"
  | "playing_instructions"
  | "asking_ready"
  | "playing_workout"
  | "collecting_feedback"
  | "completed"
  | "error";

type UseCoachSessionOptions = {
  session: CoachCallSession;
  autoStart?: boolean;
};

type PendingCoachAction = "start_instructions" | "start_workout" | null;
export type CoachSessionDebugEvent = {
  id: number;
  elapsedMs: number;
  label: string;
  detail?: string;
};

// Minimal fixed pauses are implemented with `sleep(ms)` helper below.
const READY_ACK_PHRASE = "vad bra! nu kör vi igång";

// Simple sleep helper used to add a short human-like pause before playback.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const sessionControlTools: ToolListUnion = [
  {
    functionDeclarations: [
      {
        name: "start_instructions",
        description:
          "Queue instruction audio only after the user clearly says they are ready for the instructions, for example 'ja', 'okej', 'kör igång', or 'det blir bra'. Use this during the first ready question, before instruction audio has played. Before calling this, say exactly: 'Vad bra! Nu kör vi igång.'",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "start_workout",
        description:
          "Queue workout audio only after instruction audio has finished and the user clearly says they are ready to start the workout, for example 'ja', 'kör igång', 'jag är redo', or 'starta'. Do not use this before instruction audio has played. Before calling this, say exactly: 'Vad bra! Nu kör vi igång.'",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
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

function buildSessionInstruction() {
  // Minimal system instruction for MVP sessions — keep voice-friendly behaviour.
  return liveSystemInstruction;
}

function readFeedbackSummary(functionCall: FunctionCall) {
  const args = functionCall.args ?? {};
  const summary = args.summary;
  return typeof summary === "string" ? summary : "";
}

function readWorkoutFromResponse(response: FunctionResponse) {
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

// formatWorkoutCatalogForCoach removed for MVP — selection is fixed to workout id 1.

function getQueuedActionForStep(step: CoachSessionStep): PendingCoachAction {
  if (step === "waiting_instruction_approval") {
    return "start_instructions";
  }

  if (step === "asking_ready") {
    return "start_workout";
  }

  return null;
}

function getModelText(message: unknown) {
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

function hasReadyAckPhrase(text: string) {
  return text
    .toLocaleLowerCase("sv-SE")
    .replace(/\s+/g, " ")
    .includes(READY_ACK_PHRASE);
}

export function useCoachSession(options: UseCoachSessionOptions) {
  const { autoStart = true } = options;
  const [step, setStep] = useState<CoachSessionStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioCapturing, setAudioCapturing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] =
    useState<BackendWorkoutResponse | null>(null);
  const [debugEvents, setDebugEvents] = useState<CoachSessionDebugEvent[]>([]);

  const debugIdRef = useRef(0);
  const startedAtRef = useRef(0);
  const stepRef = useRef<CoachSessionStep>("idle");
  const selectedWorkoutRef = useRef<BackendWorkoutResponse | null>(null);
  const hasStartedRef = useRef(false);

  // playback remaining helper removed for MVP
  const disconnectRef = useRef<() => void>(() => {});
  const startInstructionsRef = useRef<() => Promise<void>>(async () => {});
  const startWorkoutRef = useRef<() => Promise<void>>(async () => {});
  const finishSessionRef = useRef<(summary?: string) => void>(() => {});

  const { token, loadToken, tokenLoading, tokenError } = useLiveToken();

  const addDebugEvent = useCallback(
    (label: string, detail?: string | number | boolean | null) => {
      const event: CoachSessionDebugEvent = {
        id: debugIdRef.current + 1,
        elapsedMs: startedAtRef.current
          ? Math.round(performance.now() - startedAtRef.current)
          : 0,
        label,
        detail:
          detail === undefined || detail === null ? undefined : String(detail),
      };

      debugIdRef.current = event.id;
      console.debug("[CoachSession]", event);
      setDebugEvents((current) => [event, ...current].slice(0, 12));
    },
    [],
  );

  const setSessionStep = useCallback((nextStep: CoachSessionStep) => {
    stepRef.current = nextStep;
    setStep(nextStep);
    const event: CoachSessionDebugEvent = {
      id: debugIdRef.current + 1,
      elapsedMs: startedAtRef.current
        ? Math.round(performance.now() - startedAtRef.current)
        : 0,
      label: "step",
      detail: nextStep,
    };

    debugIdRef.current = event.id;
    console.debug("[CoachSession]", event);
    setDebugEvents((current) => [event, ...current].slice(0, 12));
  }, []);

  // No pending timers in MVP — keep function for compatibility but noop.
  const clearPendingCoachTimer = useCallback(() => {}, []);

  // Simplified flow: no queued actions or polling — actions start directly.

  const {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    stopAudioCapture,
    isActive,
    connectionError,
    currentTurn,
    getSession,
    // no longer using playback remaining helper in MVP
  } = useGeminiLive({
    token,
    tools: [...liveTools, ...sessionControlTools],
    systemInstruction: buildSessionInstruction(),
    onToolCall: async (functionCall): Promise<FunctionResponse> => {
      const name = functionCall.name ?? "unknown_tool";
      addDebugEvent("tool call", `${name}, step=${stepRef.current}`);

      if (name === "start_instructions") {
        const queuedAction = getQueuedActionForStep(stepRef.current);
        addDebugEvent("tool-start-instructions", String(queuedAction));
        // start immediately in MVP
        void startInstructionsRef.current();
        return {
          id: functionCall.id,
          name,
          response: {
            output: {
              queued: Boolean(queuedAction),
              action: queuedAction,
              step: stepRef.current,
            },
          },
        };
      }

      if (name === "start_workout") {
        const queuedAction = getQueuedActionForStep(stepRef.current);
        addDebugEvent("tool-start-workout", String(queuedAction));
        // start immediately in MVP
        void startWorkoutRef.current();
        return {
          id: functionCall.id,
          name,
          response: {
            output: {
              queued: Boolean(queuedAction),
              action: queuedAction,
              step: stepRef.current,
            },
          },
        };
      }

      if (name === "finish_session_feedback") {
        finishSessionRef.current(readFeedbackSummary(functionCall));
        return {
          id: functionCall.id,
          name,
          response: { output: { ok: true } },
        };
      }

      const response = await executeLiveToolCall(functionCall);
      const workout = readWorkoutFromResponse(response);

      if (workout) {
        addDebugEvent("selected workout", workout.name);
        selectedWorkoutRef.current = workout;
        setSelectedWorkout(workout);
        preloadSessionAudio(workout.instructionsAudio);
        preloadSessionAudio(workout.workoutAudio);
        setSessionStep("live_intro");
      }

      return response;
    },
    onMessage: (message) => {
      const modelText = getModelText(message);
      if (modelText && hasReadyAckPhrase(modelText)) {
        const action = getQueuedActionForStep(stepRef.current);
        if (action) {
          addDebugEvent("phrase-match", action);
          if (action === "start_instructions") {
            void startInstructionsRef.current();
          } else if (action === "start_workout") {
            void startWorkoutRef.current();
          }
          return;
        }
      }

      if (
        (stepRef.current === "choosing_workout" ||
          stepRef.current === "live_intro") &&
        message.serverContent?.turnComplete
      ) {
        if (selectedWorkoutRef.current) {
          setSessionStep("waiting_instruction_approval");
        } else {
          sendCoachPrompt(
            "Välj först en workout genom get_workout_catalog och get_workout_details. Säg sedan kort varför den passar.",
          );
        }
      }
    },
  });

  // playback remaining tracking removed for MVP

  useEffect(() => {
    disconnectRef.current = geminiDisconnect;
  }, [geminiDisconnect]);

  const pauseLive = useCallback(() => {
    addDebugEvent("pauseAI-called", stepRef.current);
    try {
      // Stop sending microphone audio but keep the Gemini session alive.
      // This prevents reconnects and keeps context intact.
      stopAudioCapture?.();
    } catch (e) {
      console.warn("pauseLive failed", e);
    }
    setAudioCapturing(false);
  }, [addDebugEvent, stopAudioCapture]);

  const disconnectLive = useCallback(() => {
    addDebugEvent("stopAI-called", stepRef.current);
    geminiDisconnect();
    setAudioCapturing(false);
  }, [addDebugEvent, geminiDisconnect]);

  const connectFreshLive = useCallback(async () => {
    addDebugEvent("load live token", stepRef.current);
    const freshToken = await loadToken();

    if (!freshToken) {
      addDebugEvent("live token failed");
      setError("Kunde inte starta coach-samtalet.");
      setSessionStep("error");
      return false;
    }

    addDebugEvent("connect live", stepRef.current);
    await geminiConnect(freshToken);
    return true;
  }, [addDebugEvent, geminiConnect, loadToken, setSessionStep]);

  const sendCoachPrompt = useCallback(
    (text: string) => {
      getSession()?.sendClientContent({
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      });
    },
    [getSession],
  );

  const askIfReadyForWorkout = useCallback(async () => {
    addDebugEvent("reconnect after instructions");
    setSessionStep("asking_ready");

    const connected = await connectFreshLive();
    if (!connected) {
      return;
    }

    await sleep(250);

    const started = await startAudioCapture();
    setAudioCapturing(started);
    addDebugEvent("mic after instructions", started);

    if (!started) {
      setError("Kunde inte starta mikrofonen.");
      setSessionStep("error");
      return;
    }

    addDebugEvent("ready-sent", "workout");
    sendCoachPrompt(
      [
        "Instruktionerna är klara.",
        "Fråga: 'Okej — är du nu redo att köra igång med träningen?'",
        "När användaren svarar 'ja', säg exakt 'Vad bra! Nu kör vi igång.' och kalla start_workout.",
      ].join(" "),
    );
  }, [
    addDebugEvent,
    connectFreshLive,
    sendCoachPrompt,
    setSessionStep,
    startAudioCapture,
  ]);

  const playInstructions = useCallback(async () => {
    if (stepRef.current !== "waiting_instruction_approval") {
      addDebugEvent("skip instructions", `step=${stepRef.current}`);
      return;
    }

    pauseLive();
    setSessionStep("playing_instructions");

    const workout = selectedWorkoutRef.current;
    const instructionsAudioUrl = workout?.instructionsAudio;

    if (!instructionsAudioUrl) {
      setError("Instruktionsljud saknas för vald workout.");
      setSessionStep("error");
      return;
    }

    try {
      // Small human-like pause before starting audio so it doesn't feel abrupt.
      addDebugEvent("pre-play-sleep", "instructions 1000ms");
      await sleep(1000);

      addDebugEvent("play instructions", instructionsAudioUrl);
      await startSessionAudio(instructionsAudioUrl, {
        onEnded: () => {
          addDebugEvent("instructions ended");
          void askIfReadyForWorkout();
        },
      });
      addDebugEvent("play-started", "instructions");
    } catch {
      addDebugEvent("instructions audio failed");
      setError("Kunde inte spela upp instruktionerna.");
      setSessionStep("error");
    }
  }, [addDebugEvent, askIfReadyForWorkout, pauseLive, setSessionStep]);

  const startSession = useCallback(async () => {
    if (hasStartedRef.current) return;

    startedAtRef.current = performance.now();
    debugIdRef.current = 0;
    setDebugEvents([]);
    addDebugEvent("session start");
    hasStartedRef.current = true;
    setError(null);
    setSessionStep("live_intro");

    const freshToken = await loadToken();
    if (!freshToken) {
      addDebugEvent("initial token failed");
      setError("Kunde inte starta coach-samtalet.");
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

    // MVP: always use workout id 1
    const workoutResp = await getWorkoutEndpoint(1).catch(() => null);
    if (!workoutResp || !workoutResp.ok) {
      addDebugEvent("workout fetch failed");
      setError("Kunde inte hämta workout.");
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

    const workout = workoutResp.data as BackendWorkoutResponse;
    selectedWorkoutRef.current = workout;
    setSelectedWorkout(workout);
    preloadSessionAudio(workout.instructionsAudio);
    preloadSessionAudio(workout.workoutAudio);

    await geminiConnect(freshToken);
    addDebugEvent("initial live connected");
    const started = await startAudioCapture();
    setAudioCapturing(started);
    addDebugEvent("initial mic", started);

    if (!started) {
      setError("Kunde inte starta mikrofonen.");
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

    await sleep(250);

    // Ask the user straightforwardly about the single MVP workout.
    setSessionStep("waiting_instruction_approval");
    sendCoachPrompt(
      [
        `Vi har ett kort träningspass: "${workout.name}". Vill du att jag spelar instruktionerna?`,
        "Fråga: 'Okej — är du nu redo att köra igång med träningen?'. När användaren svarar ja, säg exakt 'Vad bra! Nu kör vi igång.' och kalla start_instructions.",
      ].join(" "),
    );
  }, [
    addDebugEvent,
    geminiConnect,
    loadToken,
    sendCoachPrompt,
    setSessionStep,
    startAudioCapture,
  ]);

  const startWorkout = useCallback(async () => {
    if (stepRef.current !== "asking_ready") {
      addDebugEvent("skip workout", `step=${stepRef.current}`);
      return;
    }

    pauseLive();
    setSessionStep("playing_workout");

    const workout = selectedWorkoutRef.current;
    const workoutAudioUrl = workout?.workoutAudio;

    if (!workoutAudioUrl) {
      setError("Workout-ljud saknas.");
      setSessionStep("error");
      return;
    }

    try {
      // Small human-like pause before starting the workout audio.
      addDebugEvent("pre-play-sleep", "workout 1000ms");
      await sleep(1000);

      addDebugEvent("play workout", workoutAudioUrl);
      await startSessionAudio(workoutAudioUrl, {
        onEnded: async () => {
          addDebugEvent("workout ended");
          setSessionStep("collecting_feedback");

          // Persist activity and fetch updated progress before reconnecting
          try {
            const workoutId =
              (selectedWorkoutRef.current?.id as number | undefined) ?? null;

            const activityResult = await executeLiveToolCall({
              name: "create_activity_log",
              args: { userId: fixedLiveUserId, workoutId },
            });

            addDebugEvent(
              "create_activity_log",
              JSON.stringify(activityResult?.response ?? {}),
            );

            const activityRespObj = activityResult as FunctionResponse | null;
            const output = activityRespObj?.response?.output ?? {};

            let progress: Record<string, unknown> | null = null;
            if (output && typeof output === "object") {
              const outObj = output as Record<string, unknown>;
              if ("progress" in outObj && outObj.progress != null) {
                progress = outObj.progress as Record<string, unknown>;
              } else if (
                "progressEndpoint" in outObj &&
                typeof outObj.progressEndpoint === "object"
              ) {
                const pe = outObj.progressEndpoint as Record<string, unknown>;
                if (pe.data) progress = pe.data as Record<string, unknown>;
              }
            }

            let progressSummary = "";
            if (progress) {
              const streak =
                typeof progress.currentStreak === "number"
                  ? (progress.currentStreak as number)
                  : null;
              const completed = Array.isArray(progress.completedWorkouts)
                ? (progress.completedWorkouts as Array<Record<string, unknown>>)
                : [];
              if (streak)
                progressSummary += `Din nuvarande streak är ${streak} dag(ar). `;
              if (completed.length > 0) {
                const latest = completed[0];
                const name =
                  (latest as Record<string, unknown>).workoutName ??
                  (latest as Record<string, unknown>).workout ??
                  null;
                const label =
                  (latest as Record<string, unknown>).dateLabel ?? null;
                if (name && label)
                  progressSummary += `Senaste: ${name} (${label}). `;
              }
            }

            const connected = await connectFreshLive();
            if (!connected) {
              return;
            }

            await sleep(250);
            const started = await startAudioCapture();
            setAudioCapturing(started);
            addDebugEvent("mic after workout", started);

            if (!started) {
              setError("Kunde inte starta mikrofonen.");
              setSessionStep("error");
              return;
            }

            sendCoachPrompt(
              [
                `Workouten "${selectedWorkoutRef.current?.name ?? "workout"}" är klar.`,
                progressSummary
                  ? `Jag har sparat passet åt dig. ${progressSummary}`
                  : "Jag har sparat passet åt dig.",
                "Fråga: 'Hur kändes det i kroppen?'",
                "När användaren svarar, kalla `create_feedback` med `userId`, `workoutId` och `comment`. Efter att feedback sparats, säg en varm bekräftelse att feedbacken är sparad och att den kommer användas nästa gång, och kalla `finish_session_feedback` med en kort svensk sammanfattning.",
              ].join(" "),
            );
          } catch (e) {
            addDebugEvent("activity save failed", String(e));
            // Fallback: reconnect and ask for feedback anyway
            const connected = await connectFreshLive();
            if (!connected) return;
            await sleep(250);
            const started = await startAudioCapture();
            setAudioCapturing(started);
            addDebugEvent("mic after workout (fallback)", started);

            sendCoachPrompt(
              [
                `Workouten "${selectedWorkoutRef.current?.name ?? "workout"}" är klar.`,
                "Kunde inte spara passet just nu, men vi försöker igen senare.",
                "Fråga: 'Hur kändes det i kroppen?'",
                "När användaren svarar, kalla `create_feedback` med `userId`, `workoutId` och `comment`.",
              ].join(" "),
            );
          }
        },
      });
      addDebugEvent("play-started", "workout");
    } catch {
      addDebugEvent("workout audio failed");
      setError("Kunde inte spela upp workouten.");
      setSessionStep("error");
    }
  }, [
    addDebugEvent,
    sendCoachPrompt,
    pauseLive,
    connectFreshLive,
    setSessionStep,
    startAudioCapture,
  ]);

  const finishSession = useCallback(() => {
    finishSessionRef.current();
  }, []);

  const finishSessionWithSummary = useCallback(
    async (summary = "") => {
      clearPendingCoachTimer();
      stopSessionAudio();

      try {
        const workoutId = selectedWorkoutRef.current?.id ?? null;

        const feedbackResp = await executeLiveToolCall({
          name: "create_feedback",
          args: { userId: fixedLiveUserId, workoutId, comment: summary },
        });

        addDebugEvent(
          "create_feedback",
          JSON.stringify(feedbackResp?.response ?? {}),
        );

        const closing = `Tack — jag har sparat din feedback. Det hjälper mig att anpassa nästa pass. Ta hand om dig, vi hörs snart igen. Hej då!`;

        // Ask Gemini to speak a warm closing message so the UX feels complete.
        getSession()?.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [{ text: `Säg exakt: '${closing}'` }],
            },
          ],
          turnComplete: true,
        });

        // Wait a fixed short time to let Gemini finish speaking, then give a short tail.
        await sleep(1800);
      } catch (e) {
        addDebugEvent("create_feedback_failed", String(e));
        try {
          const fallbackMsg =
            "Tack för din feedback. Vi sparade den lokalt men något gick fel med lagringen — vi försöker igen nästa gång. Vi hörs snart. Hej då!";
          getSession()?.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: `Säg exakt: '${fallbackMsg}'`,
                  },
                ],
              },
            ],
            turnComplete: true,
          });

          await sleep(1400);
        } catch {
          // ignore
        }
      } finally {
        disconnectLive();
        setSessionStep("completed");
      }
    },
    [
      addDebugEvent,
      clearPendingCoachTimer,
      disconnectLive,
      getSession,
      setSessionStep,
    ],
  );

  useEffect(() => {
    startInstructionsRef.current = playInstructions;
    startWorkoutRef.current = startWorkout;
    finishSessionRef.current = finishSessionWithSummary;
  }, [finishSessionWithSummary, playInstructions, startWorkout]);

  const endSession = useCallback(() => {
    clearPendingCoachTimer();
    addDebugEvent("manual end");
    stopSessionAudio();
    disconnectLive();
    hasStartedRef.current = false;
    setSessionStep("idle");
  }, [addDebugEvent, clearPendingCoachTimer, disconnectLive, setSessionStep]);

  useEffect(() => {
    return () => {
      clearPendingCoachTimer();
      stopSessionAudio();
      disconnectRef.current();
    };
  }, [clearPendingCoachTimer]);

  useEffect(() => {
    if (!autoStart) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void startSession();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [autoStart, startSession]);

  return {
    step,
    error: error ?? tokenError ?? connectionError,
    isGeminiActive: isActive,
    currentTurn,
    audioCapturing,
    selectedWorkout,
    debugEvents,
    isLoadingToken: tokenLoading,
    startSession,
    startWorkout,
    finishSession,
    endSession,
  };
}
