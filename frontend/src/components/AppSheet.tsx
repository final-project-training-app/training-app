import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export const appSheetFieldClass =
  "rounded-2xl border border-[#ddd2ff] bg-[#f5f2fb]";

export const appSheetCardClass =
  "rounded-3xl border border-[#e3d9ff] bg-[#f5f2fb] p-4";

export const appSheetPrimaryButtonClass =
  "w-full rounded-2xl bg-[#5b3fd6] px-4 py-3.5 text-[16px] font-extrabold text-white transition hover:bg-[#4e35c0] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70";

export const appSheetSecondaryButtonClass =
  "w-full rounded-xl border border-[#c5b0f0] bg-[#f0ecfc] px-4 py-3 text-[15px] font-extrabold text-[#4d2a7a] transition hover:bg-[#e3d9ff] active:scale-[0.985] active:bg-[#ddd2ff]";

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
  const sectionRef = useRef<HTMLElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  // Drag position stored in a ref – no re-render needed during drag.
  const dragY = useRef(0);
  // Guards against animating the close on initial mount (open=false from birth).
  // Without this, every AppSheet instance would slide down on first render.
  const hasEverBeenOpen = useRef(false);
  // Only the backdrop uses React state; the sheet's position is driven
  // entirely by direct DOM manipulation so CSS transitions are 100% reliable.
  const [backdropVisible, setBackdropVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (open) {
      hasEverBeenOpen.current = true;
      setBackdropVisible(true);
      // Snap to bottom (no transition) so the browser commits that position,
      // then animate up.  getBoundingClientRect() forces a synchronous style-
      // flush so the browser treats translateY(100%) as the CSS "from" state.
      el.style.transition = "none";
      el.style.transform = "translateY(100%)";
      el.getBoundingClientRect();
      el.style.transition = "transform 500ms ease-out";
      el.style.transform = "translateY(0)";
      // No cleanup returned: a cleanup that resets the transform would fire
      // before the close effect and prevent the slide-down animation.
      // StrictMode double-invoke: second run overwrites the first before any
      // browser paint, so the net result is still one correct animation.
    } else {
      if (!hasEverBeenOpen.current) {
        // Initial mount in closed state – just snap off-screen, no animation.
        el.style.transition = "none";
        el.style.transform = "translateY(100%)";
        return;
      }
      // Slide-down close.  Enable transition first, then force a style-flush
      // so the browser commits the current position as the from-state before
      // we change the transform.
      el.style.transition = "transform 500ms ease-out";
      el.getBoundingClientRect();
      el.style.transform = "translateY(100%)";

      const tid = setTimeout(() => {
        setBackdropVisible(false);
        dragY.current = 0;
        el.style.transition = "none";
      }, 550);
      return () => clearTimeout(tid);
    }
  }, [open]);

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
    // Restrict drag to the handle / header area – the scroll body has touch-pan-y
    // so the browser claims vertical gestures there and preventDefault won't work.
    if (scrollBodyRef.current?.contains(e.target as Node)) return;
    touchStartY.current = e.touches[0].clientY;
  }

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !open) return;

    function handleTouchMove(e: TouchEvent) {
      if (touchStartY.current == null) return;
      const delta = e.touches[0].clientY - touchStartY.current;

      if (delta > 0) {
        // Downward – only intercept when scroll body is at top.
        const scrollBody = scrollBodyRef.current;
        if (scrollBody && scrollBody.scrollTop > 0) return;
      }

      e.preventDefault();
      if (!el) return;
      el.style.transition = "none";

      // Upward drag is dampened (⅓, max 60 px); downward is uncapped.
      const newY = delta > 0 ? delta : Math.max(delta / 3, -60);
      dragY.current = newY;
      el.style.transform = `translateY(${newY}px)`;
    }

    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [open]);

  function onTouchEnd() {
    if (touchStartY.current == null) return;
    const dragged = dragY.current;
    touchStartY.current = null;
    dragY.current = 0;

    const el = sectionRef.current;
    if (!el) return;

    // Re-enable transition before animating.
    el.style.transition = "transform 500ms ease-out";

    if (dragged > 120) {
      // The close effect will animate translateY(100%) from wherever the sheet
      // currently is (the drag release point).
      onClose();
    } else {
      // Snap back to fully open.
      el.style.transform = "translateY(0)";
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        className={[
          "absolute inset-0 z-40 bg-[#221447]/18 backdrop-blur-[3px]",
          "transition-opacity duration-[300ms] ease-out",
          backdropVisible ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <section
        ref={sectionRef}
        onWheel={handleWheel}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={[
          "absolute inset-x-0 bottom-0 z-50 flex w-full flex-col",
          "app-sheet-surface overflow-hidden rounded-t-4xl",
          "will-change-transform",
          maxHeightClass[height],
          open ? "" : "pointer-events-none",
        ].join(" ")}
        // No transform style prop – position is controlled entirely via
        // el.style.transform so CSS transitions always have a reliable from-state.
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
