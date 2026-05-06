import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { getWorkoutSession } from "./api";

export function useWorkoutSession(workoutId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["workout-session", workoutId],
    queryFn: async () => {
      const token = await getToken();
      return getWorkoutSession(workoutId, token ?? undefined);
    },
    retry: 1,
  });
}
