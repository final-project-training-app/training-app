import { getJson } from "../../lib/api/fetcher";
import type { CoachCallSession } from "./types";

type BackendWorkoutResponse = {
  id: number;
  name: string;
  instructions?: string | null;
  instructionsAudio?: string | null;
  level?: string | null;
  type?: string | null;
  durationMinutes?: number | null;
  workoutAudio?: string | null;
};

type BackendProgressResponse = {
  currentStreak: number;
  completedWorkouts: Array<{
    dateLabel: string;
    workoutName: string;
  }>;
};

type BackendUserResponse = {
  id: number;
  name: string;
  intensityLevel: number;
  context: string;
};

const currentUserId = "1";

function toDurationSeconds(durationMinutes?: number | null) {
  return durationMinutes ? durationMinutes * 60 : 0;
}

export async function getCoachCallSession(
  workoutId: string,
): Promise<CoachCallSession> {
  const [workout, progress, user] = await Promise.all([
    getJson<BackendWorkoutResponse>(`/api/workouts/${workoutId}`),
    getJson<BackendProgressResponse>(`/api/users/${currentUserId}/progress`),
    getJson<BackendUserResponse>(`/api/users/${currentUserId}`),
  ]);

  return {
    id: String(workout.id),
    workoutName: workout.name,
    instructions: workout.instructions ?? "",
    level: workout.level || undefined,
    type: workout.type || undefined,
    instructionsAudioUrl: workout.instructionsAudio || undefined,
    workoutAudioUrl: workout.workoutAudio || undefined,
    durationSeconds: toDurationSeconds(workout.durationMinutes),

    userName: user.name,
    intensityLevel: user.intensityLevel,
    context: user.context,

    currentStreak: progress.currentStreak,
    completedWorkouts: progress.completedWorkouts,
  };
}
