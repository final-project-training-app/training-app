import { useState } from "react";
import AddWorkoutPage from "./AddWorkoutPage";
import AllWorkoutsPage from "./AllWorkoutsPage";

type View = "all" | "create";

export default function MainWorkoutPage() {
  const [view, setView] = useState<View>("all");

  return (
    <main className="flex min-h-dvh flex-col bg-(--brand-page) text-(--brand-ink)">
      {/* Top Navigation */}
      <div className="flex gap-3 border-b border-(--brand-border) px-6 py-4">
        <button
          onClick={() => setView("all")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            view === "all"
              ? "bg-(--brand-primary) text-(--brand-on-primary)"
              : "bg-(--brand-surface-glass) text-(--brand-muted)"
          }`}
        >
          All Workouts
        </button>

        <button
          onClick={() => setView("create")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            view === "create"
              ? "bg-(--brand-primary) text-(--brand-on-primary)"
              : "bg-(--brand-surface-glass) text-(--brand-muted)"
          }`}
        >
          + Create Workout
        </button>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">
        {view === "all" && (
          <AllWorkoutsPage
            onEdit={(workout) => {
              console.log("edit later", workout);
            }}
          />
        )}

        {view === "create" && <AddWorkoutPage />}
      </div>
    </main>
  );
}
