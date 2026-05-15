import { Gauge, MessageSquareText, UserRound } from "lucide-react";
import type { CoachCallSession } from "../types";
import { useMyProfile } from "../../../hooks/useMyProfile";
import {
  AppSheetCard,
  AppSheetLabel,
  AppSheetValue,
} from "../../../components/AppSheet";

type UserInfoPanelProps = {
  session: CoachCallSession;
};

export function UserInfoPanel({ session }: UserInfoPanelProps) {
  const { data: profile } = useMyProfile();

  const displayName = profile?.name ?? session.userName ?? "-";
  const displayIntensity =
    typeof profile?.intensityLevel === "number"
      ? profile.intensityLevel
      : session.intensityLevel;
  const displayContext = profile?.context ?? session.context ?? "-";

  return (
    <div className="space-y-3">
      <AppSheetCard>
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b3fd6]">
            <UserRound size={22} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <AppSheetLabel>Namn</AppSheetLabel>
            <AppSheetValue>{displayName}</AppSheetValue>
          </div>
        </div>
      </AppSheetCard>

      <AppSheetCard>
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b3fd6]">
            <Gauge size={22} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <AppSheetLabel>Intensitet</AppSheetLabel>
            <AppSheetValue>
              {typeof displayIntensity === "number"
                ? `Nivå ${displayIntensity}`
                : "-"}
            </AppSheetValue>
          </div>
        </div>
      </AppSheetCard>

      <AppSheetCard>
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b3fd6]">
            <MessageSquareText size={22} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <AppSheetLabel>Kontext</AppSheetLabel>

            <p className="mt-2 whitespace-pre-line text-[15px] font-semibold leading-relaxed text-[#33295e]">
              {displayContext}
            </p>
          </div>
        </div>
      </AppSheetCard>
    </div>
  );
}