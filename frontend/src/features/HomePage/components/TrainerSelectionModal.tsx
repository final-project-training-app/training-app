import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { fetchTrainersWithToken } from "../../../api/trainers";
import TrainerCard from "./TrainerCard";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";

type Trainer = {
  id: number;
  name: string;
  imageSelect?: string | null;
  voice?: string;
  intro?: string | null;
  language?: string;
};

export default function TrainerSelectionModal({
  onTrainerSelect,
  selectedTrainerId,
}: {
  onTrainerSelect?: (trainerId: number) => void;
  selectedTrainerId?: number | null;
}) {
  const { getToken, isSignedIn } = useAuth();
  const resolvedId = selectedTrainerId ?? 1;
  const { play, stop, loadingId, playingId } = useVoicePlayer();

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return fetchTrainersWithToken(token);
    },
    enabled: isSignedIn === true,
    refetchOnWindowFocus: false,
  });

  const trainersKey = useMemo(
    () => trainers.map((t: Trainer) => t.id).join(","),
    [trainers],
  );

  useEffect(() => {
    if (!trainersKey) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(`trainer-card-${resolvedId}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, 100);
    return () => window.clearTimeout(t);
  }, [trainersKey, resolvedId]);

  const handleSelectTrainer = (id: number) => {
    onTrainerSelect?.(id);
    const el = document.getElementById(`trainer-card-${id}`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const handlePrev = () => {
    if (!trainers.length) return;
    const idx = trainers.findIndex((t: Trainer) => t.id === resolvedId);
    const prev = trainers[Math.max(0, idx - 1)];
    if (prev) handleSelectTrainer(prev.id);
  };

  const handleNext = () => {
    if (!trainers.length) return;
    const idx = trainers.findIndex((t: Trainer) => t.id === resolvedId);
    const next = trainers[Math.min(trainers.length - 1, idx + 1)];
    if (next) handleSelectTrainer(next.id);
  };

  return (
    <section aria-labelledby="trainer-selection-title" className="mt-2 px-0">
      <div className="mb-3 flex items-center gap-3 text-[#4f3bb8]">
        <UserRound className="shrink-0 text-[var(--brand-primary)]" size={28} />
        <h2
          id="trainer-selection-title"
          className="text-[clamp(1.75rem,4.4vw,3rem)] font-bold leading-none tracking-tight"
        >
          Välj tränare
        </h2>
      </div>

      <p className="mb-8 max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
        Välj den tränare som passar din stil och dina mål. Alla tränare har en
        egen personlighet och inriktning.
      </p>

      <div className="w-full">
        <div className="relative mx-auto w-full max-w-5xl">
          <button
            type="button"
            aria-label="Föregående tränare"
            onClick={handlePrev}
            className="absolute left-1 sm:left-2 md:left-0 top-1/2 z-20 -translate-y-1/2 md:-translate-x-16 rounded-full bg-[#5c35c4] p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-[#4a2dac] sm:p-3"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            aria-label="Nästa tränare"
            onClick={handleNext}
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-[#5c35c4] p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-[#4a2dac] sm:right-2 md:right-0 sm:p-3 md:translate-x-16"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 py-6 sm:gap-4 sm:px-6 md:gap-6 md:px-12"
            role="listbox"
            aria-label="Tränarval"
          >
            {isLoading ? (
              <div className="flex h-[600px] w-full items-center justify-center gap-3">
                <div className="animate-spin">
                  <div className="h-6 w-6 rounded-full border-3 border-[#ddd2ff] border-t-[#5c35c4]" />
                </div>
                <span className="font-medium text-[#6b59b2]">
                  Hämtar tränare …
                </span>
              </div>
            ) : trainers.length > 0 ? (
              trainers.map((trainer: Trainer) => (
                <div
                  id={`trainer-card-${trainer.id}`}
                  key={trainer.id}
                  className="snap-center shrink-0"
                  role="option"
                  aria-selected={resolvedId === trainer.id}
                >
                  <div className="h-full w-80 sm:w-96">
                    <TrainerCard
                      trainer={trainer}
                      selected={resolvedId === trainer.id}
                      onSelect={() => handleSelectTrainer(trainer.id)}
                      onPlay={() => {
                        const trainerId = String(trainer.id);
                        if (playingId === trainerId) {
                          stop();
                        } else {
                          play(trainerId, trainer.intro);
                        }
                      }}
                      loading={loadingId === String(trainer.id)}
                      playing={playingId === String(trainer.id)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-[600px] w-full items-center justify-center">
                <p className="text-[#6b59b2]">
                  Inga tränare tillgängliga just nu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
