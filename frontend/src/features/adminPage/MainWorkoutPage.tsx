import { useState } from "react";
import AddWorkoutPage from "./AddWorkoutPage";
import AllWorkoutsPage from "./AllWorkoutsPage";
import EditWorkoutPage from "./EditWorkoutPage";
import { useToast } from "../../hooks/useToast";

type View = "all" | "create" | "edit";

export default function MainWorkoutPage() {
  const [view, setView] = useState<View>("all");
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const { toast, showToast } = useToast();

  return (
    <main className="flex min-h-dvh flex-col bg-(--brand-page) text-(--brand-ink)">
      {toast && (
        <div className="pointer-events-none fixed right-6 top-6 z-20 rounded-lg bg-(--brand-ink) px-4 py-2 text-sm font-medium text-(--brand-on-primary)">
          {toast}
        </div>
      )}

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

        {view === "edit" && (
          <button
            onClick={() => {
              setView("all");
              showToast("Back to workouts.");
            }}
            className="rounded-full bg-(--brand-primary) px-4 py-2 text-sm font-semibold text-(--brand-on-primary)"
          >
            Edit Workout
          </button>
        )}
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">
        {view === "all" && (
          <AllWorkoutsPage
            onEdit={(workoutId) => {
              setEditingWorkoutId(workoutId);
              setView("edit");
              showToast("Opening edit page...");
            }}
            onCreate={() => {
              setView("create");
              showToast("Opening add workout page...");
            }}
            onStatusChange={showToast}
          />
        )}

        {view === "create" && (
          <AddWorkoutPage
            onBack={() => setView("all")}
            onStatusChange={showToast}
          />
        )}

        {view === "edit" && editingWorkoutId != null && (
          <EditWorkoutPage
            workoutId={editingWorkoutId}
            onBack={() => setView("all")}
            onStatusChange={showToast}
          />
        )}
      </div>
    </main>
  );
}
