import { useState } from "react";
import SettingsModalSheet from "../../HomePage/components/SettingsModalSheet";
import type { CoachCallSession, SessionPanel } from "../types";
import type { CoachSessionDebugEvent } from "../../ai-conversation";
import ControlsGrid from "./ControlsGrid";
import DevDebugPanel from "./DevDebugPanel";
import EndCallButton from "./EndCallButton";
import SessionHeader from "./SessionHeader";
import { SessionInfoPanel } from "./SessionInfoPanel";

type SessionCallProps = {
  session: CoachCallSession;
  workoutName?: string;
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

export function SessionCall(props: SessionCallProps) {
  const {
    session,
    workoutName,
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
  } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAvatarClicked, setIsAvatarClicked] = useState(false);

  const trainerName = getTrainerName(session);
  const trainerImage = getTrainerImage(session);
  const displayWorkoutName = getWorkoutName(session, workoutName);

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#fbf8ff] text-[#221447]">
      <DevDebugPanel
        show={SHOW_DEV_DEBUG && import.meta.env.DEV}
        debugEvents={debugEvents}
        getCurrentRms={getCurrentRms}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f5efff_0%,#fffaff_46%,#f1ebfb_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(232,224,249,0.74))]" />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-[var(--stage-inline-pad)] pb-[var(--stage-safe-bottom)] pt-[var(--stage-safe-top)]">
        <SessionHeader
          session={session}
          trainerName={trainerName}
          trainerImage={trainerImage}
          displayWorkoutName={displayWorkoutName}
          isLoading={isLoading}
          elapsedSeconds={elapsedSeconds}
          showInstructionsVideo={showInstructionsVideo}
          isAiSpeaking={isAiSpeaking}
          isEnding={isEnding}
          isSpeakerMuted={isSpeakerMuted}
          isAvatarClicked={isAvatarClicked}
          onAvatarClick={() => setIsAvatarClicked((prev) => !prev)}
          formatTime={formatTime}
        />

        {!isAvatarClicked ? (
          <ControlsGrid
            isMicrophoneMuted={isMicrophoneMuted}
            isSpeakerMuted={isSpeakerMuted}
            isEnding={isEnding}
            isUserTurn={isUserTurn}
            onToggleMicrophoneMuted={onToggleMicrophoneMuted}
            onToggleSpeakerMuted={onToggleSpeakerMuted}
            onSpeaker={onSpeaker}
            onTrainingSuite={onTrainingSuite}
            onInfo={onInfo}
            onSettingsOpen={() => setSettingsOpen(true)}
          />
        ) : null}

        <EndCallButton onEnd={onEnd} isEnding={isEnding} />
      </div>

      {activePanel !== "none" ? (
        <SessionInfoPanel session={session} panel={activePanel} onClose={onClosePanel} />
      ) : null}

      <SettingsModalSheet open={settingsOpen} setOpen={setSettingsOpen} />
    </main>
  );
}
