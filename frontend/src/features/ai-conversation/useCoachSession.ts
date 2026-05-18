import { type FunctionResponse } from "@google/genai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGeminiLive } from "./core/useGeminiLive";
import { useLiveToken } from "./core/useLiveToken";
import { coachLiveTools, executeLiveToolCall } from "./tools";
import {
  stopRingback,
  startGymAmbience,
  setCallAudioMuted,
  stopGymAmbience,
} from "./audio/ringback";
import { fixedLiveUserId } from "./tools/shared/liveIntroDefaults";
import {
  preloadSessionAudio,
  setSessionAudioMuted,
  startSessionAudio,
  stopSessionAudio,
} from "./audio/sessionAudio";
import {
  COACH_PROMPTS,
  buildUserContext,
  liveSystemInstruction,
  SESSION_CONTROL_TOOLS,
} from "./prompts";
import type { CoachCallSession } from "../session/types";
import {
  getModelText,
  getQueuedActionForStep,
  readFeedbackSummary,
  sleep,
  waitForAIToFinishSpeaking,
  type AITurnState,
  type CoachSessionDebugEvent,
  type CoachSessionStep,
  type UseCoachSessionOptions,
} from "./helpers";
import { useTrainer } from "../session/query";
import useCurrentUser from "../../hooks/useCurrentUser";

//──────────────────────
// Build system instruction
//──────────────────────
function buildSessionInstruction(
  session: CoachCallSession,
  trainerPrompt?: string | null,
) {
  const userContext = buildUserContext(session);
  const base = `${userContext} ${liveSystemInstruction}`;
  if (!trainerPrompt?.trim()) return base;
  return `Trainer prompt:\n${trainerPrompt.trim()}\n\n${base}`;
}

export function useCoachSession(
  options: UseCoachSessionOptions & {
    trainerId?: string;
    session: CoachCallSession;
  },
) {
  const { session, autoStart = true } = options;

  const { userId, voice, coachPrompt } = useCurrentUser();
  const {
    data: trainer,
    isLoading: isTrainerLoading,
    error: trainerError,
  } = useTrainer(options.trainerId ?? "1");

  const sessionInstruction = useMemo(
    () => buildSessionInstruction(session, coachPrompt),
    [session, coachPrompt],
  );

  useEffect(() => {
    console.log("Coach prompt:", coachPrompt);
  }, [coachPrompt]);

  const [step, setStep] = useState<CoachSessionStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioCapturing, setAudioCapturing] = useState(false);
  const [debugEvents, setDebugEvents] = useState<CoachSessionDebugEvent[]>([]);
  const [showInstructionsVideo, setShowInstructionsVideo] = useState(false);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const debugIdRef = useRef(0);
  const startedAtRef = useRef(0);
  const stepRef = useRef<CoachSessionStep>("idle");
  const hasStartedRef = useRef(false);
  const videoTimersRef = useRef<number[]>([]);

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

  const {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    haltCapture,
    suppressAiOutput,
    allowAiOutput,
    isActive,
    connectionError,
    currentTurn,
    getSession,
    getAiPlaybackRemainingMs,
    getCurrentRms,
    setMicrophoneEnabled,
    setSpeakerMuted,
  } = useGeminiLive({
    token,
    tools: [...coachLiveTools, ...SESSION_CONTROL_TOOLS],
    systemInstruction: sessionInstruction,
    voice: voice,

    //──────────────────────
    // Handle Gemini tool calls
    //──────────────────────
    onToolCall: async (functionCall): Promise<FunctionResponse> => {
      const name = functionCall.name ?? "unknown_tool";
      addDebugEvent("tool call", `${name}, step=${stepRef.current}`);

      //──────────────────────
      // Start instructions
      //──────────────────────
      if (name === "start_instructions") {
        const queuedAction = getQueuedActionForStep(stepRef.current);
        addDebugEvent("waiting for AI to finish before starting instructions");
        await sleep(100);
        const finished = await waitForAIToFinishSpeaking(
          () => aiTurnStateRef.current,
          () => getAiPlaybackRemainingMs(),
          { timeoutMs: 5000 },
        );

        if (!finished) {
          addDebugEvent("wait-for-ai-timeout", "Proceeding anyway...");
        }
        addDebugEvent("tool-start-instructions", String(queuedAction));

        suppressAiOutput();
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
      // Start workout
      //──────────────────────
      if (name === "start_workout") {
        const queuedAction = getQueuedActionForStep(stepRef.current);
        addDebugEvent("tool-start-workout", String(queuedAction));
        addDebugEvent("waiting for AI to finish before starting workout");
        await sleep(100);
        const finished = await waitForAIToFinishSpeaking(
          () => aiTurnStateRef.current,
          () => getAiPlaybackRemainingMs(),
          { timeoutMs: 5000 },
        );

        if (!finished) {
          addDebugEvent("wait-for-ai-timeout", "Proceeding anyway...");
        }
        suppressAiOutput();
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
      // Finish session feedback
      //──────────────────────
      if (name === "finish_session") {
        await sleep(100);
        const finished = await waitForAIToFinishSpeaking(
          () => aiTurnStateRef.current,
          () => getAiPlaybackRemainingMs(),
          { timeoutMs: 10000 },
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
      // Forward all other tool calls
      //──────────────────────
      return executeLiveToolCall(functionCall);
    },

    //──────────────────────
    // Handle Gemini messages
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
    // Halt sending audio data to Gemini without closing the AudioContext or
    // stopping media tracks — avoids OS audio session reconfiguration that
    // would cause a brief dropout in the gym ambience.
    haltCapture();
    setAudioCapturing(false);
  }, [addDebugEvent, currentTurn, haltCapture]);

  //──────────────────────
  // Disconnect live session
  //──────────────────────
  const disconnectLive = useCallback(() => {
    addDebugEvent("stopAI-called", stepRef.current);
    stopGymAmbience();
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
    allowAiOutput();
    addDebugEvent("resume after instructions");
    setSessionStep("asking_ready");

    if (!getSession()) {
      addDebugEvent("session timed out — reconnecting");
      const connected = await connectFreshLive();
      if (!connected) return;
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
  }, [
    addDebugEvent,
    allowAiOutput,
    connectFreshLive,
    getSession,
    setSessionStep,
    startAudioCapture,
  ]);

  //──────────────────────
  // Play instructions
  //──────────────────────
  const clearVideoTimers = useCallback(() => {
    videoTimersRef.current.forEach((id) => window.clearTimeout(id));
    videoTimersRef.current = [];
  }, []);

  const playInstructions = useCallback(async () => {
    if (stepRef.current !== "waiting_instruction_approval") {
      addDebugEvent("skip instructions", `step=${stepRef.current}`);
      return;
    }

    clearVideoTimers();
    setShowInstructionsVideo(false);
    pauseLive();
    setSessionStep("playing_instructions");

    const instructionsAudioUrl =
      session.instructionsAudio ?? session.instructionsAudioUrl;

    if (!instructionsAudioUrl) {
      setError(COACH_PROMPTS.NO_INSTRUCTIONS_AUDIO);
      setSessionStep("error");
      return;
    }
    try {
      addDebugEvent("play instructions", instructionsAudioUrl);
      await startSessionAudio(instructionsAudioUrl, {
        onEnded: () => {
          addDebugEvent("instructions ended");
          void askIfReadyForWorkout();
        },
      });

      const videoUrl = session.instructionsVideo;
      const videoStart = session.instructionsVideoStart;
      const videoStop = session.instructionsVideoStop;

      addDebugEvent("video-fields", `url=${String(videoUrl)} start=${String(videoStart)} stop=${String(videoStop)}`);

      if (videoUrl && videoStart != null && videoStop != null) {
        const t1 = window.setTimeout(() => {
          addDebugEvent("instructions video show");
          setShowInstructionsVideo(true);
        }, videoStart * 1000);
        const t2 = window.setTimeout(() => {
          addDebugEvent("instructions video hide");
          setShowInstructionsVideo(false);
        }, videoStop * 1000);
        videoTimersRef.current = [t1, t2];
      }

      addDebugEvent("play-started", "instructions");
    } catch {
      addDebugEvent("instructions audio failed");
      setError("Kunde inte spela upp instruktionerna.");
      setSessionStep("error");
    }
  }, [
    addDebugEvent,
    askIfReadyForWorkout,
    clearVideoTimers,
    pauseLive,
    session.instructionsAudio,
    session.instructionsAudioUrl,
    session.instructionsVideo,
    session.instructionsVideoStart,
    session.instructionsVideoStop,
    setSessionStep,
  ]);

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

    preloadSessionAudio(
      session.instructionsAudio ?? session.instructionsAudioUrl,
    );
    preloadSessionAudio(session.workoutAudio ?? session.workoutAudioUrl);

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

    stopRingback();
    startGymAmbience();
    setSessionStep("waiting_instruction_approval");
    sendCoachPrompt("Starta samtalet.");
  }, [
    addDebugEvent,
    geminiConnect,
    loadToken,
    sendCoachPrompt,
    session.instructionsAudio,
    session.instructionsAudioUrl,
    session.workoutAudio,
    session.workoutAudioUrl,
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

    const workoutAudioUrl = session.workoutAudio ?? session.workoutAudioUrl;

    if (!workoutAudioUrl) {
      setError(COACH_PROMPTS.NO_WORKOUT_AUDIO);
      setSessionStep("error");
      return;
    }

    try {
      addDebugEvent("play workout", workoutAudioUrl);
      await startSessionAudio(workoutAudioUrl, {
        onEnded: async () => {
          allowAiOutput();
          addDebugEvent("workout ended");
          setSessionStep("collecting_feedback");

          try {
            const workoutId =
              typeof session.id === "number" ? session.id : null;

            const activityResult = await executeLiveToolCall({
              name: "create_activity_log",
              args: { userId: userId, workoutId },
            });

            addDebugEvent(
              "create_activity_log",
              JSON.stringify(activityResult?.response ?? {}),
            );

            if (!getSession()) {
              addDebugEvent("session timed out — reconnecting");
              const connected = await connectFreshLive();
              if (!connected) return;
            }

            const started = await startAudioCapture();
            setAudioCapturing(started);
            addDebugEvent("mic after workout", started);

            if (!started) {
              setError("Kunde inte starta mikrofonen.");
              setSessionStep("error");
              return;
            }
          } catch (e) {
            addDebugEvent("activity save failed", String(e));
            const connected = await connectFreshLive();
            if (!connected) return;
            const started = await startAudioCapture();
            setAudioCapturing(started);
            addDebugEvent("mic after workout (fallback)", started);
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
    session.workoutAudio,
    session.workoutAudioUrl,
    session.id,
    addDebugEvent,
    allowAiOutput,
    userId,
    getSession,
    startAudioCapture,
    connectFreshLive,
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
      stopSessionAudio();

      try {
        const workoutId = typeof session.id === "number" ? session.id : null;

        const feedbackResp = await executeLiveToolCall({
          name: "create_feedback",
          args: { userId: fixedLiveUserId, workoutId, comment: summary },
        });

        addDebugEvent(
          "create_feedback",
          JSON.stringify(feedbackResp?.response ?? {}),
        );

        aiTurnStateRef.current = { started: false, complete: false };
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

        await waitForAIToFinishSpeaking(
          () => aiTurnStateRef.current,
          () => getAiPlaybackRemainingMs(),
          { timeoutMs: 8000 },
        );
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

          await sleep(500);
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
      disconnectLive,
      getAiPlaybackRemainingMs,
      getSession,
      session.id,
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
  const endSession = useCallback(async () => {
    stopRingback();
    addDebugEvent("manual end");
    clearVideoTimers();
    setShowInstructionsVideo(false);
    stopSessionAudio();
    await waitForAIToFinishSpeaking(
      () => aiTurnStateRef.current,
      () => getAiPlaybackRemainingMs(),
      { timeoutMs: 10000 },
    );
    disconnectLive();
    hasStartedRef.current = false;
    setSessionStep("idle");
  }, [addDebugEvent, clearVideoTimers, disconnectLive, getAiPlaybackRemainingMs, setSessionStep]);

  const hangUp = useCallback(() => {
    stopRingback();
    addDebugEvent("hang up");
    clearVideoTimers();
    setShowInstructionsVideo(false);
    stopSessionAudio();
    disconnectLive();
    setSessionStep("idle");
  }, [addDebugEvent, clearVideoTimers, disconnectLive, setSessionStep]);

  //──────────────────────
  // Cleanup on unmount
  //──────────────────────
  useEffect(() => {
    return () => {
      stopSessionAudio();
      disconnectRef.current();
      videoTimersRef.current.forEach((id) => window.clearTimeout(id));
      videoTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    console.log("Current turn:", currentTurn, "coach step:", stepRef.current);
  }, [currentTurn]);

  useEffect(() => {
    setMicrophoneEnabled(!isMicrophoneMuted);
  }, [isMicrophoneMuted, setMicrophoneEnabled]);

  useEffect(() => {
    setSpeakerMuted(isSpeakerMuted);
    setSessionAudioMuted(isSpeakerMuted);
    setCallAudioMuted(isSpeakerMuted);
  }, [isSpeakerMuted, setSpeakerMuted]);

  // must be declared before usage in the auto-start effect
  const canStartLive = Boolean(voice && trainer?.prompt && !isTrainerLoading);

  //──────────────────────
  // Auto-start on mount
  //──────────────────────
  useEffect(() => {
    if (!autoStart) {
      return;
    }
    if (!canStartLive) {
      return; // wait until voice + trainer data is ready
    }

    const timeout = window.setTimeout(() => {
      void startSession();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [autoStart, canStartLive, startSession]);

  return {
    step,
    error: error ?? tokenError ?? connectionError,
    isGeminiActive: isActive,
    currentTurn,
    audioCapturing,
    debugEvents,
    isLoadingToken: tokenLoading,
    startSession,
    startWorkout,
    finishSession,
    endSession,
    hangUp,
    getCurrentRms,
    trainer,
    isTrainerLoading,
    trainerError,
    showInstructionsVideo,
    isMicrophoneMuted,
    isSpeakerMuted,
    toggleMicrophoneMuted: () => setIsMicrophoneMuted((current) => !current),
    toggleSpeakerMuted: () => setIsSpeakerMuted((current) => !current),
  };
}

/**
 * Type guard for messages that may include an `event_type` property.
 */
function messageHasEventType(msg: unknown): msg is { event_type?: string } {
  return typeof msg === "object" && msg !== null && "event_type" in msg;
}
