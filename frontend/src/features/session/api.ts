import { getJson } from "../../lib/api/fetcher";
import type { WorkoutSessionData } from "./types";

type BackendWorkoutResponse = {
  id: number;
  name: string;
  instructionsAudio: string | null;
  workoutAudio: string | null;
  instructionsImage: string | null;
  workoutImage: string | null;
};

export async function getWorkoutSession(
  workoutId: string,
  token?: string,
): Promise<WorkoutSessionData> {
  const data = await getJson<BackendWorkoutResponse>(`/api/workouts/${workoutId}`, {
    token,
  });

  return {
    id: String(data.id),
    coachName: "Tränaren",
    avatarUrl:
      data.workoutImage ??
      data.instructionsImage ??
      "https://placehold.co/400x400/f4efff/4f46e5?text=Trainer",
    audioUrl: data.workoutAudio ?? data.instructionsAudio ?? undefined,
  };
}