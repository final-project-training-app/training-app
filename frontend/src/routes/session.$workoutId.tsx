import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WorkoutSessionView } from "../features/session/components/WorkoutSessionView";
import { useWorkoutSession } from "../features/session/query";

function SessionPage() {
  const { workoutId } = Route.useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useWorkoutSession(workoutId);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!session?.audioUrl) {
      return;
    }

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    audio.src = session.audioUrl;
    audio.preload = "metadata";

    const handleLoadedMetadata = () => {
      if (!Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        setDurationSeconds(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setElapsedSeconds(Math.floor(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setElapsedSeconds(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [session?.audioUrl]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  async function handleStartCall() {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    setIsPlaying(true);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        Laddar session...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        {error instanceof Error ? error.message : "Något gick fel."}
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <WorkoutSessionView
      session={session}
      elapsedSeconds={elapsedSeconds}
      durationSeconds={durationSeconds}
      isPlaying={isPlaying}
      onStartCall={handleStartCall}
    />
  );
}

export const Route = createFileRoute("/session/$workoutId")({
  component: SessionPage,
});
