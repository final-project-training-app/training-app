import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Phone, Settings } from "lucide-react";
import { primeSessionAudio } from "../session/audio";
import { coachCallSessionQueryOptions } from "../session/query";
import type { CoachCallSession } from "../session/types";
import { SignInButton, SignOutButton, useAuth } from "@clerk/react";
import SettingsModalSheet from "./components/SettingsModalSheet";
import { useMyProfile } from "../../hooks/useMyProfile";

const DESIGN_WIDTH = 430;
const DESIGN_HEIGHT = 932;

const trainers = {
  eva: { name: "Eva", image: "/start-page/eva-start.webp" },
  jerry: { name: "Jerry", image: "/start-page/jerry-start.webp" },
  lunken: { name: "Lunken", image: "/start-page/lunken-start.webp" },
  elizabeth: { name: "Elizabeth", image: "/start-page/elizabeth-start.webp" },
} as const;

const activeTrainer = trainers.eva;

const assets = {
  background: "/start-page/background.webp",
  logo: "/start-page/logo.png",
};

function getStageScale() {
  if (typeof window === "undefined") return 1;

  const widthScale = window.innerWidth / DESIGN_WIDTH;
  const heightScale = window.innerHeight / DESIGN_HEIGHT;

  return Math.min(widthScale, heightScale, 1);
}

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [stageScale, setStageScale] = useState(getStageScale);
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile } = useMyProfile();

  useEffect(() => {
    function handleResize() {
      setStageScale(getStageScale());
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    void queryClient.prefetchQuery(coachCallSessionQueryOptions("1"));
  }, [isLoaded, isSignedIn, queryClient]);

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
    void primeSessionAudio();
    void primeMicrophonePermission();

    const queryOptions = coachCallSessionQueryOptions("1");
    const cachedSession = queryClient.getQueryData<CoachCallSession>(
      queryOptions.queryKey,
    );

    const session =
      cachedSession ??
      (await queryClient.fetchQuery(queryOptions).catch(() => null));

    if (!session) return;

    navigate({ to: "/session/$workoutId", params: { workoutId: "1" } });
  }

  return (
    <main className="relative flex h-[100svh] max-h-[100svh] items-center justify-center overflow-hidden bg-[#eee7fb] text-[#221447]">
      {/* Auth / admin layer - stays relative to desktop viewport */}
      <div className="fixed right-4 top-4 z-50">
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
                Admin page
              </button>
            )}

            <SignOutButton>
              <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2.5 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
                Logga ut
              </button>
            </SignOutButton>
          </div>
        ) : (
          <SignInButton>
            <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-3.5 py-2 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
              Logga in
            </button>
          </SignInButton>
        )}
      </div>

      {/* This wrapper reserves the scaled size in the page */}
      <div
        className="relative"
        style={{
          width: DESIGN_WIDTH * stageScale,
          height: DESIGN_HEIGHT * stageScale,
        }}
      >
        {/* Fixed 430x932 stage. Everything inside keeps exact proportions. */}
        <section
          className="relative h-[932px] w-[430px] origin-top-left overflow-hidden bg-[#f7f2ff] shadow-[0_0_70px_rgba(55,38,110,0.16)]"
          style={{
            transform: `scale(${stageScale})`,
          }}
        >
          {/* Background */}
          <img
            src={assets.background}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-95"
          />

          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#eadfff]/60 via-[#d9ccf4]/35 to-[#f6f3fb]/88" />

          {/* Logo - locked position */}
          <div className="pointer-events-none absolute left-1/2 top-[22px] z-[2] w-[370px] -translate-x-1/2">
            <img
              src={assets.logo}
              alt="Ring så tränar vi"
              className="h-auto w-full object-contain"
            />
          </div>

          {/* Trainer - locked relation to logo */}
          <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
            <div className="absolute left-1/2 bottom-[140px] h-[360px] w-[320px] -translate-x-1/2 rounded-full bg-white/20 blur-[44px]" />

            <img
              src={activeTrainer.image}
              alt={activeTrainer.name}
              className="absolute left-1/2 bottom-[46px] w-[465px] -translate-x-1/2 translate-y-[21%] object-contain"
            />
          </div>

          {/* Buttons - locked bottom */}
          {/* White background behind buttons: full-width anchored to bottom, above trainer but under buttons */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[15]">
            <div
              className={`absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white  ${
                isLoaded && isSignedIn ? "h-[140px]" : "h-[100px]"
              }`}
            />
          </div>

          <footer className="absolute inset-x-5 bottom-[20px] z-20 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void handleStartCall();
              }}
              className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-[#5b3fd6] px-6 py-4 text-lg font-extrabold text-white transition active:scale-[0.98]"
            >
              <Phone size={22} strokeWidth={2.5} />
              Ring tränaren
            </button>

            {isLoaded && isSignedIn ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-(--brand-border-strong) bg-(--brand-surface-raised) px-4 py-2 text-sm font-bold text-(--brand-primary) backdrop-blur-sm transition active:scale-[0.98]"
              >
                <Settings size={16} strokeWidth={2.2} />
                Inställningar
              </button>
            ) : null}
          </footer>

          {isLoaded && isSignedIn ? (
            <SettingsModalSheet open={open} setOpen={setOpen} />
          ) : null}
        </section>
      </div>
    </main>
  );
}
