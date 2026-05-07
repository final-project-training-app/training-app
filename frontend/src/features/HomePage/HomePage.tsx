import { Show, SignInButton, SignOutButton } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Phone, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import coachHeroImage from "../../assets/image.png";
import { startSessionAudio } from "../session/audio";
import { coachCallSessionQueryOptions } from "../session/query";
import type { CoachCallSession } from "../session/types";
import SettingsModalSheet from "./components/SettingsModalSheet";

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void queryClient.prefetchQuery(coachCallSessionQueryOptions("1"));
  }, [queryClient]);

  async function handleStartCall() {
    const queryOptions = coachCallSessionQueryOptions("1");
    const cachedSession = queryClient.getQueryData<CoachCallSession>(
      queryOptions.queryKey,
    );
    const session =
      cachedSession ??
      (await queryClient.fetchQuery(queryOptions).catch(() => null));

    if (session?.workoutAudioUrl) {
      void startSessionAudio(session.workoutAudioUrl).catch(() => {
        // SessionPage will make one more attempt if the browser still blocks playback here.
      });
    }

    navigate({
      to: "/session/$workoutId",
      params: { workoutId: "1" },
    });
  }

  return (
    <main className="relative flex h-dvh items-center justify-center overflow-hidden bg-(--brand-page) text-(--brand-ink)">
      <div className="absolute right-3 top-[max(10px,env(safe-area-inset-top))] z-10">
        <Show when="signed-in">
          <SignOutButton>
            <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-3.5 py-2 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
              Logga ut
            </button>
          </SignOutButton>
        </Show>

        <Show when="signed-out">
          <SignInButton>
            <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-3.5 py-2 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
              Logga in
            </button>
          </SignInButton>
        </Show>
      </div>

      <section className="flex h-full w-full max-w-107.5 flex-col px-0 pt-[max(4px,env(safe-area-inset-top))] pb-[max(34px,env(safe-area-inset-bottom))] [@media(max-height:700px)]:pb-[max(22px,env(safe-area-inset-bottom))]">
        <div className="flex min-h-0 flex-1 items-end justify-center overflow-hidden">
          <img
            src={coachHeroImage}
            alt="Träningsapp"
            className="h-full w-full origin-bottom scale-[1.04] object-contain object-bottom drop-shadow-[0_16px_28px_var(--brand-image-shadow)] [@media(max-height:700px)]:scale-100"
          />
        </div>

        <div className="relative z-10 flex w-full flex-none flex-col items-stretch gap-3 px-4 pt-2 [@media(max-height:700px)]:gap-2.5 [@media(max-height:700px)]:px-5 [@media(max-height:700px)]:pt-1.5">
          <button
            type="button"
            onClick={() => {
              void handleStartCall();
            }}
            className="flex min-h-15 w-full items-center justify-center gap-3.5 rounded-xl bg-(--brand-primary) px-6 text-xl font-extrabold text-(--brand-on-primary) shadow-[0_14px_24px_var(--brand-shadow)] transition active:scale-[0.98] [@media(max-height:700px)]:min-h-12 [@media(max-height:700px)]:text-lg"
          >
            <Phone size={26} strokeWidth={2.65} />
            Ring tränaren
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-12 w-[70%] items-center justify-center gap-2.5 self-center rounded-lg border-2 border-(--brand-border-strong) bg-(--brand-surface-raised) px-5 text-base font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-[0.98] [@media(max-height:700px)]:min-h-10"
          >
            <Settings size={20} strokeWidth={2.55} />
            Inställningar
          </button>
        </div>
      </section>

      <SettingsModalSheet open={open} setOpen={setOpen} />
    </main>
  );
}
