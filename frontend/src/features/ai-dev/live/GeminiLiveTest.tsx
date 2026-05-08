import { useState } from "react";
import { useGeminiLive } from "../../../hooks/useGeminiLive";
import { useLiveToken } from "../../../hooks/useLiveToken";
import { executeLiveToolCall, liveSystemInstruction, liveTools } from "./tools";

type ToolEvent = {
  id: string;
  name: string;
  response: unknown;
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
  const [totalAudioBytes, setTotalAudioBytes] = useState(0);
  const [audioCapturing, setAudioCapturing] = useState(false);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [endpointTestLoading, setEndpointTestLoading] = useState(false);

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
    onAudioData: (data) => {
      setTotalAudioBytes((bytes) => bytes + (data?.byteLength ?? 0));
    },
    onMessage: (message) => {
      setLastMessage(stringifyMessage(message));
    },
    onToolCall: async (functionCall) => {
      const response = await executeLiveToolCall(functionCall);
      addToolEvent(response);

      return response;
    },
  });

  function addToolEvent(response: Awaited<ReturnType<typeof executeLiveToolCall>>) {
    setToolEvents((events) => [
      {
        id: response.id ?? crypto.randomUUID(),
        name: response.name ?? "unknown_tool",
        response: response.response,
      },
      ...events,
    ].slice(0, 8));
  }

  async function handleConnect() {
    const freshToken = await loadToken();
    if (!freshToken) return;

    await geminiConnect(freshToken);
  }

  async function handleStartAudio() {
    const started = await startAudioCapture();
    setAudioCapturing(started);
  }

  function handleStopAudio() {
    stopAudioCapture();
    setAudioCapturing(false);
  }

  function handleDisconnect() {
    geminiDisconnect();
    setAudioCapturing(false);
  }

  async function handleTestTrainingContext() {
    setEndpointTestLoading(true);

    try {
      const response = await executeLiveToolCall({
        name: "get_training_context",
        args: {
          userId: 1,
          workoutId: 1,
        },
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
            Gemini Live Test
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-(--brand-muted)">
            Live function calling mot deployad backend. Tools är uppdelade i user, progress, workout och trainingContext.
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
          onClick={() => void handleTestTrainingContext()}
          disabled={endpointTestLoading}
          className="rounded-xl border border-(--brand-border) bg-white px-4 py-3 font-bold text-(--brand-ink)"
        >
          {endpointTestLoading ? "Hämtar endpoints..." : "Testa training context"}
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
          <p className="mt-1 font-bold text-(--brand-ink)">{token ? "Loaded" : "Missing"}</p>
        </div>
        <div className="rounded-xl bg-(--brand-soft) p-4">
          <p className="text-sm font-bold text-(--brand-muted)">Audio capture</p>
          <p className="mt-1 font-bold text-(--brand-ink)">{audioCapturing ? "On" : "Off"}</p>
        </div>
        <div className="rounded-xl bg-(--brand-soft) p-4">
          <p className="text-sm font-bold text-(--brand-muted)">Audio bytes</p>
          <p className="mt-1 font-bold text-(--brand-ink)">{totalAudioBytes}</p>
        </div>
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
                <div key={event.id} className="rounded-lg bg-(--brand-soft) p-3">
                  <p className="text-sm font-bold text-(--brand-primary)">{event.name}</p>
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