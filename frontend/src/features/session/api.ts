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
export type BackendTrainerResponse = {
  id: number;
  name: string;
  prompt: string;
  voice: string;
  intro: string;
  language: string;
  imageSelect: string | null;
  imageCall: string | null;
  imageStart: string | null;
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

const currentUserId = "6";

function toDurationSeconds(workout: BackendWorkoutResponse) {
  if (typeof workout.durationSeconds === "number") {
    return workout.durationSeconds;
  }

  if (typeof workout.durationMinutes === "number") {
    return workout.durationMinutes * 60;
  }

  return 0;
}

export async function getTrainers(): Promise<BackendTrainerResponse[]> {
  return await getJson<BackendTrainerResponse[]>(`/api/trainers`);
}

export async function getTrainer(
  trainerId: string,
): Promise<BackendTrainerResponse> {
  return await getJson<BackendTrainerResponse>(`/api/trainers/${trainerId}`);
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

    name: workout.name,
    workoutName: workout.name,

    description: workout.description,
    instructions: workout.description,

    level: workout.level,
    type: workout.type,

    instructionsAudio: workout.instructionsAudio,
    workoutAudio: workout.workoutAudio,
    instructionsAudioUrl: workout.instructionsAudio,
    workoutAudioUrl: workout.workoutAudio,

    instructionsImage: workout.instructionsImage,
    workoutImage: workout.workoutImage,

    kneeFriendly: workout.kneeFriendly,
    lowImpact: workout.lowImpact,
    seated: workout.seated,
    beginnerFriendly: workout.beginnerFriendly,

    durationSeconds: toDurationSeconds(workout),

    trainer: workout.trainer,

    userName: user.name,
    intensityLevel: user.intensityLevel,
    context: user.context,

    currentStreak: progress.currentStreak,
    completedWorkouts: progress.completedWorkouts,
  };
}
