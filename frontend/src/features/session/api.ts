import { getJson } from "../../lib/api/fetcher";
import type { CoachCallSession, Trainer } from "./types";

type BackendWorkoutResponse = {
  id: number;
  name: string;
  description?: string | null;
  instructions?: string | null;

  level?: number | string | null;
  type?: string | null;

  instructionsAudio?: string | null;
  workoutAudio?: string | null;
  instructionsImage?: string | null;
  workoutImage?: string | null;

  durationMinutes?: number | null;
  durationSeconds?: number | null;

  kneeFriendly?: boolean;
  lowImpact?: boolean;
  seated?: boolean;
  beginnerFriendly?: boolean;

  trainer?: Trainer | null;
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

function toDurationSeconds(workout: BackendWorkoutResponse) {
  if (typeof workout.durationSeconds === "number") {
    return workout.durationSeconds;
  }

  if (typeof workout.durationMinutes === "number") {
    return workout.durationMinutes * 60;
  }

  return 0;
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
    id: workout.id,

    // Backend field
    name: workout.name,

    // Backwards-compatible frontend field
    workoutName: workout.name,

    description: workout.description ?? null,
    instructions: workout.instructions ?? "",

    level: workout.level ?? null,
    type: workout.type ?? null,

    instructionsAudio: workout.instructionsAudio ?? null,
    workoutAudio: workout.workoutAudio ?? null,
    instructionsAudioUrl: workout.instructionsAudio ?? null,
    workoutAudioUrl: workout.workoutAudio ?? null,

    instructionsImage: workout.instructionsImage ?? null,
    workoutImage: workout.workoutImage ?? null,

    kneeFriendly: workout.kneeFriendly ?? false,
    lowImpact: workout.lowImpact ?? false,
    seated: workout.seated ?? false,
    beginnerFriendly: workout.beginnerFriendly ?? false,

    durationSeconds: toDurationSeconds(workout),

    
    trainer: workout.trainer ?? null,

    userName: user.name,
    intensityLevel: user.intensityLevel,
    context: user.context,

    currentStreak: progress.currentStreak,
    completedWorkouts: progress.completedWorkouts,
  };
}
