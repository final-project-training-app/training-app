import React from 'react';
import type { Trainer } from '../../../api/trainerService';

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
      className={`flex h-full w-64 cursor-pointer flex-col items-center gap-3 rounded-2xl p-3 transition-transform duration-300 ease-out
        ${selected ? 'scale-105 bg-white shadow-lg' : 'scale-95 bg-transparent opacity-80'}`}
      aria-pressed={selected}
      role="button"
    >
      <div className="h-44 w-full overflow-hidden rounded-xl bg-gray-100">
        {trainer.image_url ? (
          <img
            src={trainer.image_url}
            alt={trainer.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Ingen bild</div>
        )}
      </div>

      <div className="w-full text-left">
        <div className="truncate text-lg font-semibold text-[#281d7a]">{trainer.name}</div>
        <div className="mt-1 text-sm text-[#6b59b2]">{trainer.role}</div>
      </div>

      <div className="mt-auto w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (loading) return;
            if (playing) {
              onPlay?.();
              return;
            }
            onPlay?.();
          }}
          disabled={loading}
          className="w-full rounded-lg border border-[#ddd2ff] bg-[#f1ecff] px-3 py-2 text-sm font-semibold text-[#3f2a7a] transition-colors duration-150 hover:bg-[#e9e0ff] disabled:opacity-70"
        >
          {loading ? 'Laddar…' : playing ? 'Stoppa' : 'lyssna på röst'}
        </button>
      </div>
    </div>
  );
}

export default React.memo(TrainerCardInner, (prev, next) => 
  prev.trainer.id === next.trainer.id && 
  prev.selected === next.selected &&
  prev.loading === next.loading &&
  prev.playing === next.playing
);

