import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

type ProfileData = {
  name: string;
  intensityLevel: number;
  context: string;
};

type ProfileResponse = ProfileData;

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileData): Promise<ProfileResponse> => {
      const res = await fetch(`${API_URL}/api/users/me/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["myProfile"], data);
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}
