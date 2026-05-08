import type { LiveToolArgs } from "../shared/liveToolTypes";
import { readNumberArg } from "../shared/readNumberArg";
import { getProgressEndpoint } from "./progressEndpoint";

const defaultUserId = 1;

export async function getProgressHandler(args: LiveToolArgs) {
  const userId = readNumberArg(args, "userId", defaultUserId);
  const progress = await getProgressEndpoint(userId);

  return {
    userId,
    endpoint: progress,
    progress: progress.ok ? progress.data : null,
    usableCoachContext: {
      currentStreak: progress.ok ? progress.data.currentStreak : null,
      completedWorkouts: progress.ok ? progress.data.completedWorkouts : [],
    },
  };
}
