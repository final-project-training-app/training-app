let ringback: HTMLAudioElement | null = null;

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
