import type { TrainingSuiteItem } from "../types";
import { SessionPanelSection } from "./SessionPanelSection";

type TrainingSuitePanelProps = {
  streakDays: number;
  items: TrainingSuiteItem[];
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
            key={`${item.day}-${item.activity}`}
            className="flex flex-col gap-0.5"
          >
            <span className="font-extrabold">{item.day}</span>
            <span>{item.activity}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
