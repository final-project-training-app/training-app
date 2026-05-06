import { getJson } from "../../lib/api/fetcher";
import type { SessionExercise } from "./types";

type BackendWorkoutResponse = {
  id: number;
  name: string;
  instructions: string;
  instructionsAudio: string | null;
  workoutAudio: string | null;
  instructionsImage: string | null;
  workoutImage: string | null;
};

export async function getSessionExercise(
  workoutId: string,
): Promise<SessionExercise> {
  const data = await getJson<BackendWorkoutResponse>(
    `/api/workouts/${workoutId}`,
  );

  return {
    id: String(data.id),
    title: data.name,
    durationSeconds: 25,
    imageUrl: data.instructionsImage ?? data.workoutImage ?? "",
    audioUrl: data.instructionsAudio ?? data.workoutAudio ?? undefined,
    instruction: data.instructions,
  };
}
