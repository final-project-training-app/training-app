"use client";
import { useState } from "react";
import { useGeminiLive } from "../../../hooks/useGeminiLive";
import { useLiveToken } from "../../../hooks/useLiveToken";

// eslint-disable-next-line no-console
console.log("useGeminiLive import:", typeof useGeminiLive, useGeminiLive);

export default function GeminiLiveTest() {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [totalAudioBytes, setTotalAudioBytes] = useState(0);
  const [audioCapturing, setAudioCapturing] = useState(false);

  const { token, loadToken, tokenLoading, tokenError } = useLiveToken();

  const {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    stopAudioCapture,
    endUserTurn,
    isActive,
    currentTurn,
    getSession,
  } = useGeminiLive({
    token,
    onAudioData: (data) => {
      setTotalAudioBytes((b) => b + (data?.byteLength ?? 0));
    },
    onMessage: (msg) => {
      try {
        setLastMessage(typeof msg === "string" ? msg : JSON.stringify(msg));
      } catch {
        setLastMessage(String(msg));
      }
    },
  });

  const onConnect = async () => {
    if (typeof geminiConnect !== "function") {
      console.error("geminiConnect is not a function:", geminiConnect);
      return;
    }

    const freshToken = await loadToken();
    if (!freshToken) return;

    try {
      await geminiConnect(freshToken);
    } catch (e) {
      console.error("geminiConnect() failed:", e);
    }
  };

  const onStartAudio = async () => {
    if (typeof startAudioCapture !== "function") {
      console.error("startAudioCapture is not a function:", startAudioCapture);
      return;
    }
    try {
      await startAudioCapture();
      setAudioCapturing(true);
    } catch (e) {
      console.error("startAudioCapture() failed:", e);
    }
  };

  const onStopAudio = () => {
    if (typeof stopAudioCapture !== "function") {
      console.error("stopAudioCapture is not a function:", stopAudioCapture);
      return;
    }
    try {
      stopAudioCapture();
      setAudioCapturing(false);
    } catch (e) {
      console.error("stopAudioCapture() failed:", e);
    }
  };

  const onEndTurn = () => {
    try {
      endUserTurn();
    } catch (e) {
      console.error("endUserTurn() failed:", e);
    }
  };

  const turnLabel =
    currentTurn === "user"
      ? "Din tur"
      : currentTurn === "gemini"
        ? "Geminis tur"
        : "Väntar";

  const turnColor =
    currentTurn === "user"
      ? "#22c55e"
      : currentTurn === "gemini"
        ? "#a855f7"
        : "#9ca3af";

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h3>Gemini Live — quick test</h3>

      {isActive && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            padding: "8px 16px",
            borderRadius: 24,
            background: turnColor,
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            transition: "background 0.3s",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#fff",
              opacity: currentTurn === "idle" ? 0.4 : 1,
              animation: currentTurn !== "idle" ? "pulse 1s infinite" : "none",
            }}
          />
          {turnLabel}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      <div style={{ marginBottom: 8 }}>
        <strong>Token status:</strong>{" "}
        {tokenLoading ? "Loading..." : tokenError ? "Error" : token ? "Loaded" : "Missing"}
      </div>

      {token && (
        <div style={{ marginBottom: 8, wordBreak: "break-all" }}>
          <strong>Token:</strong> {token}
        </div>
      )}

      {tokenError && (
        <div style={{ marginBottom: 8, color: "red" }}>{tokenError}</div>
      )}

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={loadToken}
          disabled={tokenLoading}
          style={{
            marginRight: 8,
            borderStyle: "solid",
            borderColor: "#ccc",
            borderWidth: 1,
            padding: "4px 8px",
          }}
        >
          {tokenLoading ? "Fetching..." : "Fetch Token"}
        </button>

        <button
          onClick={onConnect}
          disabled={!token || isActive || tokenLoading}
          style={{ marginRight: 8 }}
        >
          Connect
        </button>

        <button
          onClick={() => {
            geminiDisconnect();
            setAudioCapturing(false);
          }}
          disabled={!isActive}
          style={{ marginRight: 8 }}
        >
          Disconnect
        </button>

        <button
          onClick={onStartAudio}
          disabled={!isActive || audioCapturing}
          style={{ marginRight: 8 }}
        >
          Start Audio
        </button>

        <button
          onClick={onStopAudio}
          disabled={!audioCapturing}
          style={{ marginRight: 8 }}
        >
          Stop Audio
        </button>

        <button
          onClick={onEndTurn}
          disabled={!audioCapturing}
          style={{
            marginRight: 8,
            background: audioCapturing ? "#22c55e" : undefined,
            color: audioCapturing ? "#fff" : undefined,
            fontWeight: audioCapturing ? 600 : undefined,
          }}
        >
          Avsluta min tur
        </button>

        <button
          onClick={() => {
            console.log("session", getSession());
            alert(getSession() ? "Session present — check console" : "No session");
          }}
          style={{ marginLeft: 8 }}
        >
          Inspect Session
        </button>
      </div>

      <div>
        <strong>Status:</strong> {isActive ? "Connected" : "Disconnected"}
      </div>
      <div>
        <strong>Audio capturing:</strong> {audioCapturing ? "Yes" : "No"}
      </div>
      <div>
        <strong>Total audio bytes:</strong> {totalAudioBytes}
      </div>
      <div style={{ marginTop: 8, maxWidth: 640, whiteSpace: "pre-wrap" }}>
        <strong>Last message:</strong>
        <div
          style={{
            marginTop: 4,
            padding: 8,
            background: "#f6f6f6",
            borderRadius: 4,
          }}
        >
          {lastMessage ?? "<none>"}
        </div>
      </div>
    </div>
  );
}
