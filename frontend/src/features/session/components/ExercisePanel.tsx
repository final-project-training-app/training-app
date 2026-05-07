import type { CoachCallSession } from "../types";

type ExercisePanelProps = {
  session: CoachCallSession;
};

export function ExercisePanel({ session }: ExercisePanelProps) {
  return (
    <>
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
  );
}
