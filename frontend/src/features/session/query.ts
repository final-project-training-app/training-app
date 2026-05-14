import { useQuery } from "@tanstack/react-query";
import { getCoachCallSession, getTrainer } from "./api";

export function coachCallSessionQueryOptions(
  workoutId: string,
  userId?: string | null,
) {
  return {
    queryKey: ["coach-call-session", workoutId, userId] as const,
    queryFn: () => getCoachCallSession(workoutId, userId as string),
    retry: 1,
    enabled: !!userId,
  };
}

export function useCoachCallSession(workoutId: string, userId?: string | null) {
  return useQuery(coachCallSessionQueryOptions(workoutId, userId));
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
