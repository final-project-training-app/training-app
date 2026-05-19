import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SessionCall } from "./components/SessionCall";
import { useCoachCallSession } from "./query";
import type { CoachCallSession, SessionPanel } from "./types";
import { useCoachSession } from "../ai-conversation";
import type { CoachSessionStep } from "../ai-conversation";

const LOADING_SESSION: CoachCallSession = {
  id: "",
  isAuthenticated: false,
  durationSeconds: 0,
};

export function SessionPage({
  workoutId,
  onEnd,
  alreadyTrainedToday,
}: {
  workoutId: string;
  onEnd: () => void;
  alreadyTrainedToday?: boolean;
}) {
  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useCoachCallSession(workoutId);
  const { t } = useTranslation();

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#fbf8ff] px-8 text-center text-base font-semibold text-[#221447]">
        {error instanceof Error ? error.message : t("sessionPage.genericError")}
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <SessionCall
        session={LOADING_SESSION}
        coachStatusLabel={t("sessionPage.calling")}
        elapsedSeconds={0}
        activePanel="none"
        isLoading={true}
        isMicrophoneMuted={false}
        isSpeakerMuted={false}
        onToggleMicrophoneMuted={() => {}}
        onToggleSpeakerMuted={() => {}}
        onSpeaker={() => {}}
        onTrainingSuite={() => {}}
        onInfo={() => {}}
        onClosePanel={() => {}}
        onEnd={onEnd}
      />
    );
  }

  return <ReadySessionPage session={session} onEnd={onEnd} alreadyTrainedToday={alreadyTrainedToday} />;
}

function ReadySessionPage({
  session,
  onEnd,
  alreadyTrainedToday,
}: {
  session: CoachCallSession;
  onEnd: () => void;
  alreadyTrainedToday?: boolean;
}) {
  const [activePanel, setActivePanel] = useState<SessionPanel>("none");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [callAnsweredAt, setCallAnsweredAt] = useState<number | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const { t } = useTranslation();

  function getCoachStatusLabel(step: CoachSessionStep) {
    switch (step) {
      case "idle":
        return t("sessionPage.status.idle");
      case "live_intro":
        return t("sessionPage.status.liveIntro");
      case "waiting_instruction_approval":
        return t("sessionPage.status.waitingInstructionApproval");
      case "playing_instructions":
        return t("sessionPage.status.playingInstructions");
      case "asking_ready":
        return t("sessionPage.status.askingReady");
      case "playing_workout":
        return t("sessionPage.status.playingWorkout");
      case "collecting_feedback":
        return t("sessionPage.status.collectingFeedback");
      case "completed":
        return t("sessionPage.status.completed");
      case "error":
        return t("sessionPage.status.error");
    }
  }

  const {
    step,
    error,
    debugEvents,
    hangUp,
    getCurrentRms,
    showInstructionsVideo,
    currentTurn,
    isMicrophoneMuted,
    isSpeakerMuted,
    toggleMicrophoneMuted,
    toggleSpeakerMuted,
  } = useCoachSession({
    session,
    trainerId: session.trainer?.id ? String(session.trainer.id) : undefined,
    autoStart: true,
    alreadyTrainedToday,
  });

  const isAiSpeaking =
    currentTurn === "gemini" ||
    step === "playing_instructions" ||
    step === "playing_workout";
  const isUserTurn = currentTurn === "user";
  const isCallAnswered = step !== "idle" && step !== "live_intro";

  useEffect(() => {
    if (!isCallAnswered || callAnsweredAt !== null) return;
    setCallAnsweredAt(Date.now());
    setElapsedSeconds(0);
  }, [callAnsweredAt, isCallAnswered]);

  useEffect(() => {
    if (callAnsweredAt === null) return;
    if (step === "completed" || step === "idle" || step === "error") return;

    const tick = () => {
      setElapsedSeconds(Math.floor((Date.now() - callAnsweredAt) / 1000));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [callAnsweredAt, step]);

  useEffect(() => {
    if (step !== "completed") return;
    const timer = setTimeout(onEnd, 3000);
    return () => clearTimeout(timer);
  }, [step, onEnd]);

  function handleEnd() {
    setIsEnding(true);
    hangUp();
    setTimeout(onEnd, 3000);
  }

  function togglePanel(panel: Exclude<SessionPanel, "none">) {
    setActivePanel((current) => (current === panel ? "none" : panel));
  }

  return (
    <SessionCall
      session={session}
      workoutName={session.name ?? session.workoutName}
      coachStatusLabel={error ?? getCoachStatusLabel(step)}
      elapsedSeconds={elapsedSeconds}
      activePanel={activePanel}
      debugEvents={debugEvents}
      getCurrentRms={getCurrentRms}
      showInstructionsVideo={showInstructionsVideo}
      isAiSpeaking={isAiSpeaking}
      isUserTurn={isUserTurn}
      isEnding={isEnding}
      isMicrophoneMuted={isMicrophoneMuted}
      isSpeakerMuted={isSpeakerMuted}
      onToggleMicrophoneMuted={toggleMicrophoneMuted}
      onToggleSpeakerMuted={toggleSpeakerMuted}
      onSpeaker={() => togglePanel("exercise")}
      onTrainingSuite={() => togglePanel("suite")}
      onInfo={() => togglePanel("info")}
      onClosePanel={() => setActivePanel("none")}
      onEnd={handleEnd}
    />
  );
}
