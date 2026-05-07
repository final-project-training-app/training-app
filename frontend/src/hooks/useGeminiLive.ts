import { useEffect, useRef, useState } from "react";
import {
  GoogleGenAI,
  MediaResolution,
  Modality,
  type LiveServerMessage,
  type Session,
} from "@google/genai";

const SAMPLE_RATE = 16000;
const CHUNK_SAMPLES = 2560; // 160 ms @ 16 kHz
const SILENCE_THRESHOLD = 0.01; // RMS below this = silence, chunk dropped

interface UseGeminiLiveProps {
  token: string;
  onAudioData?: (data: ArrayBuffer) => void;
  onMessage?: (message: LiveServerMessage) => void;
}

interface DebugStats {
  inputSampleRate: number;
  outputSampleRate: number;
  channels: number;
  chunkSizeSamples: number;
  chunkSizeMs: number;
  chunksThisSecond: number;
  bytesThisSecond: number;
  droppedSilentChunks: number;
  totalBytesSent: number;
}

function pcm16ToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export type Turn = "user" | "gemini" | "idle";

export const useGeminiLive = ({
  token,
  onAudioData,
  onMessage,
}: UseGeminiLiveProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<Turn>("idle");
  const sessionRef = useRef<Session | null>(null);
  const tokenRef = useRef(token);
  const onAudioRef = useRef(onAudioData);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    tokenRef.current = token;
    onAudioRef.current = onAudioData;
    onMessageRef.current = onMessage;
  }, [token, onAudioData, onMessage]);

  async function geminiConnect(overrideToken?: string) {
    console.log("[GeminiLive] connect pressed");

    const activeToken = overrideToken ?? tokenRef.current;
    if (!activeToken) {
      console.error("[GeminiLive] missing token");
      return;
    }
    // Keep ref in sync if an override was supplied before the useEffect fires
    if (overrideToken) tokenRef.current = overrideToken;

    if (sessionRef.current) {
      console.log("[GeminiLive] already connected — skipping");
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: activeToken,
        httpOptions: { apiVersion: "v1alpha" },
      });

      const session = await ai.live.connect({
        model: "models/gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" },
            },
          },
          realtimeInputConfig: {
            // Disable server-side VAD so we control turns explicitly via
            // activityStart / activityEnd — avoids Gemini waiting indefinitely.
            automaticActivityDetection: { disabled: true },
          },
        },
        callbacks: {
          onopen: () => {
            console.log("[GeminiLive] opened");
            setIsActive(true);
          },
          onmessage: (message: LiveServerMessage) => {
            console.log("[GeminiLive] message:", message);
            onMessageRef.current?.(message);

            const parts = message.serverContent?.modelTurn?.parts ?? [];
            let audioParts = 0;

            for (const part of parts) {
              const b64 = part?.inlineData?.data;
              if (!b64) continue;

              const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
              console.log(
                "[GeminiLive] audio part:",
                part.inlineData?.mimeType ?? "(unknown mime)",
                "bytes:",
                bytes.byteLength,
              );
              onAudioRef.current?.(bytes.buffer);
              audioParts++;
            }

            if (audioParts > 0) {
              setCurrentTurn("gemini");
            } else if (audioParts === 0 && parts.length > 0) {
              console.log(
                "[GeminiLive] modelTurn had parts, but no inline audio data",
              );
            }

            if (message.serverContent?.turnComplete) {
              setCurrentTurn("idle");
            }

            const text = parts.map((p) => p?.text).filter(Boolean).join(" ");
            if (text) console.log("[GeminiLive] text:", text);
          },
          onerror: (e: ErrorEvent) => {
            console.error("[GeminiLive] error:", e.message);
          },
          onclose: (e: CloseEvent) => {
            console.log(
              "[GeminiLive] closed — code:",
              e.code,
              "reason:",
              e.reason || "(no reason)",
            );
            setIsActive(false);
            sessionRef.current = null;
          },
        },
      });

      sessionRef.current = session;
      console.log("[GeminiLive] connect success:", session);
    } catch (error) {
      console.error("[GeminiLive] Failed to connect:", error);
      setIsActive(false);
    }
  }

  function geminiDisconnect() {
    console.log("[GeminiLive] disconnect pressed");
    stopAudioCapture();
    sessionRef.current?.close();
    sessionRef.current = null;
    setIsActive(false);
    setCurrentTurn("idle");
  }

  function getSession() {
    return sessionRef.current;
  }

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const workletBlobUrlRef = useRef<string | null>(null);
  const isCapturingRef = useRef(false);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const statsRef = useRef<DebugStats>({
    inputSampleRate: 0,
    outputSampleRate: SAMPLE_RATE,
    channels: 1,
    chunkSizeSamples: CHUNK_SAMPLES,
    chunkSizeMs: (CHUNK_SAMPLES / SAMPLE_RATE) * 1000,
    chunksThisSecond: 0,
    bytesThisSecond: 0,
    droppedSilentChunks: 0,
    totalBytesSent: 0,
  });

  async function startAudioCapture() {
    if (isCapturingRef.current) {
      console.warn(
        "[GeminiLive] startAudioCapture() called while already capturing — ignored",
      );
      return;
    }

    try {
      console.log("[GeminiLive] requesting microphone access");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const trackSettings = stream.getAudioTracks()[0]?.getSettings() ?? {};
      console.log("[GeminiLive] track settings:", trackSettings);
      statsRef.current.inputSampleRate = trackSettings.sampleRate ?? SAMPLE_RATE;
      statsRef.current.channels = trackSettings.channelCount ?? 1;

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;
      statsRef.current.outputSampleRate = audioContext.sampleRate;
      console.log("[GeminiLive] AudioContext.sampleRate:", audioContext.sampleRate);

      const source = audioContext.createMediaStreamSource(stream);

      // Worklet: mono channel 0 only, buffer into CHUNK_SAMPLES frames,
      // compute RMS for silence detection, convert Float32→PCM16, transfer buffer (zero-copy).
      const workletCode = `
        const CHUNK = ${CHUNK_SAMPLES};
        const SILENCE = ${SILENCE_THRESHOLD};
        class AudioProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this._buf = new Float32Array(CHUNK);
            this._idx = 0;
          }
          process(inputs) {
            const ch = inputs[0]?.[0];
            if (!ch) return true;
            for (let i = 0; i < ch.length; i++) {
              this._buf[this._idx++] = ch[i];
              if (this._idx >= CHUNK) {
                let ss = 0;
                for (let j = 0; j < CHUNK; j++) ss += this._buf[j] * this._buf[j];
                const rms = Math.sqrt(ss / CHUNK);
                const pcm16 = new Int16Array(CHUNK);
                for (let j = 0; j < CHUNK; j++) {
                  pcm16[j] = Math.round(Math.max(-1, Math.min(1, this._buf[j])) * 32767);
                }
                this.port.postMessage({ pcm16: pcm16.buffer, rms }, [pcm16.buffer]);
                this._idx = 0;
              }
            }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;

      const blob = new Blob([workletCode], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      workletBlobUrlRef.current = blobUrl;

      await audioContext.audioWorklet.addModule(blobUrl);
      const workletNode = new AudioWorkletNode(audioContext, "audio-processor");
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (
        event: MessageEvent<{ pcm16: ArrayBuffer; rms: number }>,
      ) => {
        const { pcm16, rms } = event.data;

        if (rms < SILENCE_THRESHOLD) {
          statsRef.current.droppedSilentChunks++;
          return;
        }

        const base64 = pcm16ToBase64(pcm16);

        sessionRef.current?.sendRealtimeInput({
          audio: { data: base64, mimeType: `audio/pcm;rate=${SAMPLE_RATE}` },
        });

        statsRef.current.chunksThisSecond++;
        statsRef.current.bytesThisSecond += pcm16.byteLength;
        statsRef.current.totalBytesSent += pcm16.byteLength;
      };

      // Do NOT connect workletNode to destination — avoids mic feedback loop.
      source.connect(workletNode);
      isCapturingRef.current = true;
      setCurrentTurn("user");
      sessionRef.current?.sendRealtimeInput({ activityStart: {} });

      statsIntervalRef.current = setInterval(() => {
        /*  const s = statsRef.current;
      console.table({
          "input sample rate (Hz)": { value: s.inputSampleRate },
          "output sample rate (Hz)": { value: s.outputSampleRate },
          channels: { value: s.channels },
          "chunk size (samples)": { value: s.chunkSizeSamples },
          "chunk size (ms)": { value: s.chunkSizeMs.toFixed(1) },
          "chunks / sec": { value: s.chunksThisSecond },
          "bytes / sec": { value: s.bytesThisSecond },
          "dropped silent chunks": { value: s.droppedSilentChunks },
          "total bytes sent": { value: s.totalBytesSent },
        });
        */
        statsRef.current.chunksThisSecond = 0;
        statsRef.current.bytesThisSecond = 0;
      }, 1000);

      console.log(
        `[GeminiLive] audio capture started — mono PCM16 @ ${SAMPLE_RATE} Hz, ` +
          `chunk ${CHUNK_SAMPLES} samples / ${((CHUNK_SAMPLES / SAMPLE_RATE) * 1000).toFixed(0)} ms`,
      );
    } catch (error) {
      console.error("[GeminiLive] audio capture setup failed:", error);
    }
  }

  function endUserTurn() {
    stopAudioCapture();
    if (sessionRef.current) {
      sessionRef.current.sendRealtimeInput({ activityEnd: {} });
      setCurrentTurn("gemini");
    }
  }

  function stopAudioCapture() {
    if (!isCapturingRef.current) {
      console.warn("[GeminiLive] stopAudioCapture() called but not capturing");
      return;
    }

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    if (workletBlobUrlRef.current) {
      URL.revokeObjectURL(workletBlobUrlRef.current);
      workletBlobUrlRef.current = null;
    }

    isCapturingRef.current = false;

    console.log(
      "[GeminiLive] audio capture stopped — total bytes sent:",
      statsRef.current.totalBytesSent,
    );

    statsRef.current = {
      ...statsRef.current,
      chunksThisSecond: 0,
      bytesThisSecond: 0,
      droppedSilentChunks: 0,
      totalBytesSent: 0,
    };
  }

  useEffect(() => {
    return () => {
      stopAudioCapture();
      sessionRef.current?.close();
      sessionRef.current = null;
    };
  }, []);

  return {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    stopAudioCapture,
    endUserTurn,
    isActive,
    currentTurn,
    getSession,
  };
};
