import { getJson } from "../../lib/api/fetcher";
import coachImageUrl from "../../assets/image.png";
import type { CoachCallSession } from "./types";

type BackendWorkoutResponse = {
  id: number;
  name: string;
  title?: string | null;
  coachName?: string | null;
  coachImage?: string | null;

  userName?: string | null;
  intensityLabel?: string | null;
  trainingContext?: string | null;

  instructions?: string | null;
  instructionsAudio?: string | null;
  instructionsImage?: string | null;

  workoutAudio?: string | null;
  workoutImage?: string | null;
  durationSeconds?: number | null;
};

const fallbackSession: CoachCallSession = {
  id: "fallback",
  title: "Placeholder",
  coachName: "Tränaren",
  coachImageUrl,

  userName: "Stefan",
  intensityLabel: "Mycket låg",
  trainingContext:
    "Behöver bli mer rörlig. Har en fotskada och vill undvika tung belastning på foten.",

  guideAudioUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  exerciseAudioUrl: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",

  durationSeconds: 45,
  exerciseTitle: "Axelhöjningar",
  exerciseDescription:
    "I den här övningen kommer vi att höja axlarna och sänka axlarna. Övningen stärker hållningen och hjälper dig att bli mer medveten om spänningar i nacke och axlar.",
  exerciseImageUrl: "/session/exercise-shoulder-raises.svg",
};

export async function getCoachCallSession(
  workoutId: string,
): Promise<CoachCallSession> {
  try {
    const data = await getJson<BackendWorkoutResponse>(
      `/api/workouts/${workoutId}`,
    );

    return {
      id: String(data.id),
      title: data.title || fallbackSession.title,
      coachName: data.coachName || fallbackSession.coachName,
      coachImageUrl: data.coachImage ?? fallbackSession.coachImageUrl,

      userName: data.userName || fallbackSession.userName,
      intensityLabel: data.intensityLabel || fallbackSession.intensityLabel,
      trainingContext: data.trainingContext || fallbackSession.trainingContext,

      guideAudioUrl: data.instructionsAudio ?? fallbackSession.guideAudioUrl,
      exerciseAudioUrl:
        data.workoutAudio ??
        data.instructionsAudio ??
        fallbackSession.exerciseAudioUrl,

      durationSeconds: data.durationSeconds ?? fallbackSession.durationSeconds,
      exerciseTitle: data.name || fallbackSession.exerciseTitle,
      exerciseDescription:
        data.instructions || fallbackSession.exerciseDescription,
      exerciseImageUrl:
        data.workoutImage ??
        data.instructionsImage ??
        fallbackSession.exerciseImageUrl,
    };
  } catch (error) {
    console.warn(
      "Using fallback session because backend is unavailable",
      error,
    );

    return fallbackSession;
  }
}
