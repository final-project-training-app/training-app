import { Show, SignInButton, SignOutButton } from "@clerk/react";
import { useNavigate } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import SettingsModalSheet from "./components/SettingsModalSheet";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-[#f8f4ff] via-[#f5efff] to-[#efe9fb] px-4 py-8">
      <Show when="signed-in">
        <div className="absolute right-4 top-4">
          <SignOutButton>
            <button className="rounded-full border border-[#d4c4f4] bg-white/85 px-10 py-8 text-base font-semibold text-[#4d2a7a] shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 active:scale-[0.98] active:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#f8f4ff]">
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
            onClick={() => {
              if (!open) setOpen(true);
              else setOpen(false);
            }}
          >
            <Settings size={20} className="text-[#6b4b91]" />
            Inställningar
          </button>
        </Show>

        <Show when="signed-out">
          <SignInButton>
            <button className="rounded-2xl border border-[#d4c4f4] bg-white/85 px-8 py-4 text-xl font-semibold text-[#4d2a7a] shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#f8f4ff]">
              Logga in
            </button>
          </SignInButton>
        </Show>
        {open && <SettingsModalSheet />}
      </div>
    </main>
  );
}
