import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SessionCall } from "./components/SessionCall";
import { useCoachCallSession } from "./query";
import type { CoachCallSession, SessionPanel } from "./types";
import { useCoachSession } from "../ai-conversation";
import type { CoachSessionStep } from "../ai-conversation";

export function SessionPage() {
  const { workoutId } = useParams({ from: "/session/$workoutId" });

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useCoachCallSession(workoutId);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#fbf8ff] px-8 text-center text-lg font-bold text-[#5b3fd6]">
        {t("sessionPage.loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#fbf8ff] px-8 text-center text-base font-semibold text-[#221447]">
        {error instanceof Error ? error.message : t("sessionPage.genericError")}
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <ReadySessionPage session={session} />;
}

function ReadySessionPage({ session }: { session: CoachCallSession }) {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<SessionPanel>("none");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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

  const { step, error, debugEvents, endSession, getCurrentRms, showInstructionsVideo } =
    useCoachSession({
      session,
      trainerId: session.trainer?.id ? String(session.trainer.id) : undefined,
      autoStart: true,
    });

  useEffect(() => {
    if (step !== "completed") return;
    const timer = setTimeout(() => void navigate({ to: "/" }), 3000);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  async function handleEnd() {
    await endSession();
    setActivePanel("none");
    setElapsedSeconds(0);
    void navigate({ to: "/" });
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
      onSpeaker={() => togglePanel("exercise")}
      onTrainingSuite={() => togglePanel("suite")}
      onInfo={() => togglePanel("info")}
      onClosePanel={() => setActivePanel("none")}
      onEnd={handleEnd}
    />
  );
}
