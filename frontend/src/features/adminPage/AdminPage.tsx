import { SignInButton, useAuth } from "@clerk/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import FeedbackAdminPage from "./FeedbackAdminPage";
import MainWorkoutPage from "./MainWorkoutPage";
import TrainerAdminPage from "./TrainerAdminPage";
import { useAdminPage } from "../../hooks/useAdminPage";
import { useMyProfile } from "../../hooks/useMyProfile";

type AdminTab = "workouts" | "trainers" | "feedback";

export default function AdminPage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const isAdmin = profile?.isAdmin === true;
  const { isLoading, error } = useAdminPage(isAdmin);
  const path =
    typeof window !== "undefined" ? window.location.pathname : "/admin";
  const initialTab: AdminTab = path.endsWith("/trainers")
    ? "trainers"
    : path.endsWith("/feedback")
      ? "feedback"
      : "workouts";
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

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
      <header className="border-b border-(--brand-border) bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--brand-primary)">
              Admin Console
            </p>
            <h1 className="text-2xl font-extrabold">Manage Training App</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="rounded-full border border-(--brand-border) bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Back Home
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-(--brand-border) bg-white px-3 py-3">
          <button
            onClick={() => {
              setActiveTab("workouts");
              navigate({ to: "/admin/workouts" });
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "workouts"
                ? "bg-(--brand-primary) text-(--brand-on-primary)"
                : "bg-(--brand-surface-glass) text-(--brand-muted)"
            }`}
          >
            Workouts
          </button>

          <button
            onClick={() => {
              setActiveTab("trainers");
              navigate({ to: "/admin/trainers" });
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "trainers"
                ? "bg-(--brand-primary) text-(--brand-on-primary)"
                : "bg-(--brand-surface-glass) text-(--brand-muted)"
            }`}
          >
            Trainers
          </button>

          <button
            onClick={() => {
              setActiveTab("feedback");
              navigate({ to: "/admin/feedback" });
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "feedback"
                ? "bg-(--brand-primary) text-(--brand-on-primary)"
                : "bg-(--brand-surface-glass) text-(--brand-muted)"
            }`}
          >
            Feedback
          </button>
        </div>

        {activeTab === "workouts" && (
          <MainWorkoutPage onSwitchTab={setActiveTab} />
        )}
        {activeTab === "trainers" && <TrainerAdminPage />}
        {activeTab === "feedback" && <FeedbackAdminPage />}
      </div>
    </main>
  );
}
