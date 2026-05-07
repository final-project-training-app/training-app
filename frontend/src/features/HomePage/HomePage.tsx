import { Show, SignInButton, SignOutButton } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import SettingsModalSheet from "./components/SettingsModalSheet";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <main className="relative flex h-dvh items-center justify-center overflow-hidden bg-(--brand-page) text-(--brand-ink)">
      <div className="absolute right-3 top-[max(10px,env(safe-area-inset-top))] z-10">
        <Show when="signed-in">
          <SignOutButton>
            <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-3.5 py-2 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
              Logga ut
            </button>
          </SignOutButton>
        </div>
      </Show>

      <div className="pt-12">
        <img
          src="/src/assets/image.png"
          alt="Profile"
          className="object-cover shadow-md"
        />
      </div>

      <div className="flex-1" />

      <div className="mb-8 flex w-full max-w-md flex-col items-stretch gap-4">
        <button
          type="button"
          onClick={() =>
            navigate({ to: "/session/$workoutId", params: { workoutId: "1" } })
          }
          className="rounded-3xl bg-[#5a2d82] px-10 py-10 text-4xl font-extrabold text-white shadow-xl shadow-[#5a2d82]/25 transition-all duration-200 hover:-translate-y-1 hover:bg-[#6a3893] hover:shadow-2xl active:translate-y-1 active:scale-[0.99] active:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#f8f4ff]"
        >
          Träna
        </button>

        <Show when="signed-in">
          <button
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/70 px-7 py-3.5 text-lg font-semibold text-[#4d2a7a] shadow-sm ring-1 ring-[#d4c4f4]/60 transition-all duration-150
    hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md
    active:scale-[0.96] active:bg-[#d8c6ff] active:ring-[#8b5cf6]
    focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#f8f4ff]"
            onClick={() => setOpen(!open)}
          >
            <Settings size={20} className="text-[#6b4b91]" />
            Inställningar
          </button>
        </Show>

        <Show when="signed-out">
          <SignInButton>
            <button className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-3.5 py-2 text-sm font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-95">
              Logga in
            </button>
          </SignInButton>
        </Show>
        <SettingsModalSheet open={open} setOpen={setOpen} />
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
            aria-disabled="true"
            className="flex min-h-12 w-[70%] items-center justify-center gap-2.5 self-center rounded-lg border-2 border-(--brand-border-strong) bg-(--brand-surface-raised) px-5 text-base font-bold text-(--brand-primary) shadow-sm backdrop-blur-sm transition active:scale-[0.98] [@media(max-height:700px)]:min-h-10"
          >
            <Settings size={20} strokeWidth={2.55} />
            Inställningar
          </button>
        </div>
      </section>
    </main>
  );
}
