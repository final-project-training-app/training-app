import { CalendarDays, MessageSquareText, UserRound } from "lucide-react";
import type { CoachCallSession, SessionPanel } from "../types";
import { ExercisePanel } from "./ExercisePanel";
import { TrainingSuitePanel } from "./TrainingSuitePanel";
import { UserInfoPanel } from "./UserInfoPanel";
import { AppSheet } from "../../../components/AppSheet";

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
      <AppSheet
        open
        title="Träningssvit"
        subtitle="Din senaste träningshistorik"
        icon={<CalendarDays size={20} strokeWidth={2.4} />}
        onClose={onClose}
        height="default"
      >
        <TrainingSuitePanel
          streakDays={session.currentStreak}
          items={session.completedWorkouts}
        />
      </AppSheet>
    );
  }

  if (panel === "exercise") {
    return (
      <AppSheet
        open
        title="Instruktioner"
        subtitle={session.workoutName ?? session.name}
        icon={<MessageSquareText size={20} strokeWidth={2.4} />}
        onClose={onClose}
        height="large"
      >
        <ExercisePanel session={session} />
      </AppSheet>
    );
  }

  return (
    <AppSheet
      open
      title="Min info"
      subtitle="Det coachen vet om dig"
      icon={<UserRound size={20} strokeWidth={2.4} />}
      onClose={onClose}
      height="default"
    >
      <UserInfoPanel session={session} />
    </AppSheet>
  );
}
