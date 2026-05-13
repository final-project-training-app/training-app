import { CalendarDays, MessageSquareText, UserRound } from "lucide-react";
import type { CoachCallSession, SessionPanel } from "../types";
import { ExercisePanel } from "./ExercisePanel";
import { SessionPanelModal } from "./SessionPanelModal";
import { TrainingSuitePanel } from "./TrainingSuitePanel";
import { UserInfoPanel } from "./UserInfoPanel";

type SessionInfoPanelProps = {
  session: CoachCallSession;
  panel: SessionPanel;
  onClose: () => void;
};

export function SessionInfoPanel({
  session,
  panel,
  onClose,
}: SessionInfoPanelProps) {
  if (panel === "none") return null;

  if (panel === "suite") {
    return (
      <SessionPanelModal
        title="Träningssvit"
        subtitle="Din senaste träningshistorik"
        icon={<CalendarDays size={24} strokeWidth={2.4} />}
        onClose={onClose}
      >
        <TrainingSuitePanel
          streakDays={session.currentStreak}
          items={session.completedWorkouts}
        />
      </SessionPanelModal>
    );
  }

  if (panel === "exercise") {
    return (
      <SessionPanelModal
        title="Instruktioner"
        subtitle={session.workoutName ?? session.name}
        icon={<MessageSquareText size={24} strokeWidth={2.4} />}
        onClose={onClose}
      >
        <ExercisePanel session={session} />
      </SessionPanelModal>
    );
  }

  return (
    <SessionPanelModal
      title="Min info"
      subtitle="Det coachen behöver veta"
      icon={<UserRound size={24} strokeWidth={2.4} />}
      onClose={onClose}
    >
      <UserInfoPanel session={session} />
    </SessionPanelModal>
  );
}
