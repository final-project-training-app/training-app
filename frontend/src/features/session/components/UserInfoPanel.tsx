import type { CoachCallSession } from "../types";
import { SessionPanelSection } from "./SessionPanelSection";

type UserInfoPanelProps = {
  session: CoachCallSession;
};

export function UserInfoPanel({ session }: UserInfoPanelProps) {
  return (
    <div className="space-y-5 text-xl font-semibold leading-tight">
      <SessionPanelSection title="Intensitet:">
        <p>{session.intensityLabel}</p>
      </SessionPanelSection>

      <SessionPanelSection title="Träningskontext:">
        <p>{session.trainingContext}</p>
      </SessionPanelSection>
    </div>
  );
}
