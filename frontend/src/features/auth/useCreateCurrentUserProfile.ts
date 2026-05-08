import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createCurrentUser } from "../../lib/auth/clerkUser";

export function useCreateCurrentUserProfile() {
  const { isLoaded, isSignedIn, getToken, sessionClaims, userId } = useAuth();
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

      if (!token) {
        return;
      }

      await createUserMutation.mutateAsync(token);
    })().catch(() => {
      lastSyncedUserIdRef.current = null;
    });
  }, [clerkUserId, createUserMutation, getToken, isLoaded, isSignedIn]);
}
