import { useEffect, useMemo } from "react";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { fetchTrainersWithToken } from "../../../api/trainers";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";
import {
  AppSheetCard,
  AppSheetNotice,
  AppSheetSectionText,
  AppSheetSectionTitle,
} from "../../../components/AppSheet";
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

  useEffect(() => {
    if (selectedTrainerId == null && trainers.length > 0) {
      onTrainerSelect?.(trainers[0].id);
    }
  }, [onTrainerSelect, selectedTrainerId, trainers]);

  const selectedIndex = useMemo(
    () =>
      trainers.findIndex(
        (trainer: Trainer) => trainer.id === selectedTrainerId,
      ),
    [selectedTrainerId, trainers],
  );

  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const selectedTrainer = trainers[activeIndex] ?? null;

  const selectTrainerByIndex = (index: number) => {
    const trainer = trainers[index];

    if (!trainer) {
      return;
    }

    handleSelectTrainer(trainer.id);
  };

  const moveSelection = (direction: -1 | 1) => {
    if (trainers.length === 0) {
      return;
    }

    const nextIndex =
      selectedIndex === -1
        ? 0
        : Math.min(Math.max(selectedIndex + direction, 0), trainers.length - 1);

    selectTrainerByIndex(nextIndex);
  };

  return (
    <section aria-labelledby="trainer-selection-title" className="space-y-4">
      <AppSheetCard>
        <div className="flex items-center gap-3 text-[#4f3bb8]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-(--brand-primary)">
            <UserRound size={22} />
          </div>

          <div className="min-w-0">
            <div id="trainer-selection-title">
              <AppSheetSectionTitle>Välj tränare</AppSheetSectionTitle>
            </div>

            <AppSheetSectionText>
              Välj en tränare i taget. Använd de stora pilarna för att byta.
            </AppSheetSectionText>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white px-4 py-3">
          <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#6f6a93]">
            Vald tränare
          </p>

          <p className="mt-1 text-[20px] font-extrabold leading-tight text-[#221447]">
            {selectedTrainer?.name ?? "Ingen vald ännu"}
          </p>
        </div>
      </AppSheetCard>

      {isLoading ? (
        <AppSheetNotice>Hämtar tränare...</AppSheetNotice>
      ) : isError ? (
        <AppSheetNotice tone="danger">Kunde inte hämta tränare.</AppSheetNotice>
      ) : trainers.length > 0 ? (
        <>
          <AppSheetCard>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => moveSelection(-1)}
                disabled={trainers.length <= 1 || activeIndex <= 0}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#ddd2ff] bg-white text-[#5b3fd6] transition active:scale-95 disabled:opacity-40"
                aria-label="Föregående tränare"
              >
                <ChevronLeft size={24} strokeWidth={2.8} />
              </button>

              <div className="min-w-0 text-center">
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#6f6a93]">
                  Tränare {activeIndex + 1} av {trainers.length}
                </p>

                <p className="mt-1 text-[18px] font-extrabold text-[#221447]">
                  {selectedTrainer?.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => moveSelection(1)}
                disabled={
                  trainers.length <= 1 || activeIndex >= trainers.length - 1
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#ddd2ff] bg-white text-[#5b3fd6] transition active:scale-95 disabled:opacity-40"
                aria-label="Nästa tränare"
              >
                <ChevronRight size={24} strokeWidth={2.8} />
              </button>
            </div>

            {selectedTrainer ? (
              <div role="listbox" aria-label="Välj tränare" className="mt-4">
                <div role="option" aria-selected="true">
                  <TrainerCard
                    trainer={selectedTrainer}
                    selected
                    onSelect={() => handleSelectTrainer(selectedTrainer.id)}
                    onPlay={() => {
                      const trainerId = String(selectedTrainer.id);

                      if (playingId === trainerId) {
                        stop();
                      } else {
                        play(trainerId, selectedTrainer.intro);
                      }
                    }}
                    loading={loadingId === String(selectedTrainer.id)}
                    playing={playingId === String(selectedTrainer.id)}
                  />
                </div>
              </div>
            ) : null}

            <p className="mt-4 text-center text-[14px] font-semibold leading-relaxed text-[#5c567f]">
              Byt med pilarna tills du hittar en röst som känns tydlig och
              trygg.
            </p>
          </AppSheetCard>
        </>
      ) : (
        <AppSheetNotice>Inga tränare hittades.</AppSheetNotice>
      )}
    </section>
  );
}
