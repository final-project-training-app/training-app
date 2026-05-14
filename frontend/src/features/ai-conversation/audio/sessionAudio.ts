import {
  getSharedAudioContext,
  resumeSharedAudioContext,
} from "./sharedAudioContext";

type CachedAudio = {
  arrayBuffer?: ArrayBuffer;
  audioBuffer?: AudioBuffer;
  promise?: Promise<void>;
};

const preloadedAudio = new Map<string, CachedAudio>();

type PlaySessionAudioOptions = {
  onEnded?: () => void;
};

let currentSource: AudioBufferSourceNode | null = null;

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
      return response.arrayBuffer();
    })
    .then((ab) => {
      cached.arrayBuffer = ab;
      console.debug("[SessionAudio] Preloaded audio", {
        url,
        bytes: ab.byteLength,
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
  stopSessionAudio();

  const cachedAudio = preloadedAudio.get(url);
  if (cachedAudio?.promise && !cachedAudio.arrayBuffer) {
    await Promise.race([
      cachedAudio.promise,
      new Promise((resolve) => window.setTimeout(resolve, 350)),
    ]);
  }

  const ctx = getSharedAudioContext();
  await resumeSharedAudioContext();

  if (cachedAudio && !cachedAudio.audioBuffer && cachedAudio.arrayBuffer) {
    cachedAudio.audioBuffer = await ctx.decodeAudioData(
      cachedAudio.arrayBuffer,
    );
  }

  let audioBuffer = cachedAudio?.audioBuffer;
  if (!audioBuffer) {
    const ab = await fetch(url).then((r) => r.arrayBuffer());
    audioBuffer = await ctx.decodeAudioData(ab);
  }

  console.debug("[SessionAudio] Play started", { url });

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.onended = options.onEnded ?? null;
  source.connect(ctx.destination);
  source.start();
  currentSource = source;
}

export async function primeSessionAudio() {
  await resumeSharedAudioContext();
  const ctx = getSharedAudioContext();
  const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start();
}

export function stopSessionAudio() {
  if (!currentSource) return;
  currentSource.onended = null;
  try {
    currentSource.stop();
  } catch {}
  currentSource = null;
}
