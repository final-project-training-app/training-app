import { useRef, useState, useCallback } from "react";
import TrainerCard from "./TrainerCard";
import { useTrainers, useUpdateSelectedTrainer } from "../../../hooks/useTrainers";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";
import type { Trainer } from "../../../api/trainerService";

export default function TrainerSelectionModal() {
  const { data: trainers = [], isLoading } = useTrainers();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return Array.isArray(trainers) && trainers.length > 0 ? trainers[0]?.id ?? null : null;
  });
  const { play, stop, loadingId, playingId } = useVoicePlayer();

  const scrollToId = useCallback((id?: string | null) => {
    if (!id) return;
    const el = document.getElementById(`trainer-card-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  const updateSelected = useUpdateSelectedTrainer();

  const onCardSelect = useCallback((id: string) => {
    const prev = selectedId;
    setSelectedId(id);
    scrollToId(id);
    updateSelected.mutate(id, {
      onError: () => {
        setSelectedId(prev ?? null);
      },
    });
  }, [scrollToId, selectedId, updateSelected]);

  const onScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container || !Array.isArray(trainers) || trainers.length === 0) return;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    let closestId: string | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    trainers.forEach((t: Trainer) => {
      const el = document.getElementById(`trainer-card-${t.id}`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const itemCenter = r.left + r.width / 2;
      const dist = Math.abs(itemCenter - centerX);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestId = t.id;
      }
    });

    if (closestId) setSelectedId(closestId);
  }, [trainers]);

  return (
    <section aria-labelledby="trainer-selection-title" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[#2b2277]">
          <h2 id="trainer-selection-title" className="text-[clamp(1.6rem,4vw,2.6rem)] text-[#4f3bb8] font-bold leading-none tracking-tight">
            välj tränare
          </h2>
          <p className="mt-2 max-w-3xl text-[clamp(1.05rem,2.8vw,1.45rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
            Välj en tränare som matchar din stil och dina mål. Varje tränare har
            sin egen unika personlighet och specialitet — välj den som passar dig bäst.
          </p>
        </div>
      </div>

      <div className="mt-5 w-full">
        <div className="relative mx-auto w-full max-w-4xl">
          <button
            aria-label="previous"
            onClick={() => {
              if (!Array.isArray(trainers)) return;
              const idx = trainers.findIndex((t: Trainer) => t.id === selectedId);
              const prev = trainers[Math.max(0, idx - 1)];
              if (prev) scrollToId(prev.id);
            }}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow"
          >
            ‹
          </button>

          <button
            aria-label="next"
            onClick={() => {
              if (!Array.isArray(trainers)) return;
              const idx = trainers.findIndex((t: Trainer) => t.id === selectedId);
              const next = trainers[Math.min(trainers.length - 1, idx + 1)];
              if (next) scrollToId(next.id);
            }}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow"
          >
            ›
          </button>

          <div
            ref={carouselRef}
            onScroll={onScroll}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 py-4"
            role="listbox"
            aria-label="Trainer carousel"
          >
            {isLoading ? (
              <div className="flex h-44 w-full items-center justify-center text-sm text-[#6b59b2]">Hämtar tränare...</div>
            ) : Array.isArray(trainers) ? (
              trainers.map((t: Trainer) => (
                <div
                  id={`trainer-card-${t.id}`}
                  key={t.id}
                  className="snap-center"
                  role="option"
                  aria-selected={selectedId === t.id}
                >
                  <div className="h-full w-64">
                    <TrainerCard
                      trainer={t}
                      selected={selectedId === t.id}
                      onSelect={() => onCardSelect(t.id)}
                      onPlay={() => {
                        if (playingId === t.id) {
                          stop();
                        } else {
                          play(t.id, t.voice_preview_url);
                        }
                      }}
                      loading={loadingId === t.id}
                      playing={playingId === t.id}
                    />
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
