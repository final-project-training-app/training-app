import { SignInButton, useAuth } from "@clerk/react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminPage } from "../../hooks/useAdminPage";
import { useMyProfile } from "../../hooks/useMyProfile";
type AdminTab = "workouts" | "trainers" | "feedback";

import { useState } from "react";
import MainWorkoutPage from "./MainWorkoutPage";
import TrainerAdminPage from "./TrainerAdminPage";
import FeedbackAdminPage from "./FeedbackAdminPage";

export default function AdminPage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const isAdmin = profile?.isAdmin === true;
  const { isLoading, error } = useAdminPage(isAdmin);
  const [activeTab, setActiveTab] = useState<AdminTab>("workouts");

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
    <main className="flex min-h-dvh flex-col bg-(--brand-page) text-(--brand-ink)">
      <header className="border-b border-(--brand-border) bg-(--brand-surface-glass)">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--brand-primary)">
                Admin Console
              </p>
              <h1 className="text-2xl font-extrabold">Manage Training App</h1>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="rounded-full border border-(--brand-border) bg-white px-4 py-2 text-sm font-semibold"
            >
              Back Home
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === "workouts"
                  ? "bg-(--brand-primary) text-(--brand-on-primary)"
                  : "bg-white text-(--brand-muted)"
              }`}
            >
              Workouts
            </button>

            <button
              onClick={() => setActiveTab("trainers")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === "trainers"
                  ? "bg-(--brand-primary) text-(--brand-on-primary)"
                  : "bg-white text-(--brand-muted)"
              }`}
            >
              Trainers
            </button>

            <button
              onClick={() => setActiveTab("feedback")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === "feedback"
                  ? "bg-(--brand-primary) text-(--brand-on-primary)"
                  : "bg-white text-(--brand-muted)"
              }`}
            >
              User Feedback
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 p-6">
        {activeTab === "workouts" && <MainWorkoutPage />}
        {activeTab === "trainers" && <TrainerAdminPage />}
        {activeTab === "feedback" && <FeedbackAdminPage />}
      </div>
    </main>
  );
}
