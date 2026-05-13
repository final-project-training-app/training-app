import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TrainerCard from "./TrainerCard";
import {
  useTrainers,
  useUpdateSelectedTrainer,
} from "../../../hooks/useTrainers";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";
import type { Trainer } from "../../../api/trainerService";

export default function TrainerSelectionModal() {
  const { data: trainers = [], isLoading } = useTrainers();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return Array.isArray(trainers) && trainers.length > 0
      ? (trainers[0]?.id ?? null)
      : null;
  });
  const { play, stop, loadingId, playingId } = useVoicePlayer();

  const scrollToId = useCallback((id?: string | null) => {
    if (!id) return;
    const el = document.getElementById(`trainer-card-${id}`);
    if (el)
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, []);

  const updateSelected = useUpdateSelectedTrainer();

  const onCardSelect = useCallback(
    (id: string) => {
      const prev = selectedId;
      setSelectedId(id);
      scrollToId(id);
      updateSelected.mutate(id, {
        onError: () => {
          setSelectedId(prev ?? null);
        },
      });
    },
    [scrollToId, selectedId, updateSelected],
  );

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
    <section aria-labelledby="trainer-selection-title" className="mt-8 px-2">
      {/* Header */}
      <div className="mb-6">
        <h2
          id="trainer-selection-title"
          className="text-2xl font-bold text-[#281d7a] mb-2"
        >
          Välj din tränare
        </h2>
        <p className="text-base text-[#6b59b2] leading-relaxed max-w-2xl">
          Välj en tränare som matchar din stil och dina mål. Varje tränare har
          sin egen unika personlighet och specialitet.
        </p>
      </div>

      {/* Carousel */}
      <div className="mt-8 w-full">
        <div className="relative mx-auto w-full max-w-5xl">
          {/* Left arrow button */}
          <button
            aria-label="föregående tränare"
            onClick={() => {
              if (!Array.isArray(trainers)) return;
              const idx = trainers.findIndex(
                (t: Trainer) => t.id === selectedId,
              );
              const prev = trainers[Math.max(0, idx - 1)];
              if (prev) scrollToId(prev.id);
            }}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-16 rounded-full bg-[#5c35c4] hover:bg-[#4a2dac] text-white p-3 shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right arrow button */}
          <button
            aria-label="nästa tränare"
            onClick={() => {
              if (!Array.isArray(trainers)) return;
              const idx = trainers.findIndex(
                (t: Trainer) => t.id === selectedId,
              );
              const next = trainers[Math.min(trainers.length - 1, idx + 1)];
              if (next) scrollToId(next.id);
            }}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-16 rounded-full bg-[#5c35c4] hover:bg-[#4a2dac] text-white p-3 shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel container */}
          <div
            ref={carouselRef}
            onScroll={onScroll}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-12 py-6"
            role="listbox"
            aria-label="Trainer carousel"
          >
            {isLoading ? (
              <div className="flex h-96 w-full items-center justify-center gap-3">
                <div className="animate-spin">
                  <div className="w-6 h-6 border-3 border-[#ddd2ff] border-t-[#5c35c4] rounded-full" />
                </div>
                <span className="text-[#6b59b2] font-medium">Hämtar tränare...</span>
              </div>
            ) : Array.isArray(trainers) && trainers.length > 0 ? (
              trainers.map((t: Trainer) => (
                <div
                  id={`trainer-card-${t.id}`}
                  key={t.id}
                  className="snap-center"
                  role="option"
                  aria-selected={selectedId === t.id}
                >
                  <div className="h-full w-72">
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
            ) : (
              <div className="flex h-96 w-full items-center justify-center">
                <p className="text-[#6b59b2]">Inga tränare tillgängliga just nu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
