import { X } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

export const appSheetFieldClass =
  "rounded-2xl border border-[#ddd2ff] bg-[#f5f2fb]";

export const appSheetCardClass =
  "rounded-3xl border border-[#e3d9ff] bg-[#f5f2fb] p-4";

export const appSheetPrimaryButtonClass =
  "w-full rounded-2xl bg-[#5b3fd6] px-4 py-3.5 text-[16px] font-extrabold text-white transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70";

export const appSheetSecondaryButtonClass =
  "w-full rounded-xl px-4 py-3 text-[15px] font-extrabold text-[#4d2a7a] transition active:scale-[0.985] active:bg-[#efe9fb]";

type AppSheetProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
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
  footer,
  onClose,
  height = "default",
}: AppSheetProps) {
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  function handleWheel(event: React.WheelEvent<HTMLElement>) {
    const scrollBody = scrollBodyRef.current;

    if (!scrollBody || event.deltaY === 0) {
      return;
    }

    if (event.target instanceof Element) {
      const isInsideScrollBody = event.target.closest(
        '[data-app-sheet-scroll="true"]',
      );

      if (isInsideScrollBody) {
        return;
      }
    }

    const canScrollDown =
      event.deltaY > 0 &&
      scrollBody.scrollTop + scrollBody.clientHeight < scrollBody.scrollHeight;
    const canScrollUp = event.deltaY < 0 && scrollBody.scrollTop > 0;

    if (!canScrollDown && !canScrollUp) {
      return;
    }

    event.preventDefault();
    scrollBody.scrollBy({ top: event.deltaY, behavior: "auto" });
  }

  function onTouchStart(e: React.TouchEvent) {
    if (!open) return;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartY.current == null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    // Only track downward swipes
    if (delta > 0) {
      setDragY(Math.min(delta, 400));
    }
  }

  function onTouchEnd() {
    if (touchStartY.current == null) return;
    const dragged = dragY;
    touchStartY.current = null;
    setDragY(0);
    // Close if swiped down sufficiently
    if (dragged > 120) {
      onClose();
    }
  }

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
        onWheel={handleWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={[
          "absolute inset-x-0 bottom-0 z-50 flex w-full flex-col",
          "app-sheet-surface overflow-hidden rounded-t-4xl",
          "will-change-transform",
          "transition-[transform,opacity] duration-200 ease-out",
          maxHeightClass[height],
          open
            ? "opacity-100 motion-safe:animate-[app-sheet-in_320ms_cubic-bezier(0.22,1,0.36,1)_both]"
            : "pointer-events-none translate-y-full opacity-0",
        ].join(" ")}
        style={{ transform: open ? `translateY(${dragY}px)` : undefined }}
      >
        <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-[#c8bfeb]" />

        <div className="min-h-0 flex flex-1 flex-col px-5 pb-[max(1.25rem,var(--stage-safe-bottom))] pt-4">
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

          <div
            ref={scrollBodyRef}
            data-app-sheet-scroll="true"
            className="app-sheet-scroll mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-1 touch-pan-y"
          >
            {children}
          </div>

          {footer ? (
            <div className="app-sheet-footer shrink-0 pt-3">{footer}</div>
          ) : null}
        </div>
      </section>
    </>
  );
}

export function AppSheetCard({ children }: { children: ReactNode }) {
  return <div className={appSheetCardClass}>{children}</div>;
}

export function AppSheetSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[18px] font-extrabold leading-tight text-[#281d7a]">
      {children}
    </h3>
  );
}

export function AppSheetSectionText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-[14px] font-semibold leading-relaxed text-[#5c567f]">
      {children}
    </p>
  );
}

export function AppSheetNotice({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : tone === "danger"
        ? "border-rose-300 bg-rose-50 text-rose-950"
        : "border-[#ddd2ff] bg-[#f1ecff] text-[#3f2a7a]";

  return (
    <div
      role="status"
      className={`rounded-2xl border px-4 py-3 text-center text-[14px] font-bold ${toneClass}`}
    >
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
