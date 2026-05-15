import { useMemo } from "react";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader,
  Square,
  UserRound,
  Volume2,
} from "lucide-react";
import { fetchTrainersWithToken } from "../../../api/trainers";
import { useVoicePlayer } from "../../../hooks/useVoicePlayer";
import {
  AppSheetCard,
  appSheetFieldClass,
  AppSheetNotice,
  AppSheetSectionText,
  AppSheetSectionTitle,
} from "../../../components/AppSheet";

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

  if (isSignedIn === false) {
    return (
      <section aria-labelledby="trainer-selection-title">
        <AppSheetNotice>Du är inte inloggad.</AppSheetNotice>
      </section>
    );
  }

  return (
    <section aria-labelledby="trainer-selection-title" className="space-y-4">
      {isLoading ? (
        <AppSheetNotice>Hämtar tränare...</AppSheetNotice>
      ) : isError ? (
        <AppSheetNotice tone="danger">Kunde inte hämta tränare.</AppSheetNotice>
      ) : trainers.length > 0 ? (
        <AppSheetCard>
          <div className="flex items-start gap-3 text-[#4f3bb8]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-(--brand-primary)">
              <UserRound size={22} />
            </div>

            <div className="min-w-0">
              <div id="trainer-selection-title">
                <AppSheetSectionTitle>Välj tränare</AppSheetSectionTitle>
              </div>

              <AppSheetSectionText>
                Välj en tränare i taget. Använd pilarna för att byta.
              </AppSheetSectionText>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveSelection(-1)}
              disabled={trainers.length <= 1 || activeIndex <= 0}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#ddd2ff] bg-white text-[#5b3fd6] transition active:scale-95 disabled:opacity-40"
              aria-label="Föregående tränare"
            >
              <ChevronLeft size={22} strokeWidth={2.8} />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8c82b3]">
                Tränare {activeIndex + 1} av {trainers.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => moveSelection(1)}
              disabled={trainers.length <= 1 || activeIndex >= trainers.length - 1}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#ddd2ff] bg-white text-[#5b3fd6] transition active:scale-95 disabled:opacity-40"
              aria-label="Nästa tränare"
            >
              <ChevronRight size={22} strokeWidth={2.8} />
            </button>
          </div>

          {selectedTrainer ? (
            <div role="listbox" aria-label="Välj tränare" className="mt-4">
              <div role="option" aria-selected="true" className="space-y-4">
                <div className="relative block w-full overflow-hidden rounded-3xl bg-[#efe7ff] text-left">
                  <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#5c35c4] text-white shadow-sm">
                    <Check size={18} strokeWidth={3} />
                  </div>

                  <div className="px-4 pb-2 pt-4 text-center">
                    <h3 className="text-[20px] font-extrabold leading-tight text-[#281d7a]">
                      {selectedTrainer.name}
                    </h3>
                  </div>

                  <div className="aspect-4/3 w-full overflow-hidden">
                    {selectedTrainer.imageSelect ? (
                      <img
                        src={selectedTrainer.imageSelect}
                        alt={selectedTrainer.name}
                        loading="lazy"
                        className="h-full w-full object-contain object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#7a68be]">
                        <UserRound size={52} strokeWidth={1.8} />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const trainerId = String(selectedTrainer.id);

                    if (playingId === trainerId) {
                      stop();
                    } else {
                      play(trainerId, selectedTrainer.intro);
                    }
                  }}
                  disabled={loadingId === String(selectedTrainer.id)}
                  className={`flex w-full items-center justify-center gap-2 ${appSheetFieldClass} px-3 py-3 text-[15px] font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
                    playingId === String(selectedTrainer.id)
                      ? "border-rose-300 bg-rose-50 text-rose-800"
                      : "text-[#3f2a7a]"
                  }`}
                >
                  {loadingId === String(selectedTrainer.id) ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Laddar...
                    </>
                  ) : playingId === String(selectedTrainer.id) ? (
                    <>
                      <Square size={15} className="fill-current" />
                      Stoppa
                    </>
                  ) : (
                    <>
                      <Volume2 size={16} />
                      Lyssna
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          <p className="mt-4 text-center text-[14px] font-semibold leading-relaxed text-[#5c567f]">
            Byt med pilarna tills du hittar en röst som känns tydlig och trygg.
          </p>
        </AppSheetCard>
      ) : (
        <AppSheetNotice>Inga tränare hittades.</AppSheetNotice>
      )}
    </section>
  );
}
