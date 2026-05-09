import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { getCoachCallSession } from "./api";

export function coachCallSessionQueryOptions(workoutId: string, token: string) {
  return {
    queryKey: ["coach-call-session", workoutId, token] as const,
    queryFn: () => getCoachCallSession(workoutId, token),
    retry: 1,
  };
}

export function useCoachCallSession(workoutId: string) {
  const { getToken, isLoaded } = useAuth();

  return useQuery({
    ...coachCallSessionQueryOptions(workoutId, ""),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return getCoachCallSession(workoutId, token);
    },
    enabled: isLoaded,
  });
}
