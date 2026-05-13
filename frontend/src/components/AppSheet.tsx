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

const heightClass = {
  compact: "h-[58dvh]",
  default: "h-[74dvh]",
  large: "h-[84dvh]",
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
          "fixed inset-0 z-40 bg-[#221447]/18 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <section
        className={[
          "fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 overflow-hidden rounded-t-[2rem] bg-[#fbf8ff] shadow-[0_-18px_60px_rgba(55,38,110,0.20)] transition-transform duration-300",
          heightClass[height],
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-[#c8bfeb]" />

        <div className="flex h-full flex-col px-5 pb-6 pt-5">
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[#5b3fd6]">
                {icon ? (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f0e9ff]">
                    {icon}
                  </div>
                ) : null}

                <h2 className="text-[30px] font-extrabold leading-none tracking-tight text-[#281d7a]">
                  {title}
                </h2>
              </div>

              {subtitle ? (
                <p className="mt-2 text-[14px] font-semibold leading-snug text-[#6f6a93]">
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

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
            {children}
          </div>
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
