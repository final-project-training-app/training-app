import type { CoachCallSession } from "../types";

type ExercisePanelProps = {
  session: CoachCallSession;
};

export function ExercisePanel({ session }: ExercisePanelProps) {
  return (
    <div className="space-y-5 text-xl font-semibold leading-tight">
      <p>{session.instructions}</p>

      {session.durationSeconds > 0 ? (
        <p>Övningen kommer pågå under {session.durationSeconds} sekunder.</p>
      ) : null}
    </div>
  );
}
