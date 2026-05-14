import React from "react";
import { Volume2, Loader, Square } from "lucide-react";

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
  selected,
  onSelect,
  onPlay,
  loading,
  playing,
}: Props) {
  return (
    <div
      onClick={onSelect}
      className={`relative flex h-[600px] w-96 cursor-pointer flex-col rounded-3xl overflow-hidden transition-all duration-300 ease-out
        ${
          selected
            ? "scale-105 bg-white shadow-2xl ring-3 ring-[#5c35c4] motion-safe:shadow-[0_8px_40px_-6px_rgba(92,53,196,0.45)]"
            : "scale-95 bg-white shadow-lg opacity-85 hover:opacity-95"
        }`}
      aria-pressed={selected}
      role="button"
    >
      {/* Image container - takes most of space */}
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-br from-[#f1ecff] to-[#e9e0ff]">
        {trainer.imageSelect ? (
          <img
            src={trainer.imageSelect}
            alt={trainer.name}
            className="h-full w-full object-contain object-center"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#ddd2ff] to-[#c8bfeb]">
            <div className="text-center">
              <div className="text-6xl">👤</div>
              <div className="mt-3 text-sm font-medium text-[#6b59b2]">
                Ingen bild
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content container - compact at bottom */}
      <div className="flex flex-col gap-2 p-4 bg-white">
        {/* Name and role */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-[#281d7a] leading-tight">
            {trainer.name}
          </h3>
          <p className="text-xs font-medium text-[#6b59b2]">
            Personlig tränare
          </p>
        </div>

        {/* Voice button */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150
              ${
                playing
                  ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                  : "bg-[#f1ecff] text-[#3f2a7a] border border-[#ddd2ff] hover:bg-[#e9e0ff]"
              }
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Laddar...</span>
              </>
            ) : playing ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stoppa</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Lyssna på röst</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3 bg-[#5c35c4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
          ✓
        </div>
      )}
    </div>
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
