import { X } from "lucide-react";
import type { CoachCallSession, SessionPanel } from "../types";

type SessionInfoPanelProps = {
  session: CoachCallSession;
  panel: Exclude<SessionPanel, "none">;
  onClose: () => void;
};

export function SessionInfoPanel({
  session,
  panel,
  onClose,
}: SessionInfoPanelProps) {
  const isExercise = panel === "exercise";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/45 px-6 pt-16 backdrop-blur-[2px]">
      <section className="pointer-events-none relative w-full max-w-82.5 border border-[#5340d3]/35 bg-[#fbf8ff]/95 p-6 text-[#5340d3] shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto absolute right-3 top-3 rounded-full p-2"
          aria-label="Stäng information"
        >
          <X size={24} />
        </button>

        {isExercise ? (
          <>
            <h2 className="mb-4 pr-8 text-4xl font-extrabold">
              {session.exerciseTitle}
            </h2>

            {session.exerciseImageUrl ? (
              <img
                src={session.exerciseImageUrl}
                alt={session.exerciseTitle}
                className="mb-4 h-40 w-full object-contain"
              />
            ) : null}

            <div className="space-y-5 text-xl font-semibold leading-tight">
              <p>{session.exerciseDescription}</p>
              <p>Övningen kommer pågå under {session.durationSeconds} sekunder.</p>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-5 pr-8 text-4xl font-extrabold">
              {session.userName}
            </h2>

            <div className="space-y-5 text-xl font-semibold leading-tight">
              <section>
                <h3 className="font-extrabold">Intensitet:</h3>
                <p>{session.intensityLabel}</p>
              </section>

              <section>
                <h3 className="font-extrabold">Träningskontext:</h3>
                <p>{session.trainingContext}</p>
              </section>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
