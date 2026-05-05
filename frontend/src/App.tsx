import { useRef, useState } from "react";

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  async function handlePlay() {
    const url = await fetch("/api/audio-url").then((res) => res.text());

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = url;
    await audioRef.current.play();
    setPlaying(true);

    audioRef.current.onended = () => setPlaying(false);
  }

  async function handlePing() {
    const response = await fetch("/api/hi");
    setStatus(response.status);
  }

  return (
    <main className="flex min-h-screen items-center justify-center  text-white gap-2">
      <button
        onClick={handlePlay}
        className="rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-medium text-zinc-950"
      >
        {playing ? "Spelar..." : "Spela ljud"}
      </button>
      <button
        onClick={handlePing}
        className="rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-medium text-zinc-950"
      >
        Test API:
        {status && (
          <p className="text-sm text-zinc-300">API status: {status}</p>
        )}
      </button>
    </main>
  );
}
