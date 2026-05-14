import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { getJson } from "../lib/api/fetcher";

const useCurrentUser = () => {
  const { userId: clerkId, isSignedIn, getToken } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

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
    fetchToken();
  }, [isSignedIn, getToken]);

  // Fetch user data only when token and clerkId are available
  useEffect(() => {
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
