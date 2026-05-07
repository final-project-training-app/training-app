import { useEffect, useRef, useState } from "react";
import {
  GoogleGenAI,
  MediaResolution,
  Modality,
  type LiveServerMessage,
  type Session,
} from "@google/genai";

interface UseGeminiLiveProps {
  token: string;
  onAudioData?: (data: ArrayBuffer) => void;
  onMessage?: (message: LiveServerMessage) => void;
}

export const useGeminiLive = ({
  token,
  onAudioData,
  onMessage,
}: UseGeminiLiveProps) => {
  const [isActive, setIsActive] = useState(false);
  const sessionRef = useRef<Session | null>(null);

  const tokenRef = useRef(token);
  const onAudioRef = useRef(onAudioData);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    tokenRef.current = token;
    onAudioRef.current = onAudioData;
    onMessageRef.current = onMessage;
  }, [token, onAudioData, onMessage]);

  async function geminiConnect() {
    console.log("[GeminiLive] connect pressed");

    if (!tokenRef.current) {
      console.error("[GeminiLive] missing token");
      return;
    }

    if (sessionRef.current) {
      console.log("[GeminiLive] already connected");
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: tokenRef.current,
        httpOptions: {
          apiVersion: "v1alpha",
        },
      });

      const session = await ai.live.connect({
        model: "models/gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Zephyr",
              },
            },
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

            const part = message.serverContent?.modelTurn?.parts?.[0];
            if (part?.inlineData?.data) {
              const bytes = Uint8Array.from(atob(part.inlineData.data), (c) =>
                c.charCodeAt(0),
              );
              onAudioRef.current?.(bytes.buffer);
            }

            if (part?.text) {
              console.log("[GeminiLive] text:", part.text);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("[GeminiLive] error:", e.message);
          },
          onclose: (e: CloseEvent) => {
            console.log("[GeminiLive] closed:", e.reason);
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
    sessionRef.current?.close();
    sessionRef.current = null;
    setIsActive(false);
  }

  function getSession() {
    return sessionRef.current;
  }

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  async function startAudioCapture() {
    try {
      console.log("[GeminiLive] requesting microphone access");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      const workletCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0];
            if (input.length > 0) {
              const audioData = input[0];
              this.port.postMessage({ audioData: Array.from(audioData) });
            }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;

      const blob = new Blob([workletCode], { type: "application/javascript" });
      const workletUrl = URL.createObjectURL(blob);

      await audioContext.audioWorklet.addModule(workletUrl);
      const workletNode = new AudioWorkletNode(audioContext, "audio-processor");
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        const audioData = event.data.audioData;
        const base64Audio = btoa(
          String.fromCharCode(
            ...new Uint8Array(new Float32Array(audioData).buffer),
          ),
        );

        sessionRef.current?.sendClientContent({
          turns: [base64Audio],
        });
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);
      console.log("[GeminiLive] audio capture started with AudioWorklet");
    } catch (error) {
      console.error("[GeminiLive] audio capture setup failed:", error);
    }
  }

  function stopAudioCapture() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    workletNodeRef.current?.disconnect();
    audioContextRef.current?.close();
    console.log("[GeminiLive] audio capture stopped");
  }

  useEffect(() => {
    return () => {
      sessionRef.current?.close();
      sessionRef.current = null;
    };
  }, []);

  return {
    geminiConnect,
    geminiDisconnect,
    startAudioCapture,
    stopAudioCapture,
    isActive,
    getSession,
  };
};
