import { useRef, useState } from 'react';

export function useVoicePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const play = (id: string, url?: string | null) => {
    if (!url) return;
    // Stop existing
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current.src = '';
    }

    setLoadingId(id);
    const audio = new Audio(url);
    audioRef.current = audio;

    const cleanUp = () => {
      audio.oncanplaythrough = null;
      audio.onended = null;
      audio.onerror = null;
    };

    audio.oncanplaythrough = () => {
      setLoadingId(null);
      audio.play().catch(() => {
        setLoadingId(null);
        setPlayingId(null);
      });
      setPlayingId(id);
    };

    audio.onended = () => {
      setPlayingId(null);
      cleanUp();
    };

    audio.onerror = () => {
      setLoadingId(null);
      setPlayingId(null);
      cleanUp();
    };
  };

  const stop = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingId(null);
    setLoadingId(null);
  };

  return { play, stop, loadingId, playingId } as const;
}
