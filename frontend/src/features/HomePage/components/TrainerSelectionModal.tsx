import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { UserRound } from "lucide-react";
import { fetchTrainersWithToken } from "../../../api/trainers";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";
import TrainerCard from "./TrainerCard";

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

  const {
    data: trainers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      return fetchTrainersWithToken(token);
    },
    enabled: isSignedIn === true,
    refetchOnWindowFocus: false,
  });

  const handleSelectTrainer = (id: number) => {
    onTrainerSelect?.(id);
  };

  return (
    <section aria-labelledby="trainer-selection-title" className="space-y-4">
      <div className="flex items-center gap-2 text-[#4f3bb8]">
        <UserRound size={22} className="shrink-0" />
        <h2
          id="trainer-selection-title"
          className="text-[18px] font-extrabold leading-tight"
        >
          Välj tränare
        </h2>
      </div>

      <p className="text-[13px] font-semibold leading-snug text-[#6b59b2]">
        Välj rösten och tränaren som ska guida dina pass.
      </p>

      {isLoading ? (
        <div className="rounded-2xl border border-[#ddd2ff] bg-[#f1ecff] px-4 py-4 text-center text-[14px] font-bold text-[#3f2a7a]">
          Hämtar tränare...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-4 text-center text-[14px] font-bold text-rose-950">
          Kunde inte hämta tränare.
        </div>
      ) : trainers.length > 0 ? (
        <div
          role="listbox"
          aria-label="Välj tränare"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {trainers.map((trainer: Trainer) => {
            const trainerId = String(trainer.id);
            const selected = selectedTrainerId === trainer.id;

            return (
              <div
                key={trainer.id}
                role="option"
                aria-selected={selected}
                className="min-w-0"
              >
                <TrainerCard
                  trainer={trainer}
                  selected={selected}
                  onSelect={() => handleSelectTrainer(trainer.id)}
                  onPlay={() => {
                    if (playingId === trainerId) {
                      stop();
                    } else {
                      play(trainerId, trainer.intro);
                    }
                  }}
                  loading={loadingId === trainerId}
                  playing={playingId === trainerId}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#ddd2ff] bg-[#f1ecff] px-4 py-4 text-center text-[14px] font-bold text-[#3f2a7a]">
          Inga tränare hittades.
        </div>
      )}
    </section>
  );
}
