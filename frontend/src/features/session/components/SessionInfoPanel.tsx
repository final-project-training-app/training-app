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
  const isSuite = panel === "suite";

  const trainingSuite = [
    { day: "Onsdag 6 maj", activity: "Axelrullningar" },
    { day: "Tisdag 5 maj", activity: "Knälyft" },
    { day: "Måndag 4 maj", activity: "Huvudvrid" },
    { day: "Söndag 3 maj", activity: "Tåsträck" },
    { day: "Lördag 2 maj", activity: "Ljumskstretch" },
    { day: "Fredag 1 maj", activity: "Höftstretch" },
    { day: "Torsdag 30 april", activity: "Benlyft" },
    { day: "Onsdag 29 april", activity: "Vristcirkel" },
  ];

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-10 flex items-start justify-center bg-(--brand-overlay) px-6 pt-16 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <section
        className="pointer-events-auto relative max-h-[70dvh] w-full max-w-82.5 overflow-hidden border border-(--brand-panel-border) bg-(--brand-surface-soft) p-6 text-(--brand-primary) shadow-[0_18px_40px_var(--brand-shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto absolute right-3 top-3 rounded-full p-2"
          aria-label="Stäng information"
        >
          <X size={24} />
        </button>

        {isSuite ? (
          <>
            <h2 className="mb-5 pr-8 text-4xl font-extrabold">Träningssvit</h2>

            <div className="space-y-5 text-xl font-semibold leading-tight">
              <section>
                <h3 className="font-extrabold">Nuvarande svit:</h3>
                <p>12 dagar</p>
              </section>

              <div className="pointer-events-auto max-h-64 space-y-3 overflow-y-auto pr-2">
                {trainingSuite.map((item) => (
                  <p
                    key={`${item.day}-${item.activity}`}
                    className="flex flex-col gap-0.5"
                  >
                    <span className="font-extrabold">{item.day}</span>
                    <span>{item.activity}</span>
                  </p>
                ))}
              </div>
            </div>
          </>
        ) : isExercise ? (
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
              <p>
                Övningen kommer pågå under {session.durationSeconds} sekunder.
              </p>
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
