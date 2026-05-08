import { useAuth, useUser } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createCurrentUser } from "../../lib/auth/clerkUser";

export function useCreateCurrentUserProfile() {
  const { isLoaded, isSignedIn, getToken, sessionClaims, userId } = useAuth();
  const { user } = useUser();
  const lastSyncedUserIdRef = useRef<string | null>(null);
  const createUserMutation = useMutation({
    mutationFn: createCurrentUser,
  });

  const clerkUserId = sessionClaims?.sub ?? userId ?? null;

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUserId) {
      return;
    }

    if (lastSyncedUserIdRef.current === clerkUserId) {
      return;
    }

    lastSyncedUserIdRef.current = clerkUserId;

    void (async () => {
      const token = await getToken();
      const displayName =
        user?.fullName?.trim() ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
        user?.username?.trim() ||
        user?.primaryEmailAddress?.emailAddress?.trim() ||
        "No name entered";

      if (!token) {
        return;
      }

      await createUserMutation.mutateAsync({ token, displayName });
    })().catch(() => {
      lastSyncedUserIdRef.current = null;
    });
  }, [clerkUserId, createUserMutation, getToken, isLoaded, isSignedIn, user]);
}
