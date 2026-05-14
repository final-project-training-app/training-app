import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import IntensitySlider from "./IntensitySlider";
import ContextModel from "./ContextModal";
import TrainerSelectionModal from "./TrainerSelectionModal";
import { useMyProfile } from "../../../hooks/useMyProfile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import { AppSheet } from "../../../components/AppSheet";

const DEFAULT_DISPLAY_NAME = "No name entered";
const DEFAULT_INTENSITY_LEVEL = 2;
const DEFAULT_CONTEXT = "";

export default function SettingsModalSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { data: user, isSuccess, isLoading, isError, error } = useMyProfile();

  return (
    <SettingsModalBody
      open={open}
      setOpen={setOpen}
      isSuccess={isSuccess}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : null}
      userName={user?.name?.trim() ? user.name : DEFAULT_DISPLAY_NAME}
      intensityLevel={user?.intensityLevel ?? DEFAULT_INTENSITY_LEVEL}
      context={user?.context ?? DEFAULT_CONTEXT}
      trainerId={user?.trainerId ?? null}
    />
  );
}

function SettingsModalBody({
  open,
  setOpen,
  isSuccess,
  isLoading,
  isError,
  errorMessage,
  userName,
  intensityLevel: initialIntensityLevel,
  context: initialContext,
  trainerId: initialTrainerId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  userName: string;
  intensityLevel: number;
  context: string;
  trainerId: number | null;
}) {
  const [fullName, setFullName] = useState(userName);
  const [intensityLevel, setIntensityLevel] = useState(initialIntensityLevel);
  const [context, setContext] = useState(initialContext);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(
    initialTrainerId,
  );
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();

  useEffect(() => {
    setFullName(userName);
    setIntensityLevel(initialIntensityLevel);
    setContext(initialContext);
    setSelectedTrainerId(initialTrainerId);
  }, [userName, initialIntensityLevel, initialContext, initialTrainerId]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const showFeedback = (message: string) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    setSaveFeedback(message);

    feedbackTimeoutRef.current = setTimeout(() => {
      setSaveFeedback(null);
    }, 3000);
  };

  const handleSave = async () => {
    setSaveFeedback(null);

    if (selectedTrainerId == null) {
      showFeedback("Du måste välja en tränare först");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: fullName.trim() || DEFAULT_DISPLAY_NAME,
        intensityLevel,
        context,
        trainerId: Number(selectedTrainerId),
      });

      await queryClient.invalidateQueries({
        queryKey: ["myProfile"],
      });

      showFeedback("Inställningar sparade ✓");
    } catch (error) {
      console.error("[SettingsModalSheet] Save failed:", error);
      showFeedback("Kunde inte spara ändringarna");
    }
  };

  return (
    <AppSheet
      open={open}
      title="Inställningar"
      subtitle="Anpassa träningspasset efter dig"
      icon={<Settings size={20} strokeWidth={2.4} />}
      onClose={() => setOpen(false)}
      height="large"
    >
      <div className="space-y-6">
        <section>
          <label
            htmlFor="fullName"
            className="text-[15px] font-extrabold text-[#4f3bb8]"
          >
            Namn
          </label>

          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#ddd2ff] bg-[#f1ecff] px-4 py-3 text-[16px] font-semibold text-[#3f2a7a] outline-none focus:ring-2 focus:ring-[#c8bfeb]"
          />

          <p className="mt-2 text-[12px] font-semibold leading-snug text-[#6b59b2]">
            {isLoading
              ? "Hämtar namn från din profil..."
              : isSuccess
                ? fullName === DEFAULT_DISPLAY_NAME
                  ? "Ingen namnuppgift hittades. Standardnamn används."
                  : "Namnet är hämtat från din profil."
                : isError
                  ? (errorMessage ?? "Kunde inte hämta profilen.")
                  : ""}
          </p>
        </section>

        <IntensitySlider value={intensityLevel} onChange={setIntensityLevel} />

        <ContextModel value={context} onChange={setContext} />

        <section>
          <TrainerSelectionModal
            selectedTrainerId={selectedTrainerId}
            onTrainerSelect={setSelectedTrainerId}
          />
        </section>

        <section className="space-y-2.5">
          <button
            className="w-full rounded-2xl bg-[#5b3fd6] px-4 py-3.5 text-[16px] font-extrabold text-white transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={updateProfile.isPending}
            onClick={handleSave}
          >
            {updateProfile.isPending ? "Sparar..." : "Spara ändringar"}
          </button>

          {saveFeedback ? (
            <div
              role="status"
              className={`rounded-2xl border px-4 py-3 text-center text-[14px] font-bold ${
                saveFeedback.includes("✓")
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "border-rose-300 bg-rose-50 text-rose-950"
              }`}
            >
              {saveFeedback}
            </div>
          ) : null}

          <button
            className="w-full rounded-xl px-4 py-3 text-[15px] font-extrabold text-[#4d2a7a] transition active:scale-[0.985] active:bg-[#efe9fb]"
            onClick={() => setOpen(false)}
          >
            Avbryt
          </button>
        </section>
      </div>
    </AppSheet>
  );
}