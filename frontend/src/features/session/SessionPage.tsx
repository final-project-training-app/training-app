import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { startSessionAudio, stopSessionAudio } from "./audio";
import { SessionCall } from "./components/SessionCall";
import { useCoachCallSession } from "./query";
import type { SessionPanel } from "./types";

export function SessionPage() {
  const { workoutId } = useParams({ from: "/session/$workoutId" });
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedAudioRef = useRef(false);

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useCoachCallSession(workoutId);

  const [activePanel, setActivePanel] = useState<SessionPanel>("none");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  function bindAudioState(audio: HTMLAudioElement) {
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDurationSeconds(Math.round(audio.duration));
      }
    };

    audio.ontimeupdate = () => {
      setElapsedSeconds(Math.floor(audio.currentTime));
    };

    audio.onended = () => {
      setElapsedSeconds(0);
    };

    if (Number.isFinite(audio.duration)) {
      setDurationSeconds(Math.round(audio.duration));
    }

    setElapsedSeconds(Math.floor(audio.currentTime));
  }

  async function playCallAudio(restart = false) {
    if (!session?.workoutAudioUrl) {
      return;
    }

    const audio =
      restart || !audioRef.current
        ? await startSessionAudio(session.workoutAudioUrl)
        : audioRef.current;

    audioRef.current = audio;

    if (restart) {
      audio.currentTime = 0;
    }

    bindAudioState(audio);

    if (!audio.paused) {
      return;
    }

    void audio.play().catch(() => {
      // Browsers may block autoplay; in that case the call screen still opens.
    });
  }

  useEffect(() => {
    if (!session?.workoutAudioUrl || hasStartedAudioRef.current) {
      return;
    }

    hasStartedAudioRef.current = true;

    void playCallAudio();

    return () => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onended = null;
    };
  }, [session?.workoutAudioUrl]);

  function handleEnd() {
    stopSessionAudio();
    setActivePanel("none");
    setElapsedSeconds(0);
    hasStartedAudioRef.current = false;
    void navigate({ to: "/" });
  }

  function togglePanel(panel: Exclude<SessionPanel, "none">) {
    setActivePanel((current) => (current === panel ? "none" : panel));
  }

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        Laddar session...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-dvh items-center justify-center p-8 text-center">
        {error instanceof Error ? error.message : "Något gick fel."}
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SessionCall
      session={session}
      elapsedSeconds={elapsedSeconds}
      durationSeconds={durationSeconds}
      activePanel={activePanel}
      onSpeaker={() => togglePanel("exercise")}
      onTrainingSuite={() => togglePanel("suite")}
      onInfo={() => togglePanel("info")}
      onClosePanel={() => setActivePanel("none")}
      onEnd={handleEnd}
    />
  );
}
