import type { ReactNode } from "react";

type SessionControlButtonProps = {
  icon: ReactNode;
  label: string;
};

export function SessionControlButton({
  icon,
  label,
}: SessionControlButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#f4efff] text-indigo-700 shadow-[inset_0_0_0_1px_rgba(83,64,211,0.03)] sm:h-[86px] sm:w-[86px]">
        {icon}
      </div>
      <span className="text-center text-[1rem] font-medium leading-tight text-slate-900">
        {label}
      </span>
    </div>
  );
}
