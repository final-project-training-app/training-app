import {
  CalendarDays,
  MessageSquareText,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CoachCallSession, SessionPanel } from "../types";
import { SessionInfoPanel } from "./SessionInfoPanel";
import SettingsModalSheet from "../../HomePage/components/SettingsModalSheet";
import type { CoachSessionDebugEvent } from "../../ai-conversation";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className="mt-2">
      <div className="mb-0.5 flex justify-between font-sans text-[10px] text-white/60">
        <span>{t("sessionCall.micRms")}</span>
        <span ref={valRef}>0.000</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded bg-white/10">
        <div
          ref={barRef}
          className="h-full rounded bg-emerald-400 transition-none"
          style={{ width: "0%" }}
        />
        <div
          className="absolute top-0 h-full w-px bg-red-400"
          style={{ left: `${thresholdPct}%` }}
          title={`${t("sessionCall.interruptThresholdTitle")} ${INTERRUPT_THRESHOLD}`}
        />
      </div>
      <div className="mt-0.5 font-sans text-[9px] text-white/40">
        {t("sessionCall.interruptThreshold")} {INTERRUPT_THRESHOLD}
      </div>
    </div>
  );
}

type SessionCallProps = {
  session: CoachCallSession;
  workoutName?: string;
  coachStatusLabel: string;
  elapsedSeconds: number;
  activePanel: SessionPanel;
  debugEvents?: CoachSessionDebugEvent[];
  getCurrentRms?: () => number;
  showInstructionsVideo?: boolean;
  isAiSpeaking?: boolean;
  isUserTurn?: boolean;
  isLoading?: boolean;
  isEnding?: boolean;
  isMicrophoneMuted?: boolean;
  isSpeakerMuted?: boolean;
  onToggleMicrophoneMuted: () => void;
  onToggleSpeakerMuted: () => void;
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
  return session.trainer?.name?.trim() || "";
}

function getTrainerImage(session: CoachCallSession) {
  return (
    session.trainer?.imageCall ??
    session.trainer?.imageStart ??
    session.trainer?.imageSelect ??
    null
  );
}

function getWorkoutName(session: CoachCallSession, workoutName?: string) {
  return session.name ?? session.workoutName ?? workoutName ?? "";
}

function ControlButton({
  label,
  children,
  onClick,
  active = false,
  disabled = false,
  pulsing = false,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  pulsing?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className="group flex min-w-0 flex-col items-center gap-[clamp(0.35rem,0.95cqh,0.65rem)] text-center disabled:opacity-60"
    >
      <div className="relative">
        {pulsing && (
          <div className="call-pulse-ring" />
        )}
        <div
          className={[
            "flex h-[clamp(56px,8.5cqh,80px)] w-[clamp(56px,8.5cqh,80px)] items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(91,63,214,0.06)] transition group-active:scale-95 [&>svg]:h-[clamp(24px,3.45cqh,32px)] [&>svg]:w-[clamp(24px,3.45cqh,32px)]",
            active
              ? "bg-[#5b3fd6] text-white shadow-[0_10px_24px_rgba(91,63,214,0.22)]"
              : "bg-[#ece7f8] text-[#5b3fd6]",
          ].join(" ")}
        >
          {children}
        </div>
      </div>

      <span
        className={[
          "max-w-[6.6rem] text-[clamp(11px,1.5cqh,15px)] font-extrabold leading-tight",
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
  showInstructionsVideo = false,
  isAiSpeaking = false,
  isUserTurn = false,
  isLoading = false,
  isEnding = false,
  isMicrophoneMuted = false,
  isSpeakerMuted = false,
  onToggleMicrophoneMuted,
  onToggleSpeakerMuted,
  onSpeaker,
  onTrainingSuite,
  onInfo,
  onClosePanel,
  onEnd,
}: SessionCallProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const trainerName = getTrainerName(session);
  const trainerImage = getTrainerImage(session);
  const displayWorkoutName = getWorkoutName(session, workoutName);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isSpeakerMuted;
    if (showInstructionsVideo) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isSpeakerMuted, showInstructionsVideo]);

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#fbf8ff] text-[#221447]">
      {SHOW_DEV_DEBUG && import.meta.env.DEV && debugEvents.length > 0 ? (
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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f5efff_0%,#fffaff_46%,#f1ebfb_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(232,224,249,0.74))]" />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-[var(--stage-inline-pad)] pb-[var(--stage-safe-bottom)] pt-[var(--stage-safe-top)]">
        <section className="flex shrink-0 flex-col items-center text-center">
          <div className="mb-[clamp(0.45rem,1.8cqh,1.25rem)] relative h-[clamp(106px,19.5cqh,184px)] w-[clamp(106px,19.5cqh,184px)]">
            {isAiSpeaking && !isEnding && (
              <div className="call-pulse-ring" />
            )}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#eee8fb] shadow-[inset_0_0_0_1px_rgba(91,63,214,0.04)]">
              {trainerImage ? (
                <img
                  src={trainerImage}
                  alt={trainerName}
                  className="absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-1000"
                  style={{ opacity: showInstructionsVideo && session.instructionsVideo ? 0 : 1 }}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-[#e8e1f8] text-[#5b3fd6] transition-opacity duration-1000"
                  style={{ opacity: showInstructionsVideo && session.instructionsVideo ? 0 : 1 }}
                >
                  <UserRound size={56} strokeWidth={1.8} />
                </div>
              )}
              {session.instructionsVideo && (
                <video
                  ref={videoRef}
                  src={session.instructionsVideo}
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-1000"
                  style={{ opacity: showInstructionsVideo ? 1 : 0 }}
                />
              )}
              {isEnding && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#100b2f]/50">
                  <span className="text-[clamp(11px,1.5cqh,14px)] font-bold text-white">
                    {t("sessionCall.disconnecting")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-[clamp(25px,3.45cqh,34px)] font-extrabold leading-none text-[#100b2f]">
            {isLoading ? " " : trainerName || t("sessionCall.trainerMissing")}
          </h1>

          <span className="sr-only">
            Samtalstid {formatTime(elapsedSeconds)}
          </span>

          <p className="mt-[clamp(0.3rem,0.9cqh,0.7rem)] max-w-[320px] text-[clamp(11px,1.4cqh,14px)] font-bold leading-snug text-[#6f6a93]">
            {isLoading ? "" : displayWorkoutName || t("sessionCall.workoutMissing")}
          </p>

          <p className="mt-1 max-w-[320px] text-[clamp(10px,1.25cqh,13px)] font-bold text-[#8a83aa]">
            {coachStatusLabel}
          </p>
        </section>

        <section className="mx-auto mt-[clamp(0.85rem,3.3cqh,2.6rem)] grid w-full max-w-[var(--stage-control-max-width)] shrink-0 grid-cols-3 justify-items-center gap-x-[clamp(0.75rem,3.5cqw,1.35rem)] gap-y-[clamp(0.7rem,2.7cqh,2.05rem)]">
          <ControlButton
            label={
              isMicrophoneMuted
                ? t("sessionCall.soundOff")
                : t("sessionCall.soundOn")
            }
            active={!isMicrophoneMuted}
            pulsing={isUserTurn && !isEnding}
            disabled={isEnding}
            onClick={onToggleMicrophoneMuted}
          >
            {isMicrophoneMuted ? (
              <MicOff size={36} strokeWidth={1.5} />
            ) : (
              <Mic size={36} strokeWidth={1.5} />
            )}
          </ControlButton>

          <ControlButton
            label={t("sessionCall.controlbuttonLabelSettings")}
            disabled={isEnding}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton
            label={
              isSpeakerMuted
                ? t("sessionCall.soundOff")
                : t("sessionCall.soundOn")
            }
            active={!isSpeakerMuted}
            disabled={isEnding}
            onClick={onToggleSpeakerMuted}
          >
            {isSpeakerMuted ? (
              <VolumeX size={36} strokeWidth={1.5} />
            ) : (
              <Volume2 size={36} strokeWidth={1.5} />
            )}
          </ControlButton>

          <ControlButton
            label={t("sessionCall.controlbuttonLabelStreak")}
            disabled={isEnding}
            onClick={onTrainingSuite}
          >
            <CalendarDays size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton
            label={t("sessionCall.controlbuttonLabelMyInfo")}
            disabled={isEnding}
            onClick={onInfo}
          >
            <UserRound size={36} strokeWidth={1.5} />
          </ControlButton>

          <ControlButton
            label={t("sessionCall.controlbuttonLabelInstructions")}
            disabled={isEnding}
            onClick={onSpeaker}
          >
            <MessageSquareText size={36} strokeWidth={1.5} />
          </ControlButton>
        </section>

        <button
          type="button"
          onClick={onEnd}
          disabled={isEnding}
          className="mx-auto mt-auto flex w-full max-w-[var(--stage-control-max-width)] flex-col items-center gap-[clamp(0.35rem,1cqh,0.6rem)] pb-[clamp(0rem,0.8cqh,0.25rem)] transition active:scale-95 disabled:cursor-not-allowed"
        >
          <div className={[
            "flex h-[clamp(58px,8.8cqh,84px)] w-[clamp(58px,8.8cqh,84px)] items-center justify-center rounded-full text-white transition-colors duration-300 [&>svg]:h-[clamp(28px,3.9cqh,38px)] [&>svg]:w-[clamp(28px,3.9cqh,38px)]",
            isEnding
              ? "bg-[#c8c4d0]"
              : "bg-[#ef4444] shadow-[0_12px_26px_rgba(239,68,68,0.22)]",
          ].join(" ")}>
            <PhoneOff strokeWidth={1.75} />
          </div>

          <span className="text-[clamp(13px,1.6cqh,16px)] font-extrabold text-[#221447]">
            {t("sessionCall.controlbuttonLabelEndCall")}
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

      <SettingsModalSheet open={settingsOpen} setOpen={setSettingsOpen} />
    </main>
  );
}
