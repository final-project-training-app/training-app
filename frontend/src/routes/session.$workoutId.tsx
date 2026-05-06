import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { SessionAudioButton } from "../features/session/components/SessionAudioButton";
import { SessionHeader } from "../features/session/components/SessionHeader";
import { SessionImage } from "../features/session/components/SessionImage";
import { SessionInstruction } from "../features/session/components/SessionInstruction";
import { SessionTimer } from "../features/session/components/SessionTimer";
import { useSessionExercise } from "../features/session/query";

function SessionPage() {
  const { workoutId } = Route.useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: exercise, isLoading } = useSessionExercise(workoutId);

  async function handlePlayAudio() {
    if (!exercise?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = exercise.audioUrl;
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
  }

  if (isLoading || !exercise) {
    return (
      <main className="min-h-screen bg-[#f8f6ff] px-4 py-6">
        <div className="mx-auto max-w-3xl text-center text-slate-900">
          Laddar...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6ff] px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <SessionHeader title={exercise.title} />
        <SessionImage title={exercise.title} imageUrl={exercise.imageUrl} />
        <SessionAudioButton label="Spela ljud" onClick={handlePlayAudio} />
        <SessionInstruction instruction={exercise.instruction} />
        <SessionTimer durationSeconds={exercise.durationSeconds} />
      </div>
    </main>
  );
}

export const Route = createFileRoute("/session/$workoutId")({
  component: SessionPage,
});