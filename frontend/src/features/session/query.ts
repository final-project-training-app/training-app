import { useQuery } from "@tanstack/react-query";
import { getCoachCallSession } from "./api";

export function useCoachCallSession(workoutId: string) {
  return useQuery({
    queryKey: ["coach-call-session", workoutId],
    queryFn: () => getCoachCallSession(workoutId),
    retry: 1,
  });
}
