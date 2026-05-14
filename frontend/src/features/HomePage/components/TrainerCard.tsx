import React from "react";
import { Check, Loader, Square, Volume2 } from "lucide-react";

type Trainer = {
  id: number;
  name: string;
  imageSelect?: string | null;
  intro?: string | null;
};

type Props = {
  trainer: Trainer;
  selected?: boolean;
  onSelect?: () => void;
  onPlay?: () => void;
  loading?: boolean;
  playing?: boolean;
};

function TrainerCardInner({
  trainer,
  selected = false,
  onSelect,
  onPlay,
  loading = false,
  playing = false,
}: Props) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-colors duration-150 ${
        selected
          ? "border-[#5c35c4] ring-2 ring-[#5c35c4]/20"
          : "border-[#ddd2ff]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="block w-full text-left"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f1ecff]">
          {trainer.imageSelect ? (
            <img
              src={trainer.imageSelect}
              alt={trainer.name}
              loading="lazy"
              className="h-full w-full object-contain object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl" aria-hidden="true">
                👤
              </span>
            </div>
          )}

          {selected ? (
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#5c35c4] text-white shadow-sm">
              <Check size={18} strokeWidth={3} />
            </div>
          ) : null}
        </div>

        <div className="p-4 text-center">
          <h3 className="text-[17px] font-extrabold leading-tight text-[#281d7a]">
            {trainer.name}
          </h3>
          <p className="mt-1 text-[12px] font-bold text-[#6b59b2]">
            Personlig tränare
          </p>
        </div>
      </button>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-[13px] font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
            playing
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : "border-[#ddd2ff] bg-[#f1ecff] text-[#3f2a7a]"
          }`}
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Laddar...
            </>
          ) : playing ? (
            <>
              <Square size={15} className="fill-current" />
              Stoppa
            </>
          ) : (
            <>
              <Volume2 size={16} />
              Lyssna
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default React.memo(
  TrainerCardInner,
  (prev, next) =>
    prev.trainer.id === next.trainer.id &&
    prev.selected === next.selected &&
    prev.loading === next.loading &&
    prev.playing === next.playing,
);
