import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { SessionAudioButton } from "../features/session/components/SessionAudioButton";
import { SessionHeader } from "../features/session/components/SessionHeader";
import { SessionImage } from "../features/session/components/SessionImage";
import { SessionInstruction } from "../features/session/components/SessionInstruction";
import { SessionTimer } from "../features/session/components/SessionTimer";
import type { SessionExercise } from "../features/session/types";

const exercise: SessionExercise = {
  id: "shoulder-rolls",
  title: "Rulla axlarna",
  durationSeconds: 25,
  imageUrl:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  audioUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  instruction:
    "Lyft axlarna långsamt upp mot öronen och rulla sedan bakåt och nedåt.",
};

function SessionPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handlePlayAudio() {
    if (!exercise.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = exercise.audioUrl;
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
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

export const Route = createFileRoute("/session")({
  component: SessionPage,
});
