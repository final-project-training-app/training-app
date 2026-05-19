import { useMemo } from "react";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "../lib/api/fetcher";
import type { BackendWorkoutResponse } from "../features/ai-conversation/tools/workout/workoutTypes";
import useCurrentUser from "./useCurrentUser";

export const DEBUG = import.meta.env.VITE_DEBUG === "true";
export const DEBUG_WORKOUT_ID = import.meta.env.VITE_DEBUG_WORKOUT_ID ?? "1";

export default function useCurrentWorkout() {
  const { getToken, isSignedIn } = useAuth();
  const { trainerId, level } = useCurrentUser();

  // Fetch workouts once per authenticated user (react-query handles cancellation/retries)
  const {
    data: workouts = [] as BackendWorkoutResponse[], // ensure typed default
    isLoading,
    isError,
    refetch,
  } = useQuery<BackendWorkoutResponse[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      // ensure token is string | undefined (getToken may return null)
      const rawToken = isSignedIn ? await getToken() : undefined;
      const token: string | undefined = rawToken ?? undefined;
      return await getJson<BackendWorkoutResponse[]>(`/api/workouts`, {
        token,
      });
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // filtered by trainer + level (coerce level types to number for robust matching)
  const filteredWorkouts = useMemo(() => {
    if (!trainerId || level == null) return [];
    const desiredLevel = Number(level);

    const byTrainer = (workouts ?? []).filter(
      (w: BackendWorkoutResponse) => w.trainer?.id === trainerId,
    );

    // exact matches first
    const exact = byTrainer.filter((w) => Number(w.level) === desiredLevel);
    if (exact.length > 0) return exact;

    // if no workouts for trainer at all
    if (byTrainer.length === 0) return [];

    // compute unique sorted numeric levels available for this trainer
    const levels = Array.from(
      new Set(
        byTrainer
          .map((w) => Number(w.level))
          .filter((n) => Number.isFinite(n)),
      ),
    ).sort((a, b) => a - b);

    // try closest lower level
    const lower = levels.filter((l) => l < desiredLevel);
    if (lower.length > 0) {
      const chosen = lower[lower.length - 1]; // max lower
      return byTrainer.filter((w) => Number(w.level) === chosen);
    }

    // otherwise choose closest higher level
    const higher = levels.filter((l) => l > desiredLevel);
    if (higher.length > 0) {
      const chosen = higher[0]; // min higher
      return byTrainer.filter((w) => Number(w.level) === chosen);
    }

    return [];
  }, [workouts, trainerId, level]);

  // currentWorkout id (string) — first matching workout if any
  const currentWorkout = useMemo(() => {
    if (filteredWorkouts.length > 0) return String(filteredWorkouts[0].id);
    // debug fallback
    if (DEBUG) return String(DEBUG_WORKOUT_ID);
    return null;
  }, [filteredWorkouts]);

  return {
    currentWorkout,
    workouts,
    filteredWorkouts,
    isLoading,
    isError,
    refetch,
  };
}
