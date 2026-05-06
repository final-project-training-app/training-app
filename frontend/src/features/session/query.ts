import { useQuery } from "@tanstack/react-query";
import { getWorkoutSession } from "./api";

export function useWorkoutSession(workoutId: string) {
  return useQuery({
    queryKey: ["workout-session", workoutId],
    queryFn: () => getWorkoutSession(workoutId),
    retry: 1,
  });
}