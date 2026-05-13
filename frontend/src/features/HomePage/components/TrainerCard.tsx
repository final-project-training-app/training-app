import React from 'react';
import { Volume2, Loader, Square } from 'lucide-react';

type Trainer = {
  id: number;
  name: string;
  imageSelect?: string | null;
  voice?: string;
};

type Props = {
  trainer: Trainer;
  selected?: boolean;
  onSelect?: () => void;
  onPlay?: () => void;
  loading?: boolean;
  playing?: boolean;
};

function TrainerCardInner({ trainer, selected, onSelect, onPlay, loading, playing }: Props) {
  return (
    <div
      onClick={onSelect}
      className={`relative flex h-full w-80 cursor-pointer flex-col rounded-3xl overflow-hidden transition-all duration-300 ease-out
        ${selected 
          ? 'scale-105 bg-white shadow-2xl ring-3 ring-[#5c35c4]' 
          : 'scale-95 bg-white shadow-lg opacity-85 hover:opacity-95'}`}
      aria-pressed={selected}
      role="button"
    >
      {/* Image container */}
      <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-[#f1ecff] to-[#e9e0ff]">
        {trainer.imageSelect ? (
          <img
            src={trainer.imageSelect}
            alt={trainer.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#ddd2ff] to-[#c8bfeb]">
            <div className="text-center">
              <div className="text-6xl">👤</div>
              <div className="mt-3 text-sm font-medium text-[#6b59b2]">Ingen bild</div>
            </div>
          </div>
        )}
      </div>

      {/* Content container */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Name and role */}
        <div>
          <h3 className="text-xl font-bold text-[#281d7a] leading-tight">{trainer.name}</h3>
          <p className="mt-2 text-sm font-medium text-[#6b59b2]">Personlig tränare</p>
        </div>

        {/* Voice button */}
        <div className="mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150
              ${playing 
                ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200' 
                : 'bg-[#f1ecff] text-[#3f2a7a] border border-[#ddd2ff] hover:bg-[#e9e0ff]'}
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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

export default React.memo(TrainerCardInner, (prev, next) => 
  prev.trainer.id === next.trainer.id && 
  prev.selected === next.selected &&
  prev.loading === next.loading &&
  prev.playing === next.playing
);

