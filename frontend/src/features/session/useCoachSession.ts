/* eslint-disable react-hooks/preserve-manual-memoization */
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
import type { BackendWorkoutResponse } from "../ai-dev/live/tools/workout/workoutTypes";
import { startSessionAudio, stopSessionAudio } from "./audio";
import type { CoachCallSession } from "./types";

export type CoachSessionStep =
  | "idle"
  | "choosing_workout"
  | "live_intro"
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

const sessionControlTools: ToolListUnion = [
  {
    functionDeclarations: [
      {
        name: "start_workout",
        description:
          "Start the workout audio when the user clearly says they are ready, for example 'kör igång', 'jag är redo', or 'starta'.",
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
    `Dagens workout är "${session.workoutName}".`,
    "Det här är ett träningssamtal. Om användaren börjar prata om annat, svara kort och vänligt att ni kan ta det senare och styr tillbaka till träningen.",
    "I början ska du först välja workout från katalogen. Sedan ska du hälsa personligt, säga vilken workout du valde och varför den passar användarens context.",
    "När appen har spelat instruktionerna ska du fråga om användaren är redo. Om användaren säger 'kör igång', 'jag är redo' eller liknande ska du kalla start_workout.",
    "När workouten är klar ska du fråga hur det kändes. När du har fått feedback ska du sammanfatta kort och kalla finish_session_feedback.",
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

export function useCoachSession({
  session,
  autoStart = true,
}: UseCoachSessionOptions) {
  const [step, setStep] = useState<CoachSessionStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioCapturing, setAudioCapturing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] =
    useState<BackendWorkoutResponse | null>(null);

  const stepRef = useRef<CoachSessionStep>("idle");
  const selectedWorkoutRef = useRef<BackendWorkoutResponse | null>(null);
  const hasStartedRef = useRef(false);
  const liveTokenRef = useRef("");
  const disconnectRef = useRef<() => void>(() => {});
  const startWorkoutRef = useRef<() => Promise<void>>(async () => {});
  const finishSessionRef = useRef<(summary?: string) => void>(() => {});

  const { token, loadToken, tokenLoading, tokenError } = useLiveToken();

  const setSessionStep = useCallback((nextStep: CoachSessionStep) => {
    stepRef.current = nextStep;
    setStep(nextStep);
  }, []);

  const {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    stopAudioCapture,
    isActive,
    connectionError,
    currentTurn,
    getSession,
  } = useGeminiLive({
    token,
    tools: [...liveTools, ...sessionControlTools],
    systemInstruction: buildSessionInstruction(session),
    onToolCall: async (functionCall): Promise<FunctionResponse> => {
      const name = functionCall.name ?? "unknown_tool";

      if (name === "start_workout") {
        await startWorkoutRef.current();
        return {
          id: functionCall.id,
          name,
          response: { output: { ok: true } },
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
        selectedWorkoutRef.current = workout;
        setSelectedWorkout(workout);
        stopAudioCapture();
        setAudioCapturing(false);
        setSessionStep("live_intro");
      }

      return response;
    },
    onMessage: (message) => {
      if (
        (stepRef.current === "choosing_workout" ||
          stepRef.current === "live_intro") &&
        message.serverContent?.turnComplete
      ) {
        if (selectedWorkoutRef.current) {
          void playInstructions();
        } else {
          sendCoachPrompt(
            "Välj först en workout genom get_workout_catalog och get_workout_details. Säg sedan kort varför den passar.",
          );
        }
      }
    },
  });

  useEffect(() => {
    disconnectRef.current = geminiDisconnect;
  }, [geminiDisconnect]);

  const stopMic = useCallback(() => {
    stopAudioCapture();
    setAudioCapturing(false);
  }, [stopAudioCapture]);

  const sendCoachPrompt = useCallback(
    (text: string) => {
      getSession()?.sendClientContent({
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      });
    },
    [getSession],
  );

  const askIfReady = useCallback(async () => {
    setSessionStep("asking_ready");

    await geminiConnect(liveTokenRef.current);
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    const started = await startAudioCapture();
    setAudioCapturing(started);

    if (!started) {
      setError("Kunde inte starta mikrofonen.");
      setSessionStep("error");
      return;
    }

    sendCoachPrompt(
      "Fråga kort och vänligt om användaren är redo att starta workouten. Om användaren säger kör igång, jag är redo eller liknande ska du kalla start_workout.",
    );
  }, [
    geminiConnect,
    sendCoachPrompt,
    setSessionStep,
    startAudioCapture,
  ]);

  const playInstructions = useCallback(async () => {
    stopMic();
    geminiDisconnect();
    setSessionStep("playing_instructions");
    const workout = selectedWorkoutRef.current;
    const instructionsAudioUrl = workout?.instructionsAudio;

    if (!instructionsAudioUrl) {
      setError("Instruktionsljud saknas för vald workout.");
      setSessionStep("error");
      return;
    }

    try {
      await startSessionAudio(instructionsAudioUrl, {
        onEnded: () => {
          void askIfReady();
        },
      });
    } catch {
      setError("Kunde inte spela upp instruktionerna.");
      setSessionStep("error");
    }
  }, [askIfReady, geminiDisconnect, setSessionStep, stopMic]);

  const startSession = useCallback(async () => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    setError(null);
    setSessionStep("choosing_workout");

    const freshToken = await loadToken();
    if (!freshToken) {
      setError("Kunde inte starta coach-samtalet.");
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

    await geminiConnect(freshToken);
    liveTokenRef.current = freshToken;
    const started = await startAudioCapture();
    setAudioCapturing(started);

    if (!started) {
      setError("Kunde inte starta mikrofonen.");
      setSessionStep("error");
      hasStartedRef.current = false;
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250));

    sendCoachPrompt(
      [
        `Starta sessionen för ${session.userName}.`,
        "Välj dagens workout själv från workout-katalogen.",
        `Användarens context är: ${session.context || "ingen extra context"}.`,
        "Börja med att kalla get_workout_catalog. Välj den workout som matchar användaren bäst och kalla get_workout_details för den.",
        "När du har valt workout: säg hej, namnet på workouten och max en mening om varför den passar.",
        "Fråga sedan om användaren vill köra igång. När du är klar kommer appen spela instruktionerna.",
        "Håll det snabbt och gå inte in på andra ämnen.",
      ].join(" "),
    );
  }, [
    geminiConnect,
    loadToken,
    sendCoachPrompt,
    session.userName,
    session.context,
    setSessionStep,
    startAudioCapture,
  ]);

  const startWorkout = useCallback(async () => {
    if (stepRef.current === "playing_workout") {
      return;
    }

    stopMic();
    geminiDisconnect();
    setSessionStep("playing_workout");

    const workout = selectedWorkoutRef.current;
    const workoutAudioUrl = workout?.workoutAudio ?? session.workoutAudioUrl;

    if (!workoutAudioUrl) {
      setError("Workout-ljud saknas.");
      setSessionStep("error");
      return;
    }

    try {
      await startSessionAudio(workoutAudioUrl, {
        onEnded: async () => {
          setSessionStep("collecting_feedback");
          await geminiConnect(liveTokenRef.current);
          await new Promise((resolve) => window.setTimeout(resolve, 250));
          const started = await startAudioCapture();
          setAudioCapturing(started);

          if (!started) {
            setError("Kunde inte starta mikrofonen.");
            setSessionStep("error");
            return;
          }

          sendCoachPrompt(
            "Workouten är klar. Fråga kort hur det kändes och be om feedback.",
          );
        },
      });
    } catch {
      setError("Kunde inte spela upp workouten.");
      setSessionStep("error");
    }
  }, [
    sendCoachPrompt,
    geminiConnect,
    geminiDisconnect,
    setSessionStep,
    startAudioCapture,
    stopMic,
    session.workoutAudioUrl,
  ]);

  const finishSession = useCallback(() => {
    finishSessionRef.current();
  }, []);

  const finishSessionWithSummary = useCallback(
    (summary = "") => {
      stopSessionAudio();
      stopMic();
      console.log(
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
    [session.id, setSessionStep, stopMic],
  );

  useEffect(() => {
    startWorkoutRef.current = startWorkout;
    finishSessionRef.current = finishSessionWithSummary;
  }, [finishSessionWithSummary, startWorkout]);

  const endSession = useCallback(() => {
    stopSessionAudio();
    stopMic();
    geminiDisconnect();
    hasStartedRef.current = false;
    setSessionStep("idle");
  }, [geminiDisconnect, setSessionStep, stopMic]);

  useEffect(() => {
    return () => {
      stopSessionAudio();
      disconnectRef.current();
    };
  }, []);

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
    isLoadingToken: tokenLoading,
    startSession,
    startWorkout,
    finishSession,
    endSession,
  };
}
