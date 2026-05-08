import { useEffect, useRef, useState } from "react";
import { useGeminiLive } from "../../../hooks/useGeminiLive";
import { useLiveToken } from "../../../hooks/useLiveToken";
import { executeLiveToolCall, liveSystemInstruction, liveTools } from "./tools";
import { fixedLiveUserId } from "./tools/shared/liveIntroDefaults";

type ToolEvent = {
  id: string;
  name: string;
  response: unknown;
};

type SelectedWorkout = {
  id: number;
  name: string | null;
};

function stringifyMessage(value: unknown) {
  try {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function GeminiLiveTest() {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [audioCapturing, setAudioCapturing] = useState(false);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [endpointTestLoading, setEndpointTestLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] =
    useState<SelectedWorkout | null>(null);

  const audioCapturingRef = useRef(false);
  const introStartedRef = useRef(false);
  const pendingSelectedWorkoutRef = useRef<SelectedWorkout | null>(null);

  useEffect(() => {
    audioCapturingRef.current = audioCapturing;
  }, [audioCapturing]);

  const { token, loadToken, tokenLoading, tokenError } = useLiveToken();

  const {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    stopAudioCapture,
    endUserTurn,
    isActive,
    connectionError,
    currentTurn,
    getSession,
  } = useGeminiLive({
    token,
    tools: liveTools,
    systemInstruction: liveSystemInstruction,
    onAudioData: () => {},
    onMessage: (message) => {
      setLastMessage(stringifyMessage(message));

      if (
        pendingSelectedWorkoutRef.current &&
        message.serverContent?.turnComplete
      ) {
        geminiDisconnect();
        setAudioCapturing(false);
      }
    },
    onToolCall: async (functionCall) => {
      const response = await executeLiveToolCall(functionCall);
      addToolEvent(response);

      const selected = readSelectedWorkout(response);
      if (selected) {
        pendingSelectedWorkoutRef.current = selected;
        setSelectedWorkout(selected);

        if (audioCapturingRef.current) {
          stopAudioCapture();
          setAudioCapturing(false);
        }
      }

      return response;
    },
  });

  function readSelectedWorkout(
    response: Awaited<ReturnType<typeof executeLiveToolCall>>,
  ): SelectedWorkout | null {
    if (response.name !== "get_workout_details") {
      return null;
    }

    const responseBody = response.response;
    if (
      !responseBody ||
      typeof responseBody !== "object" ||
      !("output" in responseBody)
    ) {
      return null;
    }

    const output = (responseBody as { output?: Record<string, unknown> })
      .output;
    if (!output || typeof output !== "object") {
      return null;
    }

    const workout = output.workout;
    const workoutRecord =
      workout && typeof workout === "object"
        ? (workout as { id?: unknown; name?: unknown })
        : null;
    const workoutId =
      typeof output.workoutId === "number"
        ? output.workoutId
        : typeof workoutRecord?.id === "number"
          ? workoutRecord.id
          : null;

    if (!workoutId) {
      return null;
    }

    const workoutName =
      typeof workoutRecord?.name === "string" ? workoutRecord.name : null;

    return {
      id: workoutId,
      name: workoutName,
    };
  }

  function addToolEvent(
    response: Awaited<ReturnType<typeof executeLiveToolCall>>,
  ) {
    setToolEvents((events) =>
      [
        {
          id: response.id ?? crypto.randomUUID(),
          name: response.name ?? "unknown_tool",
          response: response.response,
        },
        ...events,
      ].slice(0, 8),
    );
  }

  async function handleConnect() {
    pendingSelectedWorkoutRef.current = null;
    introStartedRef.current = false;
    setSelectedWorkout(null);
    const freshToken = await loadToken();
    if (!freshToken) return;

    await geminiConnect(freshToken);
  }

  async function handleStartAudio() {
    const started = await startAudioCapture();
    setAudioCapturing(started);

    if (!started || introStartedRef.current) {
      return;
    }

    introStartedRef.current = true;
    getSession()?.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [{ text: "Starta träningsintrot nu." }],
        },
      ],
      turnComplete: true,
    });
  }

  function handleStopAudio() {
    stopAudioCapture();
    setAudioCapturing(false);
  }

  function handleDisconnect() {
    pendingSelectedWorkoutRef.current = null;
    introStartedRef.current = false;
    geminiDisconnect();
    setAudioCapturing(false);
  }

  async function handleTestWorkoutCatalog() {
    setEndpointTestLoading(true);

    try {
      const response = await executeLiveToolCall({
        name: "get_workout_catalog",
        args: {},
      });

      addToolEvent(response);
    } finally {
      setEndpointTestLoading(false);
    }
  }

  const turnLabel =
    currentTurn === "user"
      ? "Din tur"
      : currentTurn === "gemini"
        ? "Geminis tur"
        : "Väntar";

  return (
    <section className="rounded-2xl border border-(--brand-border) bg-(--brand-surface) p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-(--brand-muted)">
            Live sandbox
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-(--brand-ink)">
            Workout Start Intro
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-(--brand-muted)">
            Låst intro-läge för att välja träningspass. Mic startar ett kort
            AI-intro, använder fast user {fixedLiveUserId} i dev och stänger
            sedan ner sig själv efter valt workout.
          </p>
        </div>

        <div className="rounded-full bg-(--brand-soft) px-4 py-2 text-sm font-bold text-(--brand-primary)">
          {isActive ? `Connected · ${turnLabel}` : "Disconnected"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => void handleConnect()}
          disabled={isActive || tokenLoading}
          className="rounded-xl bg-(--brand-primary) px-4 py-3 font-bold text-(--brand-on-primary) disabled:opacity-50"
        >
          {tokenLoading ? "Hämtar token..." : "Connect live"}
        </button>
        <button
          type="button"
          onClick={() => void handleTestWorkoutCatalog()}
          disabled={endpointTestLoading}
          className="rounded-xl border border-(--brand-border) bg-white px-4 py-3 font-bold text-(--brand-ink)"
        >
          {endpointTestLoading ? "Hämtar workouts..." : "Testa workout-katalog"}
        </button>

        <button
          type="button"
          onClick={() => void handleStartAudio()}
          disabled={!isActive || audioCapturing}
          className="rounded-xl border border-(--brand-border) bg-white px-4 py-3 font-bold text-(--brand-ink) disabled:opacity-50"
        >
          Starta mikrofon
        </button>

        <button
          type="button"
          onClick={handleStopAudio}
          disabled={!audioCapturing}
          className="rounded-xl border border-(--brand-border) bg-white px-4 py-3 font-bold text-(--brand-ink) disabled:opacity-50"
        >
          Stoppa mikrofon
        </button>

        <button
          type="button"
          onClick={endUserTurn}
          disabled={!audioCapturing}
          className="rounded-xl border border-(--brand-border) bg-white px-4 py-3 font-bold text-(--brand-ink) disabled:opacity-50"
        >
          Avsluta min tur
        </button>

        <button
          type="button"
          onClick={handleDisconnect}
          disabled={!isActive}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 disabled:opacity-50"
        >
          Disconnect
        </button>

        <button
          type="button"
          onClick={() => console.log("Gemini Live session", getSession())}
          className="rounded-xl border border-(--brand-border) bg-white px-4 py-3 font-bold text-(--brand-ink)"
        >
          Inspect session
        </button>
      </div>

      {tokenError ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {tokenError}
        </p>
      ) : null}

      {connectionError ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {connectionError}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-(--brand-soft) p-4">
          <p className="text-sm font-bold text-(--brand-muted)">Token</p>
          <p className="mt-1 font-bold text-(--brand-ink)">
            {token ? "Loaded" : "Missing"}
          </p>
        </div>
        <div className="rounded-xl bg-(--brand-soft) p-4">
          <p className="text-sm font-bold text-(--brand-muted)">Dev user</p>
          <p className="mt-1 font-bold text-(--brand-ink)">{fixedLiveUserId}</p>
        </div>
        <div className="rounded-xl bg-(--brand-soft) p-4">
          <p className="text-sm font-bold text-(--brand-muted)">
            Audio capture
          </p>
          <p className="mt-1 font-bold text-(--brand-ink)">
            {audioCapturing ? "On" : "Off"}
          </p>
        </div>
        <div className="rounded-xl bg-(--brand-soft) p-4">
          <p className="text-sm font-bold text-(--brand-muted)">Valt workout</p>
          <p className="mt-1 font-bold text-(--brand-ink)">
            {selectedWorkout
              ? `${selectedWorkout.id} · ${selectedWorkout.name ?? "okänt namn"}`
              : "Inte valt ännu"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
        Flöde: starta mikrofon → AI säger kort hej → hämtar progress för user{" "}
        {fixedLiveUserId} → hämtar workout-katalog → väljer workout → kör
        get_workout_details → stoppar mic → avslutar Gemini Live.
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-(--brand-border) bg-white p-4">
          <h3 className="font-extrabold text-(--brand-ink)">Last message</h3>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-(--brand-ink-soft)">
            {lastMessage ?? "No live message yet."}
          </pre>
        </section>

        <section className="rounded-xl border border-(--brand-border) bg-white p-4">
          <h3 className="font-extrabold text-(--brand-ink)">Tool calls</h3>
          <div className="mt-3 max-h-72 space-y-3 overflow-auto">
            {toolEvents.length === 0 ? (
              <p className="text-sm text-(--brand-muted)">No tool calls yet.</p>
            ) : (
              toolEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg bg-(--brand-soft) p-3"
                >
                  <p className="text-sm font-bold text-(--brand-primary)">
                    {event.name}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-(--brand-ink-soft)">
                    {JSON.stringify(event.response, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
