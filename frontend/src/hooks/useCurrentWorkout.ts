import { useAuth } from "@clerk/react";
import { useEffect, useMemo, useState } from "react";
import type { BackendWorkoutResponse } from "../features/ai-conversation/tools/workout/workoutTypes";
import { getJson } from "../lib/api/fetcher";
import useCurrentUser from "./useCurrentUser";

export const DEBUG = import.meta.env.VITE_DEBUG === "true";
export const DEBUG_WORKOUT_ID = import.meta.env.VITE_DEBUG_WORKOUT_ID ?? "1";

const useCurrentWorkout = () => {
  const { getToken, isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<BackendWorkoutResponse[]>([]);

  const { trainerId, level } = useCurrentUser();

  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        console.log("User is signed in, fetching token...");
        try {
          const newToken = await getToken();
          setToken(newToken);
          console.log("Got token");
        } catch (err) {
          console.error("Failed to get token:", err);
          setToken(null);
        }
      } else {
        console.log("User is not signed in, set token to null");
        setToken(null);
        setWorkouts([]);
      }
    };
    if (!DEBUG) fetchToken();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!token) return;
      try {
        console.log("Fetching workouts with token");
        const data = await getJson<BackendWorkoutResponse[]>(`/api/workouts`, {
          token,
        });
        setWorkouts(data);
      } catch (err) {
        console.error("Failed to fetch workouts:", err);
        setWorkouts([]);
      }
    };
    void fetchWorkouts();
  }, [token]);

  // Compute filtered workouts
  const filteredWorkouts = useMemo(() => {
    console.log(
      "Filtering workouts for trainerId =",
      trainerId,
      "and level =",
      level,
    );
    const filtered = workouts.filter(
      (workout) =>
        workout.trainer?.id === trainerId && workout.level === level,
    );
    console.log("Filtered workouts:", filtered);
    return filtered;
  }, [workouts, trainerId, level]);

  // Compute currentWorkout from filteredWorkouts (no effect, no setState)
  const currentWorkout = useMemo(() => {
    if (filteredWorkouts.length > 0) {
      console.log(
        "Current workout set to first filtered workout with id =",
        filteredWorkouts[0].id,
      );
      return filteredWorkouts[0].id.toString();
    }
    console.log("No filtered workouts available, current workout is null");
    return null;
  }, [filteredWorkouts]);

  return {
    currentWorkout,
    workouts,
    filteredWorkouts,
  };
};

export default useCurrentWorkout;
