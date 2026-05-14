import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { getJson } from "../lib/api/fetcher";
import type { Trainer } from "../features/session/types";

// Debug flags from env (Vite requires VITE_ prefix)
export const DEBUG = import.meta.env.VITE_DEBUG === "true";
export const DEBUG_USER_ID = import.meta.env.VITE_DEBUG_USER_ID ?? "1";
export const DEBUG_TRAINER_ID = Number(
  import.meta.env.VITE_DEBUG_TRAINER_ID ?? "1",
);
const FALLBACK_VOICE = "Puck"; // keep as fallback constant

const useCurrentUser = () => {
  const { userId: clerkId, isSignedIn, getToken } = useAuth();
  const [userId, setUserId] = useState<string | null>(
    DEBUG ? String(DEBUG_USER_ID) : null,
  );
  const [trainerId, setTrainerId] = useState<number | null>(
    DEBUG ? DEBUG_TRAINER_ID : null,
  );
  const [level, setLevel] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [voice, setVoice] = useState<string | null>(null);

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
        setVoice(FALLBACK_VOICE);
        console.log("User is not signed in, token set to null");
      }
    };
    if (!DEBUG) fetchToken();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    console.log(
      voice ? "Current user voice is: " + voice : "No voice for current user",
    );
  }, [voice]);

  // Fetch user data only when token and clerkId are available
  useEffect(() => {
    if (DEBUG) return;
    if (!token || !clerkId) return;

    const fetchUserId = async () => {
      try {
        const userData: {
          id: number;
          name: string;
          intensityLevel: number;
          context: string;
          isAdmin: boolean;
          trainerId: number;
        } = await getJson(`/api/users/by-clerk/${clerkId}`, { token });
        console.log("Fetched user data:", userData);

        const trainerData: Trainer = await getJson(
          `/api/trainers/${userData.trainerId}`,
          { token },
        );

        console.log("Fetched trainer data:", trainerData);
        setUserId(userData.id.toString());
        setTrainerId(userData.trainerId);
        setLevel(userData.intensityLevel);
        setVoice(trainerData.voice || FALLBACK_VOICE);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUserId(null);
        setTrainerId(null);
        setLevel(null);
        setVoice(FALLBACK_VOICE);
      }
    };

    fetchUserId();
  }, [token, clerkId]);

  return {
    clerkId,
    isSignedIn,
    userId,
    setUserId,
    trainerId,
    setTrainerId,
    level,
    voice,
  };
};

export default useCurrentUser;
