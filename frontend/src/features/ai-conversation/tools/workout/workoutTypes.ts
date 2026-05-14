export type BackendWorkoutResponse = {
  id: number;
  name: string;
  instructions?: string | null;
  level?: number | null;
  type?: string | null;
  durationMinutes?: number | null;
  instructionsAudio?: string | null;
  workoutAudio?: string | null;
  instructionsImage?: string | null;
  workoutImage?: string | null;
  kneeFriendly?: boolean | null;
  lowImpact?: boolean | null;
  seated?: boolean | null;
  beginnerFriendly?: boolean | null;
};
