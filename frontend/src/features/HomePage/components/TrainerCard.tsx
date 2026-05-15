import React from "react";
import { Check, Loader, Square, Volume2 } from "lucide-react";
import {
  appSheetCardClass,
  appSheetFieldClass,
} from "../../../components/AppSheet";

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
      className={`relative overflow-hidden ${appSheetCardClass} p-0 transition-[border-color,box-shadow,transform] duration-150 ${
        selected
          ? "border-[#5c35c4] shadow-[0_12px_30px_rgba(91,63,214,0.16)] ring-2 ring-[#5c35c4]/18"
          : "hover:border-[#c9bcf5]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="block w-full text-left"
      >
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-b-[1.4rem] bg-[#efe7ff]">
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

        <div className="px-4 pb-3 pt-4 text-center">
          <h3 className="text-[20px] font-extrabold leading-tight text-[#281d7a]">
            {trainer.name}
          </h3>

          <p
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-[12px] font-extrabold tracking-wide ${
              selected
                ? "bg-[#5b3fd6] text-white"
                : "bg-white text-[#6b59b2]"
            }`}
          >
            {selected ? "Vald tränare" : "Tryck för att välja"}
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
          className={`flex w-full items-center justify-center gap-2 ${appSheetFieldClass} px-3 py-3 text-[15px] font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
            playing
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : "text-[#3f2a7a]"
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
