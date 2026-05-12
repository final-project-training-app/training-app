import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import type { ToastType } from "../../hooks/useToast";
import { fetchWorkouts, deleteWorkout } from "../../api/workouts";

type Workout = {
  id: number;
  name: string;
  type?: string;
  level?: number;
  durationSeconds?: number;
};

type StatusFn = (
  message: string,
  options?: { type?: ToastType; duration?: number },
) => void;

type Props = {
  onEdit: (workoutId: number) => void;
  onCreate: () => void;
  onStatusChange?: StatusFn;
};

type PendingDelete = {
  id: number;
  name: string;
  timerId: number;
};

export default function AllWorkoutsPage({
  onEdit,
  onCreate,
  onStatusChange,
}: Props) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  //  FETCH workouts
  const {
    data: workouts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk token");
      }

      return fetchWorkouts(token);
    },
  });

  //  DELETE workout
  const deleteMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk token");
      }

      onStatusChange?.("Deleting workout...", { type: "info" });

      return deleteWorkout(workoutId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      onStatusChange?.("Workout deleted.", { type: "success" });
    },
    onError: () => {
      onStatusChange?.("Failed to delete workout.", { type: "error" });
    },
  });

  useEffect(() => {
    return () => {
      if (pendingDelete != null) {
        window.clearTimeout(pendingDelete.timerId);
      }
    };
  }, [pendingDelete]);

  const [confirmModal, setConfirmModal] = useState<
    { open: true; workout: Workout } | { open: false }
  >({ open: false });

  const scheduleDelete = (workout: Workout) => {
    if (pendingDelete != null) {
      onStatusChange?.("Undo current delete first.", { type: "info" });
      return;
    }

    setConfirmModal({ open: true, workout });
  };

  const undoDelete = () => {
    if (pendingDelete == null) {
      return;
    }

    window.clearTimeout(pendingDelete.timerId);
    setPendingDelete(null);
    onStatusChange?.("Delete cancelled.", { type: "info" });
  };

  const onConfirmDelete = async () => {
    if (confirmModal.open !== true) return;
    const workout = confirmModal.workout;

    const timerId = window.setTimeout(async () => {
      try {
        await deleteMutation.mutateAsync(workout.id);
      } finally {
        setPendingDelete(null);
      }
    }, 5000);

    setPendingDelete({ id: workout.id, name: workout.name, timerId });
    setConfirmModal({ open: false });
    onStatusChange?.("Delete scheduled. Undo within 5 seconds.", {
      type: "info",
    });
  };

  const onCancelDelete = () => setConfirmModal({ open: false });

  if (isLoading) {
    return <p className="text-sm text-(--brand-muted)">Loading workouts...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">{(error as Error).message}</p>;
  }

  return (
    <div className="space-y-4">
      {pendingDelete != null && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            Delete pending for {pendingDelete.name}. You can undo now.
          </p>
          <button
            type="button"
            onClick={undoDelete}
            className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Undo
          </button>
        </div>
      )}

      {confirmModal.open && (
        <ConfirmModal
          open={true}
          title="Delete workout"
          body={`Delete workout "${confirmModal.workout.name}"? You can undo within 5 seconds.`}
          requireTyping={"DELETE"}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">All Workouts</h2>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-full bg-(--brand-primary) px-4 py-2 text-sm font-semibold text-(--brand-on-primary)"
        >
          + Add Workout
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {workouts.map((workout: Workout) => (
          <div
            key={workout.id}
            onClick={() => onEdit(workout.id)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-(--brand-border) bg-(--brand-surface-glass) p-4 transition hover:border-(--brand-primary)"
          >
            {/* Info */}
            <div>
              <p className="font-semibold">{workout.name}</p>
              <p className="text-xs text-(--brand-muted)">
                {workout.type ?? "No type"} • Level {workout.level ?? "-"} •{" "}
                {workout.durationSeconds ?? "-"} sec
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(workout.id);
                }}
                className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
              >
                Edit
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  scheduleDelete(workout);
                }}
                disabled={deleteMutation.isPending}
                className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
