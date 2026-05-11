import { SignInButton, useAuth } from "@clerk/react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminPage } from "../../hooks/useAdminPage";
import { useMyProfile } from "../../hooks/useMyProfile";
import AddWorkoutPage from "./AddWorkoutPage";

export default function AdminPage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const isAdmin = profile?.isAdmin === true;
  const { data, isLoading, error } = useAdminPage(isAdmin);

  if (!isLoaded || profileLoading) {
    return (
      <main className="flex h-dvh items-center justify-center bg-(--brand-page) text-(--brand-ink)">
        <p className="text-sm font-medium text-(--brand-muted)">
          Checking access...
        </p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex h-dvh items-center justify-center bg-(--brand-page) px-6 text-(--brand-ink)">
        <section className="max-w-md rounded-3xl border border-(--brand-border) bg-(--brand-surface-glass) px-6 py-8 text-center shadow-lg backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--brand-primary)">
            Admin access
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">Sign in to continue</h1>
          <p className="mt-3 text-sm leading-6 text-(--brand-muted)">
            This page is only available to signed-in admin users.
          </p>
          <SignInButton>
            <button
              type="button"
              className="mt-6 rounded-full bg-(--brand-primary) px-5 py-2.5 text-sm font-bold text-(--brand-on-primary) transition active:scale-95"
            >
              Log in
            </button>
          </SignInButton>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex h-dvh items-center justify-center bg-(--brand-page) px-6 text-(--brand-ink)">
        <section className="max-w-md rounded-3xl border border-(--brand-border) bg-(--brand-surface-glass) px-6 py-8 text-center shadow-lg backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--brand-primary)">
            Admin access
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">You are not an admin</h1>
          <p className="mt-3 text-sm leading-6 text-(--brand-muted)">
            This page is reserved for admin users. If you think this is a
            mistake, go back to the home page and sign in with an admin account.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="mt-6 rounded-full bg-(--brand-primary) px-5 py-2.5 text-sm font-bold text-(--brand-on-primary) transition active:scale-95"
          >
            Go back home
          </button>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center bg-(--brand-page) text-(--brand-ink)">
        <p className="text-sm font-medium text-(--brand-muted)">
          Loading admin data...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center bg-(--brand-page) px-6 text-(--brand-ink)">
        <section className="max-w-md rounded-3xl border border-(--brand-border) bg-(--brand-surface-glass) px-6 py-8 text-center shadow-lg backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--brand-primary)">
            Admin page
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">
            Could not load admin data
          </h1>
          <p className="mt-3 text-sm leading-6 text-(--brand-muted)">
            Please try again in a moment. If this keeps happening, you may not
            have access to this page.
          </p>
        </section>
      </main>
    );
  }

  return (
    <>
      <AddWorkoutPage workoutData={data} />
    </>
  );
}
