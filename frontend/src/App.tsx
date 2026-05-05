import { useRef, useState } from 'react'

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [status, setStatus] = useState<number | null>(null)

  async function handlePlay() {
    const response = await fetch('/api/audio-url')
    setStatus(response.status)

    const url = await response.text()

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    audioRef.current.src = url
    await audioRef.current.play()
    setPlaying(true)

    audioRef.current.onended = () => setPlaying(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center  text-white">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handlePlay}
          className="rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-medium text-zinc-950"
        >
          {playing ? 'Spelar...' : 'Spela ljud'}
        </button>

        {status && (
          <p className="text-sm text-black">
            API status: {status}
          </p>
        )}
      </div>
    </main>
  )
}