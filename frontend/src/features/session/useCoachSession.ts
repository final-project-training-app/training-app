import { type FunctionResponse } from "@google/genai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGeminiLive } from "../../hooks/useGeminiLive";
import { useLiveToken } from "../../hooks/useLiveToken";
import { executeLiveToolCall, liveTools } from "../ai-dev/live/tools";
import { fixedLiveUserId } from "../ai-dev/live/tools/shared/liveIntroDefaults";
import { getWorkoutEndpoint } from "../ai-dev/live/tools/workout/workoutEndpoint";
import type { BackendWorkoutResponse } from "../ai-dev/live/tools/workout/workoutTypes";
import {
  preloadSessionAudio,
  startSessionAudio,
  stopSessionAudio,
} from "./audio";
import {
  COACH_PROMPTS,
  liveSystemInstruction,
  SESSION_CONTROL_TOOLS,
} from "./coachPrompts";
import {
  getModelText,
  getQueuedActionForStep,
  hasReadyAckPhrase,
  readFeedbackSummary,
  readWorkoutFromResponse,
  sleep,
  waitForAIToFinishSpeaking,
  type AITurnState,
  type CoachSessionDebugEvent,
  type CoachSessionStep,
  type UseCoachSessionOptions,
} from "./coachSessionHelpers";
import { useTrainer } from "./query";

//──────────────────────
// Build system instruction
//──────────────────────
function buildSessionInstruction(trainerPrompt?: string | null) {
  if (!trainerPrompt?.trim()) {
    return liveSystemInstruction;
  }

  return `${liveSystemInstruction}\n\nTrainer prompt:\n${trainerPrompt.trim()}`;
}

export function useCoachSession(
  options: UseCoachSessionOptions & {
    trainerId?: string;
    session: unknown;
    autoplay?: boolean;
  },
) {
  const {
    data: trainer,
    isLoading: isTrainerLoading,
    error: trainerError,
  } = useTrainer(options.trainerId ?? "1");
  const sessionInstruction = buildSessionInstruction(trainer?.prompt);

  useEffect(() => {
    console.log("Trainer prompt:", trainer?.prompt);
  }, [trainer?.prompt]);

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

  const aiTurnStateRef = useRef<AITurnState>({
    started: false,
    complete: false,
  });

  //──────────────────────
  // Stable callback refs
  //──────────────────────
  const disconnectRef = useRef<() => void>(() => {});
  const startInstructionsRef = useRef<() => Promise<void>>(async () => {});
  const startWorkoutRef = useRef<() => Promise<void>>(async () => {});
  const finishSessionRef = useRef<(summary?: string) => void>(() => {});

  const { token, loadToken, tokenLoading, tokenError } = useLiveToken();

  //──────────────────────
  // Add debug event
  //──────────────────────
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

  //──────────────────────
  // Update session step
  //──────────────────────
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

  //──────────────────────
  // Clear pending timer
  //──────────────────────
  const clearPendingCoachTimer = useCallback(() => {}, []);

  const {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    stopAudioCapture,
    isActive,
    connectionError,
    currentTurn,
    getSession,
    getAiPlaybackRemainingMs,
  } = useGeminiLive({
    token,
    tools: [...liveTools, ...SESSION_CONTROL_TOOLS],
    systemInstruction: sessionInstruction,

    //──────────────────────
    // Step 1: Handle Gemini tool calls
    //──────────────────────
    onToolCall: async (functionCall): Promise<FunctionResponse> => {
      const name = functionCall.name ?? "unknown_tool";
      addDebugEvent("tool call", `${name}, step=${stepRef.current}`);

      //──────────────────────
      // Step 1a: Start instructions
      //──────────────────────
      if (name === "start_instructions") {
        const queuedAction = getQueuedActionForStep(stepRef.current);
        addDebugEvent("waiting for AI to finish before starting instructions");
        await sleep(1000);
        const finished = await waitForAIToFinishSpeaking(
          () => aiTurnStateRef.current,
          () => getAiPlaybackRemainingMs(),
          { timeoutMs: 5000 },
        );

        if (!finished) {
          addDebugEvent("wait-for-ai-timeout", "Proceeding anyway...");
        }
        addDebugEvent("tool-start-instructions", String(queuedAction));

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

      //──────────────────────
      // Step 1b: Start workout
      //──────────────────────
      if (name === "start_workout") {
        const queuedAction = getQueuedActionForStep(stepRef.current);
        addDebugEvent("tool-start-workout", String(queuedAction));
        addDebugEvent("waiting for AI to finish before starting instructions");
        await sleep(1000);
        const finished = await waitForAIToFinishSpeaking(
          () => aiTurnStateRef.current,
          () => getAiPlaybackRemainingMs(),
          { timeoutMs: 5000 },
        );

        if (!finished) {
          addDebugEvent("wait-for-ai-timeout", "Proceeding anyway...");
        }
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

      //──────────────────────
      // Step 1c: Finish session feedback
      //──────────────────────
      if (name === "finish_session_feedback") {
        await sleep(1000);
        const finished = await waitForAIToFinishSpeaking(
          () => aiTurnStateRef.current,
          () => getAiPlaybackRemainingMs(),
          { timeoutMs: 5000 },
        );
        if (!finished) {
          addDebugEvent("wait-for-ai-timeout", "Proceeding anyway...");
        }
        finishSessionRef.current(readFeedbackSummary(functionCall));
        return {
          id: functionCall.id,
          name,
          response: { output: { ok: true } },
        };
      }

      //──────────────────────
      // Step 1d: Forward all other tool calls
      //──────────────────────
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

    //──────────────────────
    // Step 2: Handle Gemini messages
    //──────────────────────
    onMessage: (message) => {
      const modelText = getModelText(message);

      if (modelText.trim().length > 0) {
        aiTurnStateRef.current.started = true;
      }

      const generationFinished =
        Boolean(message.serverContent?.turnComplete) ||
        Boolean(message.serverContent?.generationComplete) ||
        (messageHasEventType(message) &&
          (message.event_type === "content.stop" ||
            message.event_type === "interaction.complete"));

      if (generationFinished) {
        aiTurnStateRef.current.complete = true;
      }

      //──────────────────────
      // Step 2a: Detect ready acknowledgement phrase
      //──────────────────────
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

      //──────────────────────
      // Step 2b: Advance after intro turn completes
      //──────────────────────
      if (
        // stepRef.current === "choosing_workout" ||
        stepRef.current === "live_intro" &&
        // stepRef.current === "choosing_workout" ||
        stepRef.current === "live_intro" &&
        message.serverContent?.turnComplete
      ) {
        setSessionStep("waiting_instruction_approval");
      }
    },
  });

  //──────────────────────
  // Sync disconnect ref
  //──────────────────────
  useEffect(() => {
    disconnectRef.current = geminiDisconnect;
  }, [geminiDisconnect]);

  //──────────────────────
  // Pause live audio capture
  //──────────────────────
  const pauseLive = useCallback(() => {
    console.log("Pausing during ", currentTurn + "'s turn");
    addDebugEvent("pauseAI-called", stepRef.current);
    try {
      stopAudioCapture?.();
    } catch (e) {
      console.warn("pauseLive failed", e);
    }
    setAudioCapturing(false);
  }, [addDebugEvent, stopAudioCapture]);

  //──────────────────────
  // Disconnect live session
  //──────────────────────
  const disconnectLive = useCallback(() => {
    addDebugEvent("stopAI-called", stepRef.current);
    geminiDisconnect();
    setAudioCapturing(false);
  }, [addDebugEvent, geminiDisconnect]);

  //──────────────────────
  // Connect with fresh token
  //──────────────────────
  const connectFreshLive = useCallback(async () => {
    addDebugEvent("load live token", stepRef.current);
    const freshToken = await loadToken();

    if (!freshToken) {
      setError(COACH_PROMPTS.NO_TOKEN_ERROR);
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

    addDebugEvent("connect live", stepRef.current);
    await geminiConnect(freshToken);
    return true;
  }, [addDebugEvent, geminiConnect, loadToken, setSessionStep]);

  //──────────────────────
  // Send prompt to Gemini
  //──────────────────────
  const sendCoachPrompt = useCallback(
    (text: string) => {
      aiTurnStateRef.current = { started: false, complete: false };

      getSession()?.sendClientContent({
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      });
    },
    [getSession],
  );

  //──────────────────────
  // Ask if ready for workout
  //──────────────────────
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
    sendCoachPrompt(COACH_PROMPTS.INSTRUCTIONS_DONE);
  }, [
    addDebugEvent,
    connectFreshLive,
    sendCoachPrompt,
    setSessionStep,
    startAudioCapture,
  ]);

  //──────────────────────
  // Play instructions
  //──────────────────────
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
      addDebugEvent("pre-play-sleep", "instructions 1000ms");

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

  //──────────────────────
  // Start session
  //──────────────────────
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
      setError(COACH_PROMPTS.NO_TOKEN_ERROR);
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

    const workoutResp = await getWorkoutEndpoint(17).catch(() => null);
    if (!workoutResp || !workoutResp.ok) {
      setError(COACH_PROMPTS.NO_WORKOUT_ERROR);
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

    setSessionStep("waiting_instruction_approval");
  }, [
    addDebugEvent,
    geminiConnect,
    loadToken,
    setSessionStep,
    startAudioCapture,
  ]);

  //──────────────────────
  // Start workout
  //──────────────────────
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
      setError(COACH_PROMPTS.NO_WORKOUT_AUDIO);
      setSessionStep("error");
      return;
    }

    try {
      addDebugEvent("pre-play-sleep", "workout 1000ms");

      addDebugEvent("play workout", workoutAudioUrl);
      await startSessionAudio(workoutAudioUrl, {
        onEnded: async () => {
          addDebugEvent("workout ended");
          setSessionStep("collecting_feedback");

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
              COACH_PROMPTS.WORKOUT_DONE(
                selectedWorkoutRef.current?.name ?? "workout",
                progressSummary,
              ),
            );
          } catch (e) {
            addDebugEvent("activity save failed", String(e));
            const connected = await connectFreshLive();
            if (!connected) return;
            await sleep(250);
            const started = await startAudioCapture();
            setAudioCapturing(started);
            addDebugEvent("mic after workout (fallback)", started);

            sendCoachPrompt(
              COACH_PROMPTS.WORKOUT_DONE(
                selectedWorkoutRef.current?.name ?? "workout",
                "Kunde inte spara passet just nu, men vi försöker igen senare.",
              ),
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
    pauseLive,
    setSessionStep,
    addDebugEvent,
    connectFreshLive,
    startAudioCapture,
    sendCoachPrompt,
  ]);

  //──────────────────────
  // Finalize session
  //──────────────────────
  const finishSession = useCallback(() => {
    finishSessionRef.current();
  }, []);

  //──────────────────────
  // Finish session with summary
  //──────────────────────
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

        getSession()?.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: "Nu är passet och feedbacken sparad. Avsluta samtalet på ett varmt och naturligt sätt. Byt ett par sista ord med användaren och säg hej då.",
                },
              ],
            },
          ],
          turnComplete: true,
        });
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

  //──────────────────────
  // Sync latest callbacks into refs
  //──────────────────────
  useEffect(() => {
    startInstructionsRef.current = playInstructions;
    startWorkoutRef.current = startWorkout;
    finishSessionRef.current = finishSessionWithSummary;
  }, [finishSessionWithSummary, playInstructions, startWorkout]);

  //──────────────────────
  // Manual end session
  //──────────────────────
  const endSession = useCallback(() => {
    clearPendingCoachTimer();
    addDebugEvent("manual end");
    stopSessionAudio();
    disconnectLive();
    hasStartedRef.current = false;
    setSessionStep("idle");
  }, [addDebugEvent, clearPendingCoachTimer, disconnectLive, setSessionStep]);

  //──────────────────────
  // Cleanup on unmount
  //──────────────────────
  useEffect(() => {
    return () => {
      clearPendingCoachTimer();
      stopSessionAudio();
      disconnectRef.current();
    };
  }, [clearPendingCoachTimer]);

  useEffect(() => {
    console.log("Current turn:", currentTurn, "coach step:", stepRef.current);
  }, [currentTurn]);

  //──────────────────────
  // Auto-start on mount
  //──────────────────────
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
    trainer,
    isTrainerLoading,
    trainerError,
  };
}

/**
 * Type guard for messages that may include an `event_type` property.
 */
function messageHasEventType(msg: unknown): msg is { event_type?: string } {
  return typeof msg === "object" && msg !== null && "event_type" in msg;
}
