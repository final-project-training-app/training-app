export type SessionScreen = "landing" | "call";
export type SessionAudioKind = "guide" | "exercise";
export type SessionPanel = "none" | "info" | "exercise";

export type CoachCallSession = {
  id: string;
  title: string;
  coachName: string;
  coachImageUrl?: string;

  userName: string;
  intensityLabel: string;
  trainingContext: string;

  guideAudioUrl?: string;
  exerciseAudioUrl?: string;

  durationSeconds: number;
  exerciseTitle: string;
  exerciseDescription: string;
  exerciseImageUrl?: string;
};