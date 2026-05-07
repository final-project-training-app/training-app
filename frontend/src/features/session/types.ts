export type SessionPanel = "none" | "info" | "exercise" | "suite";

export type CompletedWorkout = {
  dateLabel: string;
  workoutName: string;
};

export type CoachCallSession = {
  id: string;
  workoutName: string;
  instructions: string;
  level?: string;
  type?: string;
  workoutAudioUrl?: string;
  durationSeconds: number;

  userName: string;
  intensityLevel: number;
  context: string;

  currentStreak: number;
  completedWorkouts: CompletedWorkout[];
};
