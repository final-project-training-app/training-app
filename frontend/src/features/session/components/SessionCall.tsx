import {
  CalendarDays,
  MessageSquareText,
  MicOff,
  PhoneOff,
  Settings,
  UserRound,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useState, type ReactNode } from "react";
import type { CoachCallSession, SessionPanel } from "../types";
import { SessionInfoPanel } from "./SessionInfoPanel";
import SettingsModalSheet from "../../HomePage/components/SettingsModalSheet";
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
  workoutName?: string;
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

const SHOW_DEV_DEBUG = false;

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getTrainerName(session: CoachCallSession) {
  return session.trainer?.name ?? "Tränaren";
}

function getTrainerImage(session: CoachCallSession) {
  return session.trainer?.imageCall ?? session.trainer?.imageStart ?? null;
}

function getWorkoutName(session: CoachCallSession, workoutName?: string) {
  return session.name ?? session.workoutName ?? workoutName ?? "Träningspass";
}

function ControlButton({
  label,
  children,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className="group flex flex-col items-center gap-2.5 text-center disabled:opacity-60"
    >
      <div
        className={[
          "flex h-[84px] w-[84px] items-center justify-center rounded-full transition group-active:scale-95",
          active ? "bg-[#5b3fd6] text-white" : "bg-[#f0e9ff] text-[#5b3fd6]",
        ].join(" ")}
      >
        {children}
      </div>

      <span
        className={[
          "text-[15px] font-bold leading-tight",
          active ? "text-[#100b2f]" : "text-[#221447]",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

export function SessionCall({
  session,
  workoutName,
  coachStatusLabel,
  elapsedSeconds,
  activePanel,
  debugEvents = [],
  getCurrentRms,
  onSpeaker,
  onTrainingSuite,
  onInfo,
  onClosePanel,
  onEnd,
}: SessionCallProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const trainerName = getTrainerName(session);
  const trainerImage = getTrainerImage(session);
  const displayWorkoutName = getWorkoutName(session, workoutName);

  return (
    <main className="relative h-dvh overflow-hidden [background:var(--brand-call-background)]">
      {import.meta.env.DEV && debugEvents.length > 0 ? (
        <div className="absolute left-3 top-3 z-20 max-h-52 w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-lg bg-black/75 p-3 font-mono text-[11px] leading-4 text-white shadow-lg">
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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f7f1ff_0%,#fffaff_58%,#fbf8ff_100%)]" />

      <div className="relative z-10 flex h-full w-full flex-col px-6 pb-7 pt-12">
        <section className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-[210px] w-[210px] items-center justify-center rounded-full bg-[#f0e9ff]">
            {trainerImage ? (
              <img
                src={trainerImage}
                alt={trainerName}
                className="h-[190px] w-[190px] rounded-full object-cover"
              />
            ) : (
              <div className="flex h-[190px] w-[190px] items-center justify-center rounded-full bg-[#eee7fb] text-5xl font-extrabold text-[#5b3fd6]">
                PT
              </div>
            )}
          </div>

          <h1 className="text-[36px] font-extrabold leading-none text-[#100b2f]">
            {trainerName}
          </h1>

          <p className="mt-2 text-[20px] font-bold leading-none text-[#5b3fd6]">
            {formatTime(elapsedSeconds)}
          </p>

          <p className="mt-3 max-w-[320px] text-[14px] font-semibold text-[#6f6a93]">
            {displayWorkoutName}
          </p>

          <p className="mt-1 max-w-[320px] text-[13px] font-semibold text-[#8a83aa]">
            {coachStatusLabel}
          </p>
        </section>

        <section className="mt-9 grid grid-cols-3 justify-items-center gap-x-3 gap-y-8">
          <ControlButton
            label={isMuted ? "Ljud av" : "Ljud på"}
            active={isMuted}
            onClick={() => setIsMuted((current) => !current)}
          >
            <MicOff size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton
            label="Inställningar"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton
            label="Högtalare"
            active={isSpeakerOn}
            onClick={() => setIsSpeakerOn((current) => !current)}
          >
            <Volume2 size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton label="Träningssvit" onClick={onTrainingSuite}>
            <CalendarDays size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton label="Min info" onClick={onInfo}>
            <UserRound size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton label="Instruktioner" onClick={onSpeaker}>
            <MessageSquareText size={36} strokeWidth={1.5} />
          </ControlButton>
        </section>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onEnd}
          className="mb-1 flex flex-col items-center gap-2.5 transition active:scale-95"
        >
          <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#ef4444] text-white">
            <PhoneOff size={42} strokeWidth={1.5} />
          </div>

          <span className="text-[17px] font-bold text-[#221447]">Lägg på</span>
        </button>
      </div>

      {activePanel !== "none" ? (
        <SessionInfoPanel
          session={session}
          panel={activePanel}
          onClose={onClosePanel}
        />
      ) : null}

      <SettingsModalSheet open={settingsOpen} setOpen={setSettingsOpen} />
    </main>
  );
}
