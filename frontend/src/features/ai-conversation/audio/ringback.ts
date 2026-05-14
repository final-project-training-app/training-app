let ringback: HTMLAudioElement | null = null;
let gymAmbience: HTMLAudioElement | null = null;

const disconnectClick = new Audio("/phone-sounds/phone_click.mp3");
disconnectClick.preload = "auto";

function playDisconnectClick() {
  disconnectClick.currentTime = 0;
  void disconnectClick.play().catch(() => {});
}

export function startRingback() {
  if (ringback) return;
  ringback = new Audio("/phone-sounds/ringback_tone.mp3");
  ringback.loop = true;
  void ringback.play().catch(() => {});
}

export function stopRingback() {
  if (!ringback) return;
  ringback.pause();
  ringback = null;

  const click = new Audio("/phone-sounds/phone_click.mp3");
  void click.play().catch(() => {});
}

export function startGymAmbience() {
  if (gymAmbience) return;
  gymAmbience = new Audio("/phone-sounds/gym-ambience-loop.mp3");
  gymAmbience.loop = true;
  gymAmbience.volume = 0.7;
  void gymAmbience.play().catch(() => {});
}

export function stopGymAmbience() {
  if (!gymAmbience) return;
  playDisconnectClick();
  gymAmbience.pause();
  gymAmbience = null;
}
