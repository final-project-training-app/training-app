import { X } from "lucide-react";
import type { ReactNode } from "react";

type AppSheetProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  height?: "compact" | "default" | "large";
};

const maxHeightClass = {
  compact: "max-h-[58%]",
  default: "max-h-[76%]",
  large: "max-h-[92%]",
};

export function AppSheet({
  open,
  title,
  subtitle,
  icon,
  children,
  onClose,
  height = "default",
}: AppSheetProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={[
          "absolute inset-0 z-40 bg-[#221447]/18 backdrop-blur-[3px]",
          "transition-opacity duration-200 ease-out",
          open
            ? "opacity-100 motion-safe:animate-[app-backdrop-in_220ms_ease-out_both]"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <section
        className={[
          "absolute inset-x-0 bottom-0 z-50 w-full",
          "overflow-hidden rounded-t-[2rem] bg-[#fbf8ff]",
          "shadow-[0_-18px_60px_rgba(55,38,110,0.20)]",
          "will-change-transform",
          "transition-[transform,opacity] duration-200 ease-out",
          maxHeightClass[height],
          open
            ? "opacity-100 motion-safe:animate-[app-sheet-in_320ms_cubic-bezier(0.22,1,0.36,1)_both]"
            : "pointer-events-none translate-y-full opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-[#c8bfeb]" />

        <div className="flex max-h-[inherit] flex-col px-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.25rem))] pt-4">
          <header className="flex shrink-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[#5b3fd6]">
                {icon ? (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f0e9ff]">
                    {icon}
                  </div>
                ) : null}

                <h2 className="text-[28px] font-extrabold leading-none tracking-tight text-[#281d7a]">
                  {title}
                </h2>
              </div>

              {subtitle ? (
                <p className="mt-1.5 text-[14px] font-semibold leading-snug text-[#6f6a93]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e9ff] text-[#5b3fd6] transition active:scale-95"
              aria-label="Stäng"
            >
              <X size={21} strokeWidth={2.4} />
            </button>
          </header>

          <div className="mt-4 min-h-0 overflow-y-auto pr-1">{children}</div>
        </div>
      </section>
    </>
  );
}

export function AppSheetCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-[#e3d9ff] bg-[#f5f2fb] p-4">
      {children}
    </div>
  );
}

export function AppSheetLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#6f6a93]">
      {children}
    </p>
  );
}

export function AppSheetValue({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-[17px] font-extrabold leading-snug text-[#221447]">
      {children}
    </p>
  );
}
