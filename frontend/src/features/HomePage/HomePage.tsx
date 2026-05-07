import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Phone, Settings } from "lucide-react";
import coachHeroImage from "../../assets/image.png";
import { startSessionAudio } from "../session/audio";
import { coachCallSessionQueryOptions } from "../session/query";
import type { CoachCallSession } from "../session/types";
import { Show, SignInButton, SignOutButton } from "@clerk/react";
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
      <div className="absolute right-3 top-[max(10px,env(safe-area-inset-top))] z-30">
        <Show when="signed-in">
          <SignOutButton>
            <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2.5 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
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

      <section className="flex h-full w-full max-w-[36rem] flex-col px-5 pt-[max(2px,env(safe-area-inset-top))] pb-[max(26px,env(safe-area-inset-bottom))] [@media(max-height:700px)]:pb-[max(18px,env(safe-area-inset-bottom))]">
        <div className="flex min-h-0 flex-[1.55] items-start justify-center overflow-hidden pt-0">
          <img
            src={coachHeroImage}
            alt="Träningsapp"
            className="h-full w-full origin-top scale-[1.24] object-contain object-top drop-shadow-[0_16px_28px_var(--brand-image-shadow)] [@media(max-height:700px)]:scale-[1.12]"
          />
        </div>

        <div className="relative z-10 flex w-full flex-none flex-col items-stretch gap-4 px-1 pt-1 [@media(max-height:700px)]:gap-3">
          <button
            type="button"
            onClick={() => {
              void handleStartCall();
            }}
            className="flex min-h-18 w-full items-center justify-center gap-4 rounded-2xl bg-(--brand-primary) px-7 text-[1.4rem] font-extrabold text-(--brand-on-primary) shadow-[0_14px_24px_var(--brand-shadow)] transition active:scale-[0.98] [@media(max-height:700px)]:min-h-15 [@media(max-height:700px)]:text-[1.2rem]"
          >
            <Phone size={30} strokeWidth={2.65} />
            Ring tränaren
          </button>

          <Show when="signed-in">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex min-h-15 w-[84%] items-center justify-center gap-3 self-center rounded-xl border-2 border-(--brand-border-strong) bg-(--brand-surface-raised) px-5 text-[1.08rem] font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-[0.98] [@media(max-height:700px)]:min-h-12"
            >
              <Settings size={20} strokeWidth={2.55} />
              Inställningar
            </button>
          </Show>
        </div>
        <Show when="signed-in">
          <SettingsModalSheet open={open} setOpen={setOpen} />
        </Show>
      </section>
    </main>
  );
}
