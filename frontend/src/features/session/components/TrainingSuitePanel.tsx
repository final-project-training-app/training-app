import type { CompletedWorkout } from "../types";
import { SessionPanelSection } from "./SessionPanelSection";

type TrainingSuitePanelProps = {
  streakDays: number;
  items: CompletedWorkout[];
};

export function TrainingSuitePanel({
  streakDays,
  items,
}: TrainingSuitePanelProps) {
  return (
    <div className="space-y-5 text-xl font-semibold leading-tight">
      <SessionPanelSection title="Nuvarande svit:">
        <p>{streakDays} dagar</p>
      </SessionPanelSection>

      <div className="pointer-events-auto max-h-64 space-y-3 overflow-y-auto pr-2">
        {items.map((item) => (
          <p
            key={`${item.dateLabel}-${item.workoutName}`}
            className="flex flex-col gap-0.5"
          >
            <span className="font-extrabold">{item.dateLabel}</span>
            <span>{item.workoutName}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
