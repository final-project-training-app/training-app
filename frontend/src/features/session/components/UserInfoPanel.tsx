import type { CoachCallSession } from "../types";
import { SessionPanelSection } from "./SessionPanelSection";

type UserInfoPanelProps = {
  session: CoachCallSession;
};

export function UserInfoPanel({ session }: UserInfoPanelProps) {
  return (
    <div className="space-y-5 text-xl font-semibold leading-tight">
      <SessionPanelSection title="Namn:">
        <p>{session.userName}</p>
      </SessionPanelSection>

      <SessionPanelSection title="Intensitet:">
        <p>Nivå {session.intensityLevel}</p>
      </SessionPanelSection>

      <SessionPanelSection title="Träningskontext:">
        <p>{session.context}</p>
      </SessionPanelSection>
    </div>
  );
}
