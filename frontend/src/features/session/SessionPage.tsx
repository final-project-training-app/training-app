import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SessionCall } from "./components/SessionCall";
import { useCoachCallSession } from "./query";
import type { CoachCallSession, SessionPanel } from "./types";
import { useCoachSession } from "./useCoachSession";
import type { CoachSessionStep } from "./coachSessionHelpers";

export function SessionPage() {
  const { workoutId } = useParams({ from: "/session/$workoutId" });

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useCoachCallSession(workoutId);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        Laddar session...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-dvh items-center justify-center p-8 text-center">
        {error instanceof Error ? error.message : "Något gick fel."}
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <ReadySessionPage session={session} />;
}

function getCoachStatusLabel(step: CoachSessionStep) {
  switch (step) {
    case "idle":
      return "Ansluter till tränaren...";
    //case "choosing_workout":
     // return "Tränaren väljer ett pass åt dig...";
    case "live_intro":
      return "Coach-samtalet är igång.";
    case "waiting_instruction_approval":
      return "Säg ja när du är redo för instruktionerna.";
    case "playing_instructions":
      return "Spelar instruktioner.";
    case "asking_ready":
      return "Säg ja när du är redo för workouten.";
    case "playing_workout":
      return "Workout pågår.";
    case "collecting_feedback":
      return "Tränaren sammanfattar och frågar hur det kändes.";
    case "completed":
      return "Sessionen är sparad.";
    case "error":
      return "Något gick fel.";
  }
}

function ReadySessionPage({ session }: { session: CoachCallSession }) {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<SessionPanel>("none");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const {
    step,
    error,
    selectedWorkout,
    debugEvents,
    endSession,
  } = useCoachSession({
    session,
    autoStart: true,
  });

  useEffect(() => {
    if (step !== "completed") return;
    const timer = setTimeout(() => void navigate({ to: "/" }), 3000);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  function handleEnd() {
    endSession();
    setActivePanel("none");
    setElapsedSeconds(0);
    void navigate({ to: "/" });
  }

  function togglePanel(panel: Exclude<SessionPanel, "none">) {
    setActivePanel((current) => (current === panel ? "none" : panel));
  }

  return (
    <>
      <SessionCall
        session={session}
        workoutName={selectedWorkout?.name ?? session.workoutName}
        coachStep={step}
        coachStatusLabel={error ?? getCoachStatusLabel(step)}
        elapsedSeconds={elapsedSeconds}
        durationSeconds={0}
        activePanel={activePanel}
        debugEvents={debugEvents}
        onSpeaker={() => togglePanel("exercise")}
        onTrainingSuite={() => togglePanel("suite")}
        onInfo={() => togglePanel("info")}
        onClosePanel={() => setActivePanel("none")}
        onEnd={handleEnd}
      />
    </>
  );
}
