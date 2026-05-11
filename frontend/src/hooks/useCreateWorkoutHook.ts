import { useMutation } from "@tanstack/react-query";
import { createWorkout } from "../api/workouts";

export function useCreateWorkout() {
  return useMutation({
    mutationFn: createWorkout,
  });
}
