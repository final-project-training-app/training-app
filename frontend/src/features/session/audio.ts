let sessionAudio: HTMLAudioElement | null = null;
const silentAudio =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQQAAAAAAA==";

type PlaySessionAudioOptions = {
  onEnded?: () => void;
};

function createSessionAudio() {
  if (!sessionAudio) {
    sessionAudio = new Audio();
    sessionAudio.setAttribute("playsinline", "true");
  }

  return sessionAudio;
}

export async function startSessionAudio(
  url: string,
  options: PlaySessionAudioOptions = {},
) {
  const audio = createSessionAudio();

  if (audio.src !== url) {
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
  }

  audio.preload = "metadata";
  audio.onended = options.onEnded ?? null;
  await audio.play();

  return audio;
}

export async function primeSessionAudio() {
  const audio = createSessionAudio();

  if (audio.src) {
    return;
  }

  audio.muted = true;
  audio.src = silentAudio;
  audio.currentTime = 0;

  try {
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
  } finally {
    audio.muted = false;
  }
}

export function stopSessionAudio() {
  if (!sessionAudio) {
    return;
  }

  sessionAudio.pause();
  sessionAudio.onended = null;
}
