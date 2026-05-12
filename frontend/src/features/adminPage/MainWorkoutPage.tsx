import { useState } from "react";
import AddWorkoutPage from "./AddWorkoutPage";
import AllWorkoutsPage from "./AllWorkoutsPage";
import EditWorkoutPage from "./EditWorkoutPage";
import { useToast } from "../../hooks/useToast";

type View = "all" | "create" | "edit";
type AdminTab = "workouts" | "trainers" | "feedback";

type Props = {
  onSwitchTab?: (tab: AdminTab) => void;
};

export default function MainWorkoutPage({ onSwitchTab }: Props) {
  const [view, setView] = useState<View>("all");
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const { toast, showToast } = useToast();

  return (
    <main className="flex min-h-dvh flex-col bg-(--brand-page) text-(--brand-ink)">
      {toast && (
        <div
          className={`pointer-events-none fixed right-6 top-6 z-20 rounded-lg px-4 py-2 text-sm font-medium ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-(--brand-ink) text-(--brand-on-primary)"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Top Navigation */}
      {view === "all" && (
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
        </div>
      )}

      {view !== "all" && (
        <div className="flex flex-wrap gap-2 border-b border-(--brand-border) px-6 py-4">
          <button
            type="button"
            onClick={() => {
              setView("all");
              showToast("Back to workouts.", { type: "info" });
            }}
            className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
          >
            Back to Workouts
          </button>

          {onSwitchTab && (
            <>
              <button
                type="button"
                onClick={() => onSwitchTab("trainers")}
                className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
              >
                Go to Trainers
              </button>

              <button
                type="button"
                onClick={() => onSwitchTab("feedback")}
                className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
              >
                Go to Feedback
              </button>
            </>
          )}
        </div>
      )}

      {/* Page Content */}
      <div className="flex-1 p-6">
        {view === "all" && (
          <AllWorkoutsPage
            onEdit={(workoutId) => {
              setEditingWorkoutId(workoutId);
              setView("edit");
              showToast("Opening edit page...", { type: "info" });
            }}
            onCreate={() => {
              setView("create");
              showToast("Opening add workout page...", { type: "info" });
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
