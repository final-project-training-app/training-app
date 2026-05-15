import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCreateCurrentUserProfile } from "../features/auth/useCreateCurrentUserProfile";
import AppStageFrame from "./AppStageFrame";
import { fetchTrainersWithToken } from "../api/trainers";

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
        queryKey: ["trainers"],
        queryFn: () => fetchTrainersWithToken(token),
      });
    })();
  }, [getToken, isLoaded, isSignedIn, queryClient]);

  return (
    <main className="app-root app-root-shell relative flex w-full items-center justify-center overflow-hidden text-[#221447]">
      <AppStageFrame>
        <Outlet />
      </AppStageFrame>
    </main>
  );
}
