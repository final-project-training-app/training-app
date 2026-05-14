let sessionAudio: HTMLAudioElement | null = null;
type CachedAudio = {
  objectUrl?: string;
  promise?: Promise<void>;
};

const preloadedAudio = new Map<string, CachedAudio>();
const silentAudio =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQQAAAAAAA==";

type PlaySessionAudioOptions = {
  onEnded?: () => void;
};

function createSessionAudio() {
  if (!sessionAudio) {
    sessionAudio = new Audio();
    sessionAudio.crossOrigin = "anonymous";
    sessionAudio.setAttribute("playsinline", "true");
  }

  return sessionAudio;
}

export function preloadSessionAudio(url?: string | null) {
  if (!url || preloadedAudio.has(url)) {
    return;
  }

  const startedAt = performance.now();
  console.debug("[SessionAudio] Preload start", { url });
  const cached: CachedAudio = {};
  cached.promise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Audio preload failed: ${response.status}`);
      }

      return response.blob();
    })
    .then((blob) => {
      cached.objectUrl = URL.createObjectURL(blob);
      console.debug("[SessionAudio] Preloaded audio", {
        url,
        bytes: blob.size,
        ms: Math.round(performance.now() - startedAt),
      });
    })
    .catch((error) => {
      preloadedAudio.delete(url);
      console.warn("[SessionAudio] Audio preload failed", { url, error });
    });

  preloadedAudio.set(url, cached);
}

export async function startSessionAudio(
  url: string,
  options: PlaySessionAudioOptions = {},
) {
  const audio = createSessionAudio();
  const cachedAudio = preloadedAudio.get(url);
  if (cachedAudio?.promise && !cachedAudio.objectUrl) {
    await Promise.race([
      cachedAudio.promise,
      new Promise((resolve) => window.setTimeout(resolve, 350)),
    ]);
  }

  const cachedUrl = cachedAudio?.objectUrl;
  const playableUrl = cachedUrl ?? url;
  const startedAt = performance.now();

  console.debug("[SessionAudio] Play requested", {
    url,
    cached: Boolean(cachedUrl),
    readyState: audio.readyState,
    networkState: audio.networkState,
  });

  if (audio.src !== playableUrl) {
    audio.pause();
    audio.loop = false;
    audio.muted = false;

    audio.src = playableUrl;
    audio.currentTime = 0;
    audio.load();
  }

  audio.preload = "auto";
  audio.onended = options.onEnded ?? null;

  try {
    await audio.play();
    console.debug("[SessionAudio] Play started", {
      url,
      cached: Boolean(cachedUrl),
      ms: Math.round(performance.now() - startedAt),
      readyState: audio.readyState,
      networkState: audio.networkState,
    });
  } catch (error) {
    console.error("[SessionAudio] Failed to play audio", {
      url,
      cached: Boolean(cachedUrl),
      error,
      networkState: audio.networkState,
      readyState: audio.readyState,
      paused: audio.paused,
    });
    throw error;
  }

  return audio;
}

export async function primeSessionAudio() {
  const audio = createSessionAudio();

  if (audio.src === silentAudio && !audio.paused) {
    return;
  }

  audio.loop = true;
  audio.muted = true;
  audio.preload = "auto";
  audio.src = silentAudio;
  audio.currentTime = 0;

  try {
    await audio.play();
  } catch (error) {
    console.warn("[SessionAudio] Audio unlock failed", error);
  }
}

export function stopSessionAudio() {
  if (!sessionAudio) {
    return;
  }

  sessionAudio.pause();
  sessionAudio.loop = false;
  sessionAudio.muted = false;
  sessionAudio.onended = null;
}
