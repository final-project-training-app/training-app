import { useState } from "react";
import AddWorkoutPage from "./AddWorkoutPage";

type WorkoutView = "list" | "create" | "edit";

export default function MainWorkoutPage() {
  const [activeTab, setActiveTab] = useState<WorkoutView>("list");

  return (
    <main className="flex min-h-dvh flex-col bg-(--brand-page) text-(--brand-ink)">
      {/* Top Navigation */}
      <div className="flex gap-3 border-b border-(--brand-border) px-6 py-4">
        <button
          onClick={() => setActiveTab("list")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "list"
              ? "bg-(--brand-primary) text-(--brand-on-primary)"
              : "bg-(--brand-surface-glass) text-(--brand-muted)"
          }`}
        >
          All Workouts
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "create"
              ? "bg-(--brand-primary) text-(--brand-on-primary)"
              : "bg-(--brand-surface-glass) text-(--brand-muted)"
          }`}
        >
          + Create Workout
        </button>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">
        {activeTab === "list" && (
          <div className="text-sm text-(--brand-muted)">
            {/* TODO: replace with WorkoutList component */}
            Show all workouts here (table/list)
          </div>
        )}

        {activeTab === "create" && <AddWorkoutPage />}

        {activeTab === "edit" && (
          <div className="text-sm text-(--brand-muted)">
            Edit workout view coming next...
          </div>
        )}
      </div>
    </main>
  );
}
