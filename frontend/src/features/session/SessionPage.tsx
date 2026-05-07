import { useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SessionCall } from "./components/SessionCall";
import { SessionLanding } from "./components/SessionLanding";
import { useCoachCallSession } from "./query";
import type { SessionAudioKind, SessionPanel, SessionScreen } from "./types";

export function SessionPage() {
  const { workoutId } = useParams({ from: "/session/$workoutId" });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useCoachCallSession(workoutId);

  const [screen, setScreen] = useState<SessionScreen>("landing");
  const [activePanel, setActivePanel] = useState<SessionPanel>("none");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  function getAudioUrl(kind: SessionAudioKind) {
    if (!session) return undefined;

    return kind === "guide" ? session.guideAudioUrl : session.exerciseAudioUrl;
  }

  async function playAudio(kind: SessionAudioKind) {
    const url = getAudioUrl(kind);
    if (!url) return;

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    audio.preload = "metadata";

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

    await audio.play();
  }

  async function handleStart() {
    if (!session) return;

    setElapsedSeconds(0);
    setDurationSeconds(0);
    setActivePanel("none");
    setScreen("call");

    await playAudio("exercise");
  }

  function handleEnd() {
    audioRef.current?.pause();
    setActivePanel("none");
    window.history.back();
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

  if (screen === "landing") {
    return <SessionLanding session={session} onStart={handleStart} />;
  }

  return (
    <SessionCall
      session={session}
      elapsedSeconds={elapsedSeconds}
      durationSeconds={durationSeconds}
      activePanel={activePanel}
      onSpeaker={() => togglePanel("exercise")}
      onExerciseAudio={() => playAudio("exercise")}
      onInfo={() => togglePanel("info")}
      onClosePanel={() => setActivePanel("none")}
      onEnd={handleEnd}
    />
  );
}
