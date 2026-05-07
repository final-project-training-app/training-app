export type SessionPanel = "none" | "info" | "exercise" | "suite";

export type TrainingSuiteItem = {
  day: string;
  activity: string;
};

export type CoachCallSession = {
  id: string;
  coachName: string;
  coachImageUrl?: string;

  userName: string;
  intensityLabel: string;
  trainingContext: string;

  exerciseAudioUrl?: string;

  durationSeconds: number;
  exerciseTitle: string;
  exerciseDescription: string;
  exerciseImageUrl?: string;

  trainingStreakDays: number;
  trainingSuite: TrainingSuiteItem[];
};
