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

  const {
    data: exercise,
    isLoading,
    isError,
    error,
  } = useSessionExercise(workoutId);

  async function handlePlayAudio() {
    if (!exercise?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = exercise.audioUrl;
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f6ff] px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center text-slate-900 shadow-sm">
          Laddar övning...
        </div>
      </main>
    );
  }

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "Något gick fel när övningen skulle hämtas.";

    return (
      <main className="min-h-screen bg-[#f8f6ff] px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center shadow-sm ring-1 ring-red-200">
          <h1 className="text-2xl font-bold text-slate-950">
            Kunde inte ladda övningen
          </h1>
          <p className="mt-3 text-lg text-slate-700">{message}</p>
        </div>
      </main>
    );
  }

  if (!exercise) {
    return null;
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
