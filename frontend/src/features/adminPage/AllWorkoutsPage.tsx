import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWorkouts, deleteWorkout } from "../../api/workouts";

type Workout = {
  id: number;
  name: string;
  type?: string;
  level?: number;
  durationMinutes?: number;
};

type Props = {
  onEdit: (workout: Workout) => void;
};

export default function AllWorkoutsPage({ onEdit }: Props) {
  const queryClient = useQueryClient();

  //  FETCH workouts
  const {
    data: workouts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchWorkouts,
  });

  //  DELETE workout
  const deleteMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  if (isLoading) {
    return <p className="text-sm text-(--brand-muted)">Loading workouts...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">{(error as Error).message}</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">All Workouts</h2>
      </div>

      {/* List */}
      <div className="space-y-3">
        {workouts.map((workout: Workout) => (
          <div
            key={workout.id}
            className="flex items-center justify-between rounded-xl border border-(--brand-border) bg-(--brand-surface-glass) p-4"
          >
            {/* Info */}
            <div>
              <p className="font-semibold">{workout.name}</p>
              <p className="text-xs text-(--brand-muted)">
                {workout.type ?? "No type"} • Level {workout.level ?? "-"} •{" "}
                {workout.durationMinutes ?? "-"} min
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(workout)}
                className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
              >
                Edit
              </button>

              <button
                onClick={() => deleteMutation.mutate(workout.id)}
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
