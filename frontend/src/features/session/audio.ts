let sessionAudio: HTMLAudioElement | null = null;

function createSessionAudio() {
  if (!sessionAudio) {
    sessionAudio = new Audio();
    sessionAudio.setAttribute("playsinline", "true");
  }

  return sessionAudio;
}

export function getSessionAudio() {
  return createSessionAudio();
}

export async function startSessionAudio(url: string) {
  const audio = createSessionAudio();

  if (audio.src !== url) {
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
  }

  audio.preload = "metadata";
  await audio.play();

  return audio;
}

export function stopSessionAudio() {
  sessionAudio?.pause();
}
