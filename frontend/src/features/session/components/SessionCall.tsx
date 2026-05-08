import {
  CalendarDays,
  Grip,
  MicOff,
  PhoneOff,
  UserRound,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";
import type { CoachCallSession, SessionPanel } from "../types";
import { SessionInfoPanel } from "./SessionInfoPanel";

type SessionCallProps = {
  session: CoachCallSession;
  elapsedSeconds: number;
  durationSeconds: number;
  activePanel: SessionPanel;
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
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 text-center"
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
  elapsedSeconds,
  durationSeconds,
  activePanel,
  onSpeaker,
  onTrainingSuite,
  onInfo,
  onClosePanel,
  onEnd,
}: SessionCallProps) {
  return (
    <main className="relative h-dvh overflow-hidden [background:var(--brand-call-background)]">
      <div className="mx-auto flex h-full w-full max-w-107.5 flex-col justify-between px-5 py-6">
        <div>
          <div className="mb-7 flex justify-center">
            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-(--brand-control) text-6xl font-extrabold text-(--brand-primary)">
              PT
            </div>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold text-(--brand-ink)">
              {session.workoutName}
            </h1>
            <p className="mt-2 text-3xl font-bold text-(--brand-primary)">
              {formatTime(elapsedSeconds)}
            </p>
          </div>

          <div className="grid grid-cols-3 justify-items-center gap-x-4 gap-y-8">
            <ControlButton label="textläge">
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
