import {
  getSharedAudioContext,
  resumeSharedAudioContext,
} from "./sharedAudioContext";

let ringback: HTMLAudioElement | null = null;
let callAudioMuted = false;

const disconnectClick = new Audio("/phone-sounds/phone_click.mp3");
disconnectClick.preload = "auto";
disconnectClick.muted = callAudioMuted;

function playDisconnectClick() {
  disconnectClick.currentTime = 0;
  disconnectClick.muted = callAudioMuted;
  void disconnectClick.play().catch(() => {});
}

export function startRingback() {
  if (ringback) return;
  ringback = new Audio("/phone-sounds/ringback_tone.mp3");
  ringback.loop = true;
  ringback.muted = callAudioMuted;
  void ringback.play().catch(() => {});
}

export function stopRingback() {
  if (!ringback) return;
  ringback.pause();
  ringback = null;

  const click = new Audio("/phone-sounds/phone_click.mp3");
  click.muted = callAudioMuted;
  void click.play().catch(() => {});
}

let gymAmbienceBuffer: AudioBuffer | null = null;
let gymAmbienceSource: AudioBufferSourceNode | null = null;
let gymAmbienceGain: GainNode | null = null;

export async function startGymAmbience() {
  if (gymAmbienceSource) return;
  const ctx = getSharedAudioContext();
  await resumeSharedAudioContext();

  if (!gymAmbienceBuffer) {
    const response = await fetch("/phone-sounds/gym-ambience-loop.mp3");
    const ab = await response.arrayBuffer();
    gymAmbienceBuffer = await ctx.decodeAudioData(ab);
  }

  const gain = ctx.createGain();
  gain.gain.value = callAudioMuted ? 0 : 0.7;
  gain.connect(ctx.destination);

  const source = ctx.createBufferSource();
  source.buffer = gymAmbienceBuffer;
  source.loop = true;
  source.connect(gain);
  source.start();

  gymAmbienceSource = source;
  gymAmbienceGain = gain;
}

export function stopGymAmbience() {
  if (!gymAmbienceSource) return;
  playDisconnectClick();
  gymAmbienceSource.stop();
  gymAmbienceSource = null;
  gymAmbienceGain?.disconnect();
  gymAmbienceGain = null;
}

export function setCallAudioMuted(muted: boolean) {
  callAudioMuted = muted;
  disconnectClick.muted = muted;
  if (ringback) {
    ringback.muted = muted;
  }
  if (gymAmbienceGain) {
    gymAmbienceGain.gain.value = muted ? 0 : 0.7;
  }
}
