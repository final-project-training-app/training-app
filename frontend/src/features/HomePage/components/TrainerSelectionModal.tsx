import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TrainerCard from "./TrainerCard";
import { useTrainers } from "../../../hooks/useTrainers";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";

export default function TrainerSelectionModal() {
  const { data: trainers = [], isLoading } = useTrainers();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(() => {
    return trainers && trainers.length > 0 ? trainers[0]?.id ?? null : null;
  });
  const { play, stop, loadingId, playingId } = useVoicePlayer();

  const scrollToId = (id: string | number | null | undefined) => {
    if (!id) return;
    const el = document.getElementById(`trainer-card-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const handleSelectTrainer = (id: string | number) => {
    setSelectedId(id);
    scrollToId(id);
  };

  const handlePrev = () => {
    if (!trainers || trainers.length === 0) return;
    const idx = trainers.findIndex((t) => t.id === selectedId);
    const prev = trainers[Math.max(0, idx - 1)];
    if (prev) scrollToId(prev.id);
  };

  const handleNext = () => {
    if (!trainers || trainers.length === 0) return;
    const idx = trainers.findIndex((t) => t.id === selectedId);
    const next = trainers[Math.min(trainers.length - 1, idx + 1)];
    if (next) scrollToId(next.id);
  };

  return (
    <section aria-labelledby="trainer-selection-title" className="mt-8 px-2">
      {/* Header */}
      <div className="mb-8">
        <h2 id="trainer-selection-title" className="text-3xl font-bold text-[#5c35c4] mb-3">
          Välj din tränare
        </h2>
        <p className="text-base text-[#6b59b2] leading-relaxed max-w-2xl">
          Välj en tränare som matchar din stil och dina mål. Varje tränare har sin egen unika personlighet och specialitet.
        </p>
      </div>

      {/* Carousel */}
      <div className="mt-8 w-full">
        <div className="relative mx-auto w-full max-w-5xl">
          {/* Left arrow */}
          <button
            aria-label="föregående tränare"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-16 rounded-full bg-[#5c35c4] hover:bg-[#4a2dac] text-white p-3 shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right arrow */}
          <button
            aria-label="nästa tränare"
            onClick={handleNext}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-16 rounded-full bg-[#5c35c4] hover:bg-[#4a2dac] text-white p-3 shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
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
            ) : trainers && trainers.length > 0 ? (
              trainers.map((trainer) => (
                <div
                  id={`trainer-card-${trainer.id}`}
                  key={trainer.id}
                  className="snap-center"
                  role="option"
                  aria-selected={selectedId === trainer.id}
                >
                  <div className="h-full w-72">
                    <TrainerCard
                      trainer={trainer}
                      selected={selectedId === trainer.id}
                      onSelect={() => handleSelectTrainer(trainer.id)}
                      onPlay={() => {
                        if (playingId === String(trainer.id)) {
                          stop();
                        } else {
                          play(String(trainer.id), trainer.voice_preview_url);
                        }
                      }}
                      loading={loadingId === String(trainer.id)}
                      playing={playingId === String(trainer.id)}
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
