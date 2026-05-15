import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { getCoachCallSession, getTrainer } from "./api";

export function coachCallSessionQueryOptions(
  workoutId: string,
  token?: string | null,
) {
  return {
    queryKey: ["coach-call-session", workoutId, token ? "auth" : "guest"] as const,
    queryFn: () => getCoachCallSession(workoutId, token),
    retry: 1,
  };
}

export function useCoachCallSession(workoutId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [
      "coach-call-session",
      workoutId,
      isLoaded ? (isSignedIn ? "auth" : "guest") : "auth-loading",
    ] as const,
    queryFn: async () => {
      const token = isLoaded && isSignedIn ? await getToken() : null;
      return getCoachCallSession(workoutId, token);
    },
    enabled: isLoaded,
    retry: 1,
  });
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
