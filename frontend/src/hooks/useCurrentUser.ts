import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { getJson } from "../lib/api/fetcher";

// Debug flags from env (Vite requires VITE_ prefix)
export const DEBUG = import.meta.env.VITE_DEBUG === "true";
export const DEBUG_USER_ID = import.meta.env.VITE_DEBUG_USER_ID ?? "1";
export const DEBUG_TRAINER_ID = Number(
  import.meta.env.VITE_DEBUG_TRAINER_ID ?? "1",
);
export const DEBUG_WORKOUT_ID = import.meta.env.VITE_DEBUG_WORKOUT_ID ?? "1";

const useCurrentUser = () => {
  const { userId: clerkId, isSignedIn, getToken } = useAuth();
  const [userId, setUserId] = useState<string | null>(DEBUG ? String(DEBUG_USER_ID) : null);
  const [trainerId, setTrainerId] = useState<number | null>(DEBUG ? DEBUG_TRAINER_ID : null);
  const [token, setToken] = useState<string | null>(DEBUG ? "debug-token" : null);

  // Fetch token only when sign-in status changes
  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        try {
          const newToken = await getToken();
          setToken(newToken);
          console.log("Got token");
        } catch (err) {
          console.error("Failed to get token:", err);
          setToken(null);
        }
      } else {
        setToken(null);
        setUserId(null);
        setTrainerId(null);
        console.log("User is not signed in, token set to null");
      }
    };
    if (!DEBUG) fetchToken();
  }, [isSignedIn, getToken]);

  // Fetch user data only when token and clerkId are available
  useEffect(() => {
    if (DEBUG) return;
    if (!token || !clerkId) return;

    const fetchUserId = async () => {
      try {
        const data: {
          id: number;
          name: string;
          intensityLevel: number;
          context: string;
          isAdmin: boolean;
          trainerId: number;
        } = await getJson(`/api/users/by-clerk/${clerkId}`, { token });
        console.log("Fetched user data:", data);
        setUserId(data.id.toString());
        setTrainerId(data.trainerId);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUserId(null);
        setTrainerId(null);
      }
    };

    fetchUserId();
  }, [token, clerkId]);

  return { clerkId, isSignedIn, userId, setUserId, trainerId, setTrainerId };
};

export default useCurrentUser;
