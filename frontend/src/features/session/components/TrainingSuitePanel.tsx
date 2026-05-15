import { CalendarCheck, Flame, Trophy } from "lucide-react";
import type { CompletedWorkout } from "../types";

type TrainingSuitePanelProps = {
  streakDays?: number;
  items?: CompletedWorkout[];
};

export function TrainingSuitePanel({
  streakDays,
  items,
}: TrainingSuitePanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-[#f4efff] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b3fd6]">
            <Flame size={28} strokeWidth={2.4} />
          </div>

          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-[#6f6a93]">
              Nuvarande svit
            </p>

            <p className="mt-1 text-3xl font-extrabold leading-none text-[#100b2f]">
              {streakDays} dagar
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${item.dateLabel}-${item.workoutName}-${index}`}
              className="flex items-start gap-3 rounded-3xl bg-[#f4efff] px-4 py-3"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b3fd6]">
                <CalendarCheck size={21} strokeWidth={2.4} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-snug text-[#100b2f]">
                  {item.workoutName}
                </p>

                <p className="mt-1 text-xs font-bold text-[#6f6a93]">
                  {item.dateLabel}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-[#f4efff] px-4 py-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#5b3fd6]">
              <Trophy size={24} strokeWidth={2.4} />
            </div>

            <p className="text-sm font-extrabold text-[#100b2f]">
              Ingen träningshistorik hittades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
