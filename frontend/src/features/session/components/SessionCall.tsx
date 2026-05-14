import {
  CalendarDays,
  Grip,
  MicOff,
  PhoneOff,
  UserRound,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { CoachCallSession, SessionPanel } from "../types";
import { SessionInfoPanel } from "./SessionInfoPanel";
import type { CoachSessionDebugEvent } from "../coachSessionHelpers";

const INTERRUPT_THRESHOLD = 0.25;
const METER_MAX = 0.5;

function VolumeMeter({ getCurrentRms }: { getCurrentRms: () => number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function tick() {
      const rms = getCurrentRms();
      if (barRef.current)
        barRef.current.style.width = `${Math.min(rms / METER_MAX, 1) * 100}%`;
      if (valRef.current) valRef.current.textContent = rms.toFixed(3);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getCurrentRms]);

  const thresholdPct = (INTERRUPT_THRESHOLD / METER_MAX) * 100;

  return (
    <div className="mt-2">
      <div className="mb-0.5 flex justify-between font-sans text-[10px] text-white/60">
        <span>mic rms</span>
        <span ref={valRef}>0.000</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded bg-white/10">
        <div ref={barRef} className="h-full rounded bg-emerald-400 transition-none" style={{ width: "0%" }} />
        <div
          className="absolute top-0 h-full w-px bg-red-400"
          style={{ left: `${thresholdPct}%` }}
          title={`interrupt threshold (${INTERRUPT_THRESHOLD})`}
        />
      </div>
      <div className="mt-0.5 font-sans text-[9px] text-white/40">
        röd linje = interrupt threshold ({INTERRUPT_THRESHOLD})
      </div>
    </div>
  );
}

type SessionCallProps = {
  session: CoachCallSession;
  workoutName: string;
  coachStep: string;
  coachStatusLabel: string;
  elapsedSeconds: number;
  durationSeconds: number;
  activePanel: SessionPanel;
  debugEvents?: CoachSessionDebugEvent[];
  getCurrentRms?: () => number;
  onSpeaker: () => void;
  onTrainingSuite: () => void;
  onInfo: () => void;
  onClosePanel: () => void;
  onEnd: () => void;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function ControlButton({
  label,
  children,
  onClick,
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 text-center disabled:opacity-45"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--brand-control) text-(--brand-primary)">
        {children}
      </div>
      <span className="text-base font-medium text-(--brand-ink)">{label}</span>
    </button>
  );
}

export function SessionCall({
  session,
  workoutName,
  coachStep,
  coachStatusLabel,
  elapsedSeconds,
  durationSeconds,
  activePanel,
  debugEvents = [],
  getCurrentRms,
  onSpeaker,
  onTrainingSuite,
  onInfo,
  onClosePanel,
  onEnd,
}: SessionCallProps) {
  return (
    <main className="relative h-dvh overflow-hidden [background:var(--brand-call-background)]">
      {import.meta.env.DEV ? (
        <div className="absolute left-3 top-3 z-20 w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-lg bg-black/75 p-3 font-mono text-[11px] leading-4 text-white shadow-lg">
          <div className="mb-1 font-sans text-xs font-bold">Dev debug</div>
          {debugEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="truncate">
              <span className="text-emerald-300">+{event.elapsedMs}ms</span>{" "}
              <span>{event.label}</span>
              {event.detail ? (
                <span className="text-white/70"> - {event.detail}</span>
              ) : null}
            </div>
          ))}
          {getCurrentRms ? <VolumeMeter getCurrentRms={getCurrentRms} /> : null}
        </div>
      ) : null}

      <div className="mx-auto flex h-full w-full max-w-107.5 flex-col justify-between px-5 py-6">
        <div>
          <div className="mb-7 flex justify-center">
            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-(--brand-control) text-6xl font-extrabold text-(--brand-primary)">
              PT
            </div>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold text-(--brand-ink)">
              {workoutName}
            </h1>
            <p className="mt-2 text-3xl font-bold text-(--brand-primary)">
              {formatTime(elapsedSeconds)}
            </p>
            <p className="mt-3 text-base font-bold text-(--brand-muted)">
              {coachStatusLabel}
            </p>
          </div>

          <div className="grid grid-cols-3 justify-items-center gap-x-4 gap-y-8">
            <ControlButton label={coachStep === "live_intro" ? "lyssnar" : "mic"}>
              <MicOff size={34} />
            </ControlButton>

            <ControlButton label="knappsats">
              <Grip size={34} />
            </ControlButton>

            <ControlButton label="högtalare" onClick={onSpeaker}>
              <Volume2 size={34} />
            </ControlButton>

            <ControlButton label="tid">
              <span className="text-3xl font-extrabold">
                {durationSeconds || session.durationSeconds}
              </span>
            </ControlButton>

            <ControlButton label="träningssvit" onClick={onTrainingSuite}>
              <CalendarDays size={34} />
            </ControlButton>

            <ControlButton label="min info" onClick={onInfo}>
              <UserRound size={34} />
            </ControlButton>
          </div>
        </div>

        <button
          type="button"
          onClick={onEnd}
          className="mb-2 flex flex-col items-center gap-3"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-(--brand-danger) text-(--brand-on-danger)">
            <PhoneOff size={40} />
          </div>
          <span className="text-xl font-medium text-(--brand-ink)">
            avsluta
          </span>
        </button>
      </div>

      {activePanel !== "none" ? (
        <SessionInfoPanel
          session={session}
          panel={activePanel}
          onClose={onClosePanel}
        />
      ) : null}
    </main>
  );
}
