import { useQuery } from "@tanstack/react-query";
import { getCoachCallSession, getTrainer } from "./api";

export function coachCallSessionQueryOptions(workoutId: string) {
  return {
    queryKey: ["coach-call-session", workoutId] as const,
    queryFn: () => getCoachCallSession(workoutId),
    retry: 1,
  };
}

export function useCoachCallSession(workoutId: string) {
  return useQuery(coachCallSessionQueryOptions(workoutId));
}

export function trainerQueryOptions(trainerId: string) {
  return {
    queryKey: ["trainer", trainerId] as const,
    queryFn: () => getTrainer(trainerId),
    retry: 1,
  };
}

export function useTrainer(trainerId: string) {
  return useQuery(trainerQueryOptions(trainerId));
}
