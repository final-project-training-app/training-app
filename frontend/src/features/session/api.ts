import { getJson } from "../../lib/api/fetcher";
import type { BackendWorkoutResponse } from "../ai-conversation/tools/workout/workoutTypes";
import type { CoachCallSession, } from "./types";


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

export async function getWorkouts(): Promise<BackendWorkoutResponse[]> {
  return await getJson<BackendWorkoutResponse[]>(`/api/workouts`);
}

export async function getCoachCallSession(
  workoutId: string,
  userId: string,
): Promise<CoachCallSession> {
  console.log("Fetching coach call session for workoutId=", workoutId, "and userId=", userId);
  const [workout, progress, user] = await Promise.all([
    getJson<BackendWorkoutResponse>(`/api/workouts/${workoutId}`),
    getJson<BackendProgressResponse>(`/api/users/${userId}/progress`),
    getJson<BackendUserResponse>(`/api/users/${userId}`),
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
