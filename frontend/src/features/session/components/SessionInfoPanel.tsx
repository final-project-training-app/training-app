import type { CoachCallSession, SessionPanel } from "../types";
import { ExercisePanel } from "./ExercisePanel";
import { SessionPanelModal } from "./SessionPanelModal";
import { TrainingSuitePanel } from "./TrainingSuitePanel";
import { UserInfoPanel } from "./UserInfoPanel";

type SessionInfoPanelProps = {
  session: CoachCallSession;
  panel: Exclude<SessionPanel, "none">;
  onClose: () => void;
};

export function SessionInfoPanel({
  session,
  panel,
  onClose,
}: SessionInfoPanelProps) {
  if (panel === "suite") {
    return (
      <SessionPanelModal title="Träningssvit" onClose={onClose}>
        <TrainingSuitePanel
          streakDays={session.currentStreak}
          items={session.completedWorkouts}
        />
      </SessionPanelModal>
    );
  }

  if (panel === "exercise") {
    return (
      <SessionPanelModal title={session.workoutName} onClose={onClose}>
        <ExercisePanel session={session} />
      </SessionPanelModal>
    );
  }

  return (
    <SessionPanelModal title="Min info" onClose={onClose}>
      <UserInfoPanel session={session} />
    </SessionPanelModal>
  );
}
