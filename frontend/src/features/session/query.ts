import { useQuery } from "@tanstack/react-query";
import { getSessionExercise } from "./api";

export function useSessionExercise(workoutId: string) {
  return useQuery({
    queryKey: ["session-exercise", workoutId],
    queryFn: () => getSessionExercise(workoutId),
  });
}
