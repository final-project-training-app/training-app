import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

type ProfileData = {
  name: string;
  intensityLevel: number;
  context: string;
  trainerId?: number | null;
};

type ProfileResponse = ProfileData;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMutation({
    mutationFn: async (data: ProfileData): Promise<ProfileResponse> => {
      console.log("[useUpdateProfile] Mutation called with data:", data);

      if (!isLoaded || !isSignedIn) {
        console.error(
          "[useUpdateProfile] Not signed in - isLoaded:",
          isLoaded,
          "isSignedIn:",
          isSignedIn,
        );
        throw new Error("Not signed in");
      }

      const token = await getToken();

      if (!token) {
        console.error("[useUpdateProfile] Missing token");
        throw new Error("Missing Clerk token");
      }

      console.log(
        "[useUpdateProfile] Sending PUT request to",
        API_URL + "/api/users/me/profile",
      );
      const res = await fetch(`${API_URL}/api/users/me/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          "[useUpdateProfile] Response not ok:",
          res.status,
          errorText,
        );
        throw new Error(`Update failed: ${res.status}`);
      }

      const responseData = await res.json();
      console.log("[useUpdateProfile] Success! Response:", responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log(
        "[useUpdateProfile] onSuccess called, updating cache with:",
        data,
      );
      queryClient.setQueryData(["myProfile"], data);
    },
    onError: (error) => {
      console.error("[useUpdateProfile] onError called:", error);
    },
  });
}
