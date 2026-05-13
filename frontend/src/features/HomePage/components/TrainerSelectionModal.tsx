import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchTrainersWithToken } from "../../../api/trainers";
import TrainerCard from "./TrainerCard";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";

type Trainer = {
  id: number;
  name: string;
  imageSelect?: string | null;
  voice?: string;
  intro?: string;
};

export default function TrainerSelectionModal({
  onTrainerSelect,
  selectedTrainerId,
}: {
  onTrainerSelect?: (trainerId: number) => void;
  selectedTrainerId?: number | null;
}) {
  const { getToken } = useAuth();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(selectedTrainerId ?? 1);
  const { play, stop, loadingId, playingId } = useVoicePlayer();

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return fetchTrainersWithToken(token);
    },
    enabled: !!getToken(),
  });

  // Center selected trainer on mount or when trainers load, default to trainer 1
  useEffect(() => {
    if (trainers.length > 0) {
      const selectedId = localSelectedId || 1;
      setLocalSelectedId(selectedId);
      setTimeout(() => {
        const el = document.getElementById(`trainer-card-${selectedId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }, 100);
    }
  }, [trainers]);

  const handleSelectTrainer = (id: number) => {
    setLocalSelectedId(id);
    onTrainerSelect?.(id);
    const el = document.getElementById(`trainer-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const handlePrev = () => {
    if (!trainers.length) return;
    const idx = trainers.findIndex((t: Trainer) => t.id === localSelectedId);
    const prev = trainers[Math.max(0, idx - 1)];
    if (prev) handleSelectTrainer(prev.id);
  };

  const handleNext = () => {
    if (!trainers.length) return;
    const idx = trainers.findIndex((t: Trainer) => t.id === localSelectedId);
    const next = trainers[Math.min(trainers.length - 1, idx + 1)];
    if (next) handleSelectTrainer(next.id);
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
            className="absolute left-2 md:left-0 top-1/2 z-20 -translate-y-1/2 md:-translate-x-16 rounded-full bg-[#5c35c4] hover:bg-[#4a2dac] text-white p-2 md:p-3 shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Right arrow */}
          <button
            aria-label="nästa tränare"
            onClick={handleNext}
            className="absolute right-2 md:right-0 top-1/2 z-20 -translate-y-1/2 md:translate-x-16 rounded-full bg-[#5c35c4] hover:bg-[#4a2dac] text-white p-2 md:p-3 shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 md:gap-6 overflow-x-auto px-6 md:px-12 py-6"
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
            ) : trainers.length > 0 ? (
              trainers.map((trainer: Trainer) => (
                <div
                  id={`trainer-card-${trainer.id}`}
                  key={trainer.id}
                  className="snap-center flex-shrink-0"
                  role="option"
                  aria-selected={localSelectedId === trainer.id}
                >
                  <div className="h-full w-72 md:w-80">
                    <TrainerCard
                      trainer={trainer}
                      selected={localSelectedId === trainer.id}
                      onSelect={() => handleSelectTrainer(trainer.id)}
                      onPlay={() => {
                        const trainerId = String(trainer.id);
                        if (playingId === trainerId) {
                          stop();
                        } else {
                          play(trainerId, trainer.voice);
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
