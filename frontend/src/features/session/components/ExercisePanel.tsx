import {
  Clock3,
  Headphones,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import type { CoachCallSession } from "../types";

type ExercisePanelProps = {
  session: CoachCallSession;
};

function InstructionCard({
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

export function ExercisePanel({ session }: ExercisePanelProps) {
  const instructions =
    session.instructions?.trim() ||
    "Inga instruktioner finns sparade för detta pass ännu.";

  const durationSeconds = session.durationSeconds ?? 0;

  const tags = [
    session.lowImpact ? "Låg belastning" : null,
    session.seated ? "Kan göras sittande" : null,
    session.beginnerFriendly ? "Nybörjarvänlig" : null,
    session.kneeFriendly ? "Knävänlig" : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <InstructionCard
        label="Träningspass"
        icon={<MessageSquareText size={20} strokeWidth={2.4} />}
      >
        <p className="text-lg font-extrabold leading-snug text-[#100b2f]">
          {session.workoutName || session.name || "Dagens pass"}
        </p>

        {session.type ? (
          <p className="mt-1 text-sm font-bold text-[#6f6a93]">
            Typ: {session.type}
          </p>
        ) : null}
      </InstructionCard>

      <InstructionCard
        label="Instruktioner"
        icon={<Headphones size={20} strokeWidth={2.4} />}
      >
        <p className="whitespace-pre-line text-[15px] font-semibold leading-relaxed text-[#33295e]">
          {instructions}
        </p>
      </InstructionCard>

      {durationSeconds > 0 ? (
        <InstructionCard
          label="Tid"
          icon={<Clock3 size={20} strokeWidth={2.4} />}
        >
          <p className="text-lg font-extrabold leading-snug text-[#100b2f]">
            {durationSeconds} sekunder
          </p>
        </InstructionCard>
      ) : null}

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-[#f4efff] px-3 py-2 text-xs font-extrabold text-[#5b3fd6]"
            >
              <ShieldCheck size={15} strokeWidth={2.4} />
              {tag}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
