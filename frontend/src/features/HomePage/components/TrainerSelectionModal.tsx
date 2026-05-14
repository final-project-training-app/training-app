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

  // ✅ FIX 1: DO NOT fallback to first trainer (prevents wrong overwrites)
  const resolvedId = selectedTrainerId;

  useEffect(() => {
    if (!trainersKey || resolvedId == null) return;

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
    if (!trainers.length || resolvedId == null) return;

    const idx = trainers.findIndex((t: Trainer) => t.id === resolvedId);
    const prev = trainers[Math.max(0, idx - 1)];
    if (prev) handleSelectTrainer(prev.id);
  };

  const handleNext = () => {
    if (!trainers.length || resolvedId == null) return;

    const idx = trainers.findIndex((t: Trainer) => t.id === resolvedId);
    const next = trainers[Math.min(trainers.length - 1, idx + 1)];
    if (next) handleSelectTrainer(next.id);
  };

  return (
    <section aria-labelledby="trainer-selection-title" className="mt-2 px-0">
      <div className="mb-3 flex items-center gap-3 text-[#4f3bb8]">
        <UserRound className="shrink-0 text-[var(--brand-primary)]" size={28} />
        <h2 className="text-[clamp(1.75rem,4.4vw,3rem)] font-bold leading-none tracking-tight">
          Välj tränare
        </h2>
      </div>

      <p className="mb-8 max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed text-[#312b70]">
        Välj den tränare som passar din stil och dina mål. Alla tränare har en
        egen personlighet och inriktning.
      </p>

      <div className="w-full">
        <div className="relative mx-auto w-full max-w-5xl">
          <button onClick={handlePrev}>
            <ChevronLeft />
          </button>

          <button onClick={handleNext}>
            <ChevronRight />
          </button>

          <div className="no-scrollbar flex snap-x overflow-x-auto px-4 py-6">
            {isLoading ? (
              <div>Hämtar tränare …</div>
            ) : trainers.length > 0 ? (
              trainers.map((trainer: Trainer) => (
                <div
                  id={`trainer-card-${trainer.id}`}
                  key={trainer.id}
                  role="option"
                  aria-selected={resolvedId === trainer.id}
                >
                  <TrainerCard
                    trainer={trainer}
                    selected={resolvedId === trainer.id}
                    onSelect={() => handleSelectTrainer(trainer.id)}
                    onPlay={() => {
                      const trainerId = String(trainer.id);
                      if (playingId === trainerId) stop();
                      else play(trainerId, trainer.intro);
                    }}
                    loading={loadingId === String(trainer.id)}
                    playing={playingId === String(trainer.id)}
                  />
                </div>
              ))
            ) : (
              <div>Inga tränare</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}