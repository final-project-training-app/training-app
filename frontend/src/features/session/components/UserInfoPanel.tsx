import { Activity, MessageSquareText, UserRound } from "lucide-react";
import type { CoachCallSession } from "../types";

type UserInfoPanelProps = {
  session: CoachCallSession;
};

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-[#f4efff] px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-[#5b3fd6]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
          {icon}
        </div>

        <p className="text-sm font-extrabold uppercase tracking-wide">
          {label}
        </p>
      </div>

      {children}
    </div>
  );
}

export function UserInfoPanel({ session }: UserInfoPanelProps) {
  const name = session.userName?.trim() || "Användare";

  const intensity =
    typeof session.intensityLevel === "number"
      ? `Nivå ${session.intensityLevel}`
      : "Ej valt";

  const context =
    session.context?.trim() || "Ingen träningskontext sparad ännu.";

  return (
    <div className="space-y-4">
      <InfoCard label="Namn" icon={<UserRound size={20} strokeWidth={2.4} />}>
        <p className="text-lg font-extrabold leading-snug text-[#100b2f]">
          {name}
        </p>
      </InfoCard>

      <InfoCard
        label="Intensitet"
        icon={<Activity size={20} strokeWidth={2.4} />}
      >
        <p className="text-lg font-extrabold leading-snug text-[#100b2f]">
          {intensity}
        </p>
      </InfoCard>

      <InfoCard
        label="Träningskontext"
        icon={<MessageSquareText size={20} strokeWidth={2.4} />}
      >
        <p className="whitespace-pre-line text-[15px] font-semibold leading-relaxed text-[#33295e]">
          {context}
        </p>
      </InfoCard>
    </div>
  );
}
