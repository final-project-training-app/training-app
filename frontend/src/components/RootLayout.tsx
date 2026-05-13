import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import fetchMyProfile from "../api/users";
import { useCreateCurrentUserProfile } from "../features/auth/useCreateCurrentUserProfile";
import { fetchTrainers } from "../api/trainers";

export default function RootLayout() {
  const queryClient = useQueryClient();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useCreateCurrentUserProfile();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    void (async () => {
      const token = await getToken();

      if (!token) {
        return;
      }

      await queryClient.prefetchQuery({
        queryKey: ["myProfile"],
        queryFn: () => fetchMyProfile(token),
      });

      await queryClient.prefetchQuery({
        queryKey: ["trainers"],
        queryFn: () => fetchTrainers(),
      });
    })();
  }, [getToken, isLoaded, isSignedIn, queryClient]);

  return <Outlet />;
}
