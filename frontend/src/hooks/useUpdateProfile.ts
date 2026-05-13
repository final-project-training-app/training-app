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
      if (!isLoaded || !isSignedIn) {
        throw new Error("Not signed in");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk token");
      }

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
          "[useUpdateProfile] Update failed:",
          res.status,
          errorText,
        );
        throw new Error(`Update failed: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["myProfile"], data);
    },
    onError: (error) => {
      console.error("[useUpdateProfile]", error);
    },
  });
}
