import { useRef, useState } from "react";

//const FALLBACK_AUDIO_URL = "https://samplelib.com/lib/preview/mp3/sample-3s.mp3";

async function getAudioUrl() {
  //return FALLBACK_AUDIO_URL;
  const data = await fetch("/api/hi").then((res) => res.json());
  return data.message;
}

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  async function handlePlay() {
    
    const url = await getAudioUrl()
    console.log(url)

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlaying(false);
    }

    audioRef.current.src = url;
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    setPlaying(true);
  }

  async function handlePing() {
    const response = await fetch("/api/hi");
    setStatus(response.status);
  }

  return (
    <main className="flex min-h-screen items-center justify-center  text-white">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handlePlay}
          className="rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-medium text-zinc-950"
        >
          {playing ? "Spelar..." : "Spela ljud"}
        </button>
        <button
          onClick={handlePing}
          className="rounded-2xl border border-zinc-700 px-6 py-3 text-black"
        >
          Klicka:{" "}
          {status && <p className="text-sm text-black">API status: {status}</p>}
        </button>
      </div>
    </main>
  );
}
