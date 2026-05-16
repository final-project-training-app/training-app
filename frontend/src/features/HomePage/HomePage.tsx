import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Phone, Settings } from "lucide-react";
import { primeSessionAudio } from "../ai-conversation/audio/sessionAudio";
import { startRingback } from "../ai-conversation/audio/ringback";
import type { BackendWorkoutResponse } from "../ai-conversation/tools/workout/workoutTypes";
import { coachCallSessionQueryOptions } from "../session/query";
import { SignInButton, SignOutButton, useAuth } from "@clerk/react";
import SettingsModalSheet from "./components/SettingsModalSheet";
import { useMyProfile } from "../../hooks/useMyProfile";
import { getJson } from "../../lib/api/fetcher";
import useCurrentWorkout from "../../hooks/useCurrentWorkout";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_TRAINER_ID,
  getStoredTrainerId,
  setStoredTrainerId,
} from "./trainerPreference";

const assets = {
  background: "/start-page/background.webp",
  logo: "/start-page/logo.png",
};

const GUEST_USER_ID = 1;

type BackendUserWorkoutProfile = {
  trainerId: number | null;
  intensityLevel: number | null;
};

const homepageTrainers: Record<number, { name: string; image: string }> = {
  1: {
    name: "Eva",
    image: "/start-page/eva-start.webp",
  },
  2: {
    name: "Lunken",
    image: "/start-page/lunken-start.webp",
  },
  3: {
    name: "Jerry",
    image: "/start-page/jerry-start.webp",
  },
  4: {
    name: "Elizabeth",
    image: "/start-page/elizabeth-start.webp",
  },
  6: {
    name: "Ayesha",
    image: "/start-page/ayesha-start.webp",
  },
  7: {
    name: "Arjun",
    image: "/start-page/arjun-start.webp",
  },
  8: {
    name: "Axmed",
    image: "/start-page/axmed-start.webp",
  },
};

function getHomepageTrainer(trainerId?: number | null) {
  if (typeof trainerId === "number" && homepageTrainers[trainerId]) {
    return homepageTrainers[trainerId];
  }

  return homepageTrainers[DEFAULT_TRAINER_ID];
}

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [cachedTrainerId, setCachedTrainerId] = useState<number | null>(() =>
    getStoredTrainerId(),
  );
  const [guestWorkoutId, setGuestWorkoutId] = useState<string | null>(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { data: profile } = useMyProfile();
  const { currentWorkout } = useCurrentWorkout();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof profile?.trainerId !== "number") {
      return;
    }
    // Avoid synchronous cascading renders by only updating state when it differs
    if (profile.trainerId === cachedTrainerId) return;

    queueMicrotask(() => {
      setCachedTrainerId(profile.trainerId);
      setStoredTrainerId(profile.trainerId);
    });
  }, [profile?.trainerId, cachedTrainerId]);

  const activeTrainerId = !isLoaded
    ? (cachedTrainerId ?? DEFAULT_TRAINER_ID)
    : isSignedIn
      ? (profile?.trainerId ?? cachedTrainerId ?? DEFAULT_TRAINER_ID)
      : DEFAULT_TRAINER_ID;
  const selectedWorkoutId = isSignedIn
    ? (currentWorkout ?? "1")
    : (guestWorkoutId ?? "1");

  const activeTrainer = getHomepageTrainer(activeTrainerId);

  useEffect(() => {
    if (!isLoaded || isSignedIn) {
      return;
    }

    void (async () => {
      try {
        const [guestProfile, workouts] = await Promise.all([
          getJson<BackendUserWorkoutProfile>(`/api/users/${GUEST_USER_ID}`),
          getJson<BackendWorkoutResponse[]>(`/api/workouts`),
        ]);

        const matchingWorkout = workouts.find(
          (workout) =>
            workout.trainer?.id === guestProfile.trainerId &&
            Number(workout.level) === guestProfile.intensityLevel,
        );

        setGuestWorkoutId(
          matchingWorkout?.id ? String(matchingWorkout.id) : "1",
        );
      } catch (error) {
        console.warn("[HomePage] Guest workout fallback failed", error);
        setGuestWorkoutId("1");
      }
    })();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    void (async () => {
      const token = isSignedIn ? await getToken() : null;

      // Keep AI conversation aligned with the workout selected from user level/trainer.
      await queryClient.prefetchQuery(
        coachCallSessionQueryOptions(selectedWorkoutId, token),
      );
    })();
  }, [getToken, isLoaded, isSignedIn, queryClient, selectedWorkoutId]);

  async function primeMicrophonePermission() {
    if (!navigator.mediaDevices?.getUserMedia) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.warn("[HomePage] Microphone permission prime failed", error);
    }
  }

  async function handleStartCall() {
    startRingback();
    void primeSessionAudio();
    void primeMicrophonePermission();

    navigate({
      to: "/session/$workoutId",
      params: { workoutId: selectedWorkoutId },
    });
  }

  return (
    <div className="home-stage relative h-full w-full overflow-hidden bg-[#f7f2ff] text-[#221447]">
      {/* Auth / admin layer - stays inside the shared app stage */}
      <div className="absolute right-[var(--home-auth-right)] top-[var(--home-auth-top)] z-50">
        {!isLoaded ? null : isSignedIn ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            {profile?.isAdmin && (
              <button
                onClick={() =>
                  navigate({
                    to: "/admin/workouts",
                  })
                }
                className="rounded-full bg-(--brand-primary) px-4 py-2.5 text-sm font-bold text-(--brand-on-primary) shadow-sm transition active:scale-95"
              >
                {t("admin.page")}
              </button>
            )}

            <SignOutButton>
              <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2.5 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
                {t("auth.logout")}
              </button>
            </SignOutButton>
          </div>
        ) : (
          <SignInButton>
            <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-3.5 py-2 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
              {t("auth.login")}
            </button>
          </SignInButton>
        )}
      </div>

      {/* Background inside phone stage */}
      <img
        src={assets.background}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-95"
      />

      <div className="absolute inset-0 z-[1]" />

      {/* Logo - locked position */}
      <div className="home-stage-logo pointer-events-none absolute left-1/2 z-[2] -translate-x-1/2">
        <img
          src={assets.logo}
          alt={t("home.logoAlt")}
          className="h-auto w-full object-contain"
        />
      </div>

      {/* Trainer - locked relation to logo */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        <div className="home-stage-trainer-glow absolute left-1/2 -translate-x-1/2 rounded-full bg-white/20 blur-[44px]" />

        <img
          src={activeTrainer.image}
          alt={activeTrainer.name}
          className="home-stage-trainer-image absolute left-1/2 -translate-x-1/2 object-contain"
        />
      </div>

      {/* Buttons background */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[15]">
        <div
          className={`app-shell-footer-surface absolute bottom-0 left-0 right-0 rounded-t-3xl ${
            isLoaded && isSignedIn
              ? "h-[var(--home-footer-height-auth)]"
              : "h-[var(--home-footer-height)]"
          }`}
        />
      </div>

      {/* Buttons */}
      <footer className="absolute inset-x-[var(--stage-inline-pad)] bottom-[var(--home-footer-bottom)] z-20 flex flex-col items-center gap-[var(--home-footer-gap)]">
        <button
          type="button"
          onClick={() => {
            void handleStartCall();
          }}
          className="flex min-h-[var(--home-cta-min-height)] w-full items-center justify-center gap-3 rounded-2xl bg-[#5b3fd6] px-6 py-4 text-lg font-extrabold text-white transition active:scale-[0.98]"
        >
          <Phone size={22} strokeWidth={2.5} />
          {t("home.callTrainer")}
        </button>

        {isLoaded && isSignedIn ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-(--brand-border-strong) bg-(--brand-surface-raised) px-4 py-2 text-sm font-bold text-(--brand-primary) backdrop-blur-sm transition active:scale-[0.98]"
          >
            <Settings size={16} strokeWidth={2.2} />
            {t("home.settings")}
          </button>
        ) : null}
      </footer>

      {isLoaded && isSignedIn ? (
        <SettingsModalSheet open={open} setOpen={setOpen} />
      ) : null}
    </div>
  );
}
