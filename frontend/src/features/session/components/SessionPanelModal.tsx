import { X } from "lucide-react";
import type { ReactNode } from "react";

type SessionPanelModalProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

export function SessionPanelModal({
  title,
  subtitle,
  icon,
  onClose,
  children,
}: SessionPanelModalProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Stäng panel"
        onClick={onClose}
        className="absolute inset-0 bg-[#221447]/10 backdrop-blur-[4px]"
      />

      <section
        className="pointer-events-auto relative z-10 w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-5 text-[#221447] shadow-[0_24px_70px_rgba(55,38,110,0.22)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0e9ff] text-[#5b3fd6]">
                {icon}
              </div>
            ) : null}

            <div className="min-w-0">
              <h2 className="text-[30px] font-extrabold leading-none text-[#5b3fd6]">
                {title}
              </h2>

              {subtitle ? (
                <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#8a83aa]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e9ff] text-[#5b3fd6] transition active:scale-95"
          >
            <X size={22} strokeWidth={2.4} />
          </button>
        </header>

        <div className="max-h-[58dvh] overflow-y-auto pr-1">{children}</div>
      </section>
    </div>
  );
}
