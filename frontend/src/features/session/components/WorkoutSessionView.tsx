import type { WorkoutSessionData } from "../types";
import { SessionCoachHero } from "./SessionCoachHero";
import { SessionStatus } from "./SessionStatus";
import { SessionControlGrid } from "./SessionControlGrid";
import { SessionCallButton } from "./SessionCallButton";

type WorkoutSessionViewProps = {
  session: WorkoutSessionData;
  elapsedSeconds: number;
  durationSeconds: number;
  isPlaying: boolean;
  onStartCall: () => void;
};

export function WorkoutSessionView({
  session,
  elapsedSeconds,
  durationSeconds,
  isPlaying,
  onStartCall,
}: WorkoutSessionViewProps) {
  return (
    <main className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_#f7f2ff_0%,_#ffffff_58%)]">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col justify-between px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))]">
        <div>
          <SessionCoachHero
            coachName={session.coachName}
            avatarUrl={session.avatarUrl}
          />

          <SessionStatus
            title={session.coachName}
            elapsedSeconds={elapsedSeconds}
          />

          <SessionControlGrid durationSeconds={durationSeconds} />
        </div>

        <SessionCallButton isPlaying={isPlaying} onClick={onStartCall} />
      </div>
    </main>
  );
}
