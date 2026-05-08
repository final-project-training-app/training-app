"use client";
import { useEffect, useRef, useState } from "react";
import { useGeminiLive } from "../../../hooks/useGeminiLive"; // must be a named import

// eslint-disable-next-line no-console
console.log("useGeminiLive import:", typeof useGeminiLive, useGeminiLive);

export default function GeminiLiveTest() {
  
  const [token, setToken] = useState("");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [totalAudioBytes, setTotalAudioBytes] = useState(0);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [audioCapturing, setAudioCapturing] = useState(false);

  // prevent duplicate requests and allow abort on unmount
  const inFlightRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function loadToken(): Promise<string | null> {
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    controllerRef.current = new AbortController();
    setTokenLoading(true);
    setTokenError(null);

    try {
      const res = await fetch("http://localhost:8080/api/live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uses: 10 }),
        signal: controllerRef.current.signal,
      });

      if (!res.ok)
        throw new Error(
          `Token request failed: ${res.status} ${res.statusText}`,
        );

      const contentType = res.headers.get("content-type") ?? "";
      let tokenValue: string | null = null;
      if (contentType.includes("application/json")) {
        interface AuthTokenResponse {
          name?: string;
          token?: string;
          expireTime?: string;
        }
        const data = (await res.json()) as AuthTokenResponse;
        console.log("[Token] full response:", data);
        if (data.expireTime) {
          console.log("[Token] expires at:", new Date(data.expireTime).toISOString());
        }
        tokenValue = data.token ?? data.name ?? null;
        if (!tokenValue) throw new Error("Token missing in response");
      } else {
        const text = await res.text();
        if (!text) throw new Error("Empty token response");
        tokenValue = text.trim();
      }
      setToken(tokenValue);
      return tokenValue;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setTokenError((error as Error).message);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      controllerRef.current = null;
      setTokenLoading(false);
    }
  }

  const { geminiConnect, geminiDisconnect, startAudioCapture, stopAudioCapture, endUserTurn, isActive, currentTurn, getSession } =
    useGeminiLive({
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

  // guard against invalid imports/exports and provide diagnostic logging
  const onConnect = async () => {
    if (typeof geminiConnect !== "function") {
      console.error("geminiConnect is not a function:", geminiConnect);
      return;
    }

    // Always fetch a fresh token before each connection and pass it directly
    // to avoid the useEffect timing gap where tokenRef may still hold the old value
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
        {tokenLoading
          ? "Loading..."
          : tokenError
            ? "Error"
            : token
              ? "Loaded"
              : "Missing"}
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
          onClick={() => { geminiDisconnect(); setAudioCapturing(false); }}
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
            alert(
              getSession() ? "Session present — check console" : "No session",
            );
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
