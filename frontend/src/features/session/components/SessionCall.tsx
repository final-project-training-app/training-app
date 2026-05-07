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
  onExerciseAudio: () => void;
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
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4efff] text-[#5340d3]">
        {children}
      </div>
      <span className="text-base font-medium text-slate-900">{label}</span>
    </button>
  );
}

export function SessionCall({
  session,
  elapsedSeconds,
  durationSeconds,
  activePanel,
  onSpeaker,
  onExerciseAudio,
  onInfo,
  onClosePanel,
  onEnd,
}: SessionCallProps) {
  return (
    <main className="relative h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,#f7f2ff_0%,#ffffff_58%)]">
      <div className="mx-auto flex h-full w-full max-w-107.5 flex-col justify-between px-5 py-6">
        <div>
          <div className="mb-7 flex justify-center">
            {session.coachImageUrl ? (
              <img
                src={session.coachImageUrl}
                alt={session.coachName}
                className="h-56 w-56 rounded-full bg-[#f4efff] object-contain"
              />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-full bg-[#f4efff] text-6xl font-extrabold text-[#5340d3]">
                PT
              </div>
            )}
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold text-slate-950">
              {session.coachName}
            </h1>
            <p className="mt-2 text-3xl font-bold text-[#5340d3]">
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

            <ControlButton label="träningssvit" onClick={onExerciseAudio}>
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
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white">
            <PhoneOff size={40} />
          </div>
          <span className="text-xl font-medium text-slate-900">avsluta</span>
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
