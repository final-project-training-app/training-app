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
import { getWorkoutCatalogEndpoint } from "../ai-dev/live/tools/workout/workoutEndpoint";
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

const LIVE_READY_DELAY_MS = 250;
const MAX_CONFIRMATION_WAIT_MS = 300;
const MAX_AI_PLAYBACK_WAIT_MS = 1200;
const READY_ACK_PHRASE = "vad bra! nu kör vi igång";

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

function buildSessionInstruction(session: CoachCallSession) {
  return [
    liveSystemInstruction,
    `Du pratar med ${session.userName}.`,
    `Använd denna användarkontext: ${session.context || "Ingen extra context finns."}`,
    "Det här är ett träningssamtal. Om användaren börjar prata om annat, svara kort och vänligt att ni kan ta det senare och styr tillbaka till träningen.",
    "I början ska du först välja workout från katalogen. Sedan ska du hälsa personligt, säga vilken workout du valde och varför den passar användarens context.",
    "Stilen ska passa en person som är 60+: prata långsamt, varmt, enkelt och utan tekniska ord.",
    "Var förklarande men kort: säg vad som händer nu, varför passet passar, och vad användaren ska göra härnäst.",
    "Ge bara en instruktion i taget. Undvik långa monologer.",
    "Efter att du har valt workout och sagt varför ska du säga att användaren först får lyssna noggrant på instruktionerna.",
    "Fråga sedan: 'Är du redo att lyssna på instruktionerna?'",
    "Du får bara kalla start_instructions efter att användaren tydligt har sagt ja till instruktionerna. När användaren godkänner ska du först säga exakt: 'Vad bra! Nu kör vi igång.' Sedan ska du kalla start_instructions.",
    "När appen har spelat instruktionerna ska du fråga om användaren är redo att börja workouten.",
    "Du får bara kalla start_workout när appen redan har spelat instruktionerna och användaren därefter tydligt säger ja eller att hen är redo. När användaren är redo ska du först säga exakt: 'Vad bra! Nu kör vi igång.' Sedan ska du kalla start_workout.",
    "När workouten är klar ska du först hämta progress med get_user_progress. Nämn kort vad användaren just gjorde och om det finns progress, till exempel streak eller tidigare pass.",
    "Efter progress-sammanfattningen ska du fråga hur passet kändes. När du har fått feedback ska du sammanfatta kort och kalla finish_session_feedback.",
    "Upprepa inte frågor som redan har besvarats. Fråga inte igen om instruktioner.",
    "Håll allt kort, tryggt och tydligt.",
  ].join(" ");
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

function formatWorkoutCatalogForCoach(workouts: BackendWorkoutResponse[]) {
  return workouts
    .slice(0, 8)
    .map((workout) =>
      [
        `${workout.id}: ${workout.name}`,
        workout.type ? `typ ${workout.type}` : null,
        workout.level ? `nivå ${workout.level}` : null,
        workout.durationMinutes ? `${workout.durationMinutes} min` : null,
        workout.seated ? "sittande" : null,
        workout.lowImpact ? "low impact" : null,
        workout.beginnerFriendly ? "nybörjarvänlig" : null,
        workout.kneeFriendly ? "knävänlig" : null,
      ]
        .filter(Boolean)
        .join(", "),
    )
    .join(" | ");
}

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
    (message as {
      serverContent?: { modelTurn?: { parts?: Array<{ text?: string }> } };
    }).serverContent?.modelTurn?.parts ?? [];

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

export function useCoachSession({
  session,
  autoStart = true,
}: UseCoachSessionOptions) {
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
  const pendingCoachActionRef = useRef<PendingCoachAction>(null);
  const pendingCoachTimerRef = useRef<number | null>(null);
  const getAiPlaybackRemainingMsRef = useRef<() => number>(() => 0);
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

  const clearPendingCoachTimer = useCallback(() => {
    if (pendingCoachTimerRef.current === null) {
      return;
    }

    window.clearTimeout(pendingCoachTimerRef.current);
    pendingCoachTimerRef.current = null;
  }, []);

  const runPendingCoachAction = useCallback(
    async (action: Exclude<PendingCoachAction, null>, reason: string) => {
      clearPendingCoachTimer();
      pendingCoachActionRef.current = null;
      addDebugEvent("runQueuedAction", `${action} (${reason})`);

      // Wait for AI playback to finish (or until timeout) to avoid cutting off Gemini.
      const start = Date.now();
      const pollMs = 40;
      const graceMs = 60;
      while (Date.now() - start < MAX_AI_PLAYBACK_WAIT_MS) {
        const remaining = getAiPlaybackRemainingMsRef.current();
        if (remaining <= 60) break;
        await new Promise((r) => setTimeout(r, pollMs));
      }

      // small grace period to let audio tail finish
      await new Promise((r) => setTimeout(r, graceMs));

      if (action === "start_instructions") {
        await startInstructionsRef.current();
        return;
      }

      await startWorkoutRef.current();
    },
    [addDebugEvent, clearPendingCoachTimer],
  );

  const schedulePendingCoachAction = useCallback(
    (action: PendingCoachAction, reason: string, delayMs: number) => {
      if (!action) {
        addDebugEvent("ignored queued action", `${reason}, step=${stepRef.current}`);
        return;
      }

      const safeDelayMs = Math.max(0, Math.min(delayMs, MAX_CONFIRMATION_WAIT_MS));
      clearPendingCoachTimer();
      pendingCoachActionRef.current = action;
      addDebugEvent("queued action", `${action} in ${safeDelayMs}ms (${reason})`);
      pendingCoachTimerRef.current = window.setTimeout(() => {
        runPendingCoachAction(action, reason);
      }, safeDelayMs);
    },
    [addDebugEvent, clearPendingCoachTimer, runPendingCoachAction],
  );

  const queueActionFromAck = useCallback(
    (action: PendingCoachAction, reason: string) => {
      if (!action) {
        addDebugEvent("ignored queued action", `${reason}, step=${stepRef.current}`);
        return;
      }
      addDebugEvent("ack-received", `${action} (${reason})`);
      // Schedule immediately; the runner will wait for AI playback to finish.
      schedulePendingCoachAction(action, reason, 0);
    },
    [addDebugEvent, schedulePendingCoachAction],
  );

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
    tools: [...liveTools, ...sessionControlTools],
    systemInstruction: buildSessionInstruction(session),
    onToolCall: async (functionCall): Promise<FunctionResponse> => {
      const name = functionCall.name ?? "unknown_tool";
      addDebugEvent("tool call", `${name}, step=${stepRef.current}`);

      if (name === "start_instructions") {
        const queuedAction = getQueuedActionForStep(stepRef.current);
        queueActionFromAck(queuedAction, "tool call");

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
        queueActionFromAck(queuedAction, "tool call");

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
          const queuedAction = getQueuedActionForStep(stepRef.current);
          if (queuedAction) {
            addDebugEvent("phrase-match", queuedAction);
            // Let the runner handle waiting for playback end to avoid cutting off Gemini.
            schedulePendingCoachAction(queuedAction, "phrase match", 0);
            return;
          }
        }

      if (message.serverContent?.turnComplete && pendingCoachActionRef.current) {
        const pendingAction = pendingCoachActionRef.current;
        schedulePendingCoachAction(pendingAction, "gemini turnComplete", 0);
        return;
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

  useEffect(() => {
    getAiPlaybackRemainingMsRef.current = getAiPlaybackRemainingMs;
  }, [getAiPlaybackRemainingMs]);

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

    await new Promise((resolve) => window.setTimeout(resolve, LIVE_READY_DELAY_MS));

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
    if (hasStartedRef.current) {
      return;
    }

    startedAtRef.current = performance.now();
    debugIdRef.current = 0;
    setDebugEvents([]);
    addDebugEvent("session start", session.userName);
    hasStartedRef.current = true;
    setError(null);
    setSessionStep("choosing_workout");

    const [freshToken, workoutCatalog] = await Promise.all([
      loadToken(),
      getWorkoutCatalogEndpoint().catch(() => null),
    ]);
    addDebugEvent(
      "prefetch complete",
      workoutCatalog?.ok
        ? `${workoutCatalog.data.length} workouts`
        : "catalog failed",
    );

    if (!freshToken) {
      addDebugEvent("initial token failed");
      setError("Kunde inte starta coach-samtalet.");
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

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

    await new Promise((resolve) => window.setTimeout(resolve, 250));

    addDebugEvent("ready-sent", "instructions");
    sendCoachPrompt(
      [
        `Starta sessionen för ${session.userName}. Context: ${session.context || "ingen extra context"}.`,
        workoutCatalog?.ok
          ? `Katalog: ${formatWorkoutCatalogForCoach(workoutCatalog.data)}. Välj bästa workouten och kalla get_workout_details.`
          : "Hämta katalogen med get_workout_catalog, välj bästa workouten och kalla get_workout_details.",
        "Säg sedan: 'Jag har valt [workout]. Lyssna noggrant på instruktionerna.' Fråga: 'Är du redo att lyssna på instruktionerna?' Vid användarens ja, säg exakt 'Vad bra! Nu kör vi igång.' och kalla start_instructions.",
      ].join(" "),
    );
  }, [
    addDebugEvent,
    geminiConnect,
    loadToken,
    sendCoachPrompt,
    session.userName,
    session.context,
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
    const workoutAudioUrl = workout?.workoutAudio ?? session.workoutAudioUrl;

    if (!workoutAudioUrl) {
      setError("Workout-ljud saknas.");
      setSessionStep("error");
      return;
    }

    try {
      addDebugEvent("play workout", workoutAudioUrl);
      await startSessionAudio(workoutAudioUrl, {
        onEnded: async () => {
          addDebugEvent("workout ended");
          setSessionStep("collecting_feedback");
          const connected = await connectFreshLive();
          if (!connected) {
            return;
          }

          await new Promise((resolve) =>
            window.setTimeout(resolve, LIVE_READY_DELAY_MS),
          );
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
              `Workouten "${selectedWorkoutRef.current?.name ?? session.workoutName}" är klar.`,
              "Kalla get_user_progress, nämn kort vad användaren gjorde och en enkel progress-sak om den finns.",
              "Fråga 'Hur kändes det i kroppen?' och kalla finish_session_feedback efter användarens feedback.",
            ].join(" "),
          );
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
    session.workoutAudioUrl,
    session.workoutName,
  ]);

  const finishSession = useCallback(() => {
    finishSessionRef.current();
  }, []);

  const finishSessionWithSummary = useCallback(
    (summary = "") => {
      clearPendingCoachTimer();
      stopSessionAudio();
      disconnectLive();
      console.debug(
        "[CoachSession] Mock save feedback until backend endpoint exists",
        {
          workoutId: session.id,
          selectedWorkoutId: selectedWorkoutRef.current?.id ?? null,
          status: "COMPLETED",
          feedback: summary,
        },
      );
      setSessionStep("completed");
    },
    [clearPendingCoachTimer, disconnectLive, session.id, setSessionStep],
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
