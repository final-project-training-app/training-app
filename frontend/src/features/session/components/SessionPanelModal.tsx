import { X } from "lucide-react";
import type { ReactNode } from "react";

type SessionPanelModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function SessionPanelModal({
  title,
  onClose,
  children,
}: SessionPanelModalProps) {
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-10 flex items-start justify-center bg-(--brand-overlay) px-6 pt-16 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <section
        className="pointer-events-auto relative max-h-[70dvh] w-full max-w-82.5 overflow-hidden border border-(--brand-panel-border) bg-(--brand-surface-soft) p-6 text-(--brand-primary) shadow-[0_18px_40px_var(--brand-shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto absolute right-3 top-3 rounded-full p-2"
          aria-label="Stäng information"
        >
          <X size={24} />
        </button>

        <h2 className="mb-5 pr-8 text-4xl font-extrabold">{title}</h2>

        {children}
      </section>
    </div>
  );
}
