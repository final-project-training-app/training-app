import { useQuery } from "@tanstack/react-query";
import fetchMyProfile from "../api/users";

export function useMyProfile() {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchMyProfile,
    staleTime: 1000 * 60 * 1, // 1 min cache
  });
}