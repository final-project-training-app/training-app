import { useQuery } from "@tanstack/react-query";
import { getCoachCallSession } from "./api";

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
