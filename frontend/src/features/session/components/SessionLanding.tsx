import { Phone, Settings } from "lucide-react";
import type { CoachCallSession } from "../types";

type SessionLandingProps = {
  session: CoachCallSession;
  onStart: () => void;
};

export function SessionLanding({ session, onStart }: SessionLandingProps) {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#c7c1dd]">
      <h1 className="sr-only">{session.title}</h1>

      {session.coachImageUrl ? (
        <>
          <img
            src={session.coachImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-35 blur-xl"
            aria-hidden="true"
          />
          <img
            src={session.coachImageUrl}
            alt={session.title}
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center text-[#5340d3]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-current text-4xl font-bold">
            +
          </div>
          <p className="text-4xl font-extrabold text-slate-950">
            {session.title}
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-96 space-y-3 px-7 pb-[max(24px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onStart}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5340d3] px-6 py-4 text-xl font-bold text-white shadow-[0_10px_22px_rgba(83,64,211,0.28)]"
        >
          <Phone size={28} />
          Ring tränaren
        </button>

        <button
          type="button"
          className="mx-auto flex min-w-38 items-center justify-center gap-3 rounded-lg border-2 border-[#5340d3] bg-white/80 px-6 py-3 font-bold text-[#5340d3] backdrop-blur-sm"
        >
          <Settings size={22} />
          Inställningar
        </button>
      </div>
    </main>
  );
}
