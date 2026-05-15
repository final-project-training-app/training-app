import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { Settings } from "lucide-react";
import IntensitySlider from "./IntensitySlider";
import ContextModel from "./ContextModal";
import TrainerSelectionModal from "./TrainerSelectionModal";
import { useMyProfile } from "../../../hooks/useMyProfile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import {
  AppSheet,
  AppSheetCard,
  AppSheetNotice,
  AppSheetSectionText,
  AppSheetSectionTitle,
  appSheetFieldClass,
  appSheetPrimaryButtonClass,
  appSheetSecondaryButtonClass,
} from "../../../components/AppSheet";

type ProfileSettings = {
  name?: string | null;
  intensityLevel?: number | null;
  context?: string | null;
  trainerId?: number | null;
};

const INTENSITY_MIN = 1;
const INTENSITY_MAX = 5;
const DEFAULT_INTENSITY_LEVEL = 3;
const DEFAULT_TRAINER_ID = 1;

function normalizeIntensityLevel(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_INTENSITY_LEVEL;
  }

  return Math.min(INTENSITY_MAX, Math.max(INTENSITY_MIN, value));
}

function normalizeTrainerId(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_TRAINER_ID;
  }

  return value;
}

function SettingsStatusSheet({
  open,
  setOpen,
  message,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  message: string;
}) {
  return (
    <AppSheet
      open={open}
      title="Inställningar"
      subtitle=""
      icon={<Settings size={20} strokeWidth={2.4} />}
      onClose={() => setOpen(false)}
      height="compact"
      footer={
        <section className="space-y-2.5 pb-1">
          <button
            className={appSheetSecondaryButtonClass}
            onClick={() => setOpen(false)}
          >
            Stäng
          </button>
        </section>
      }
    >
      <AppSheetNotice>{message}</AppSheetNotice>
    </AppSheet>
  );
}

export default function SettingsModalSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  if (!open) {
    return null;
  }

  const { isLoaded, isSignedIn } = useAuth();
  const { data: user, isSuccess, isLoading, isError, error } = useMyProfile();

  if (isLoaded && !isSignedIn) {
    return (
      <SettingsStatusSheet
        open={open}
        setOpen={setOpen}
        message="Du är inte inloggad."
      />
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <SettingsStatusSheet
        open={open}
        setOpen={setOpen}
        message="Hämtar inställningar..."
      />
    );
  }

  if (isError || !isSuccess || !user) {
    return (
      <SettingsStatusSheet
        open={open}
        setOpen={setOpen}
        message={
          error instanceof Error
            ? error.message
            : "Kunde inte hämta inställningar."
        }
      />
    );
  }

  return (
    <SettingsModalBody
      open={open}
      setOpen={setOpen}
      profile={user}
    />
  );
}

function SettingsModalBody({
  open,
  setOpen,
  profile,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  profile: ProfileSettings;
}) {
  const [fullName, setFullName] = useState(profile.name?.trim() ?? "");
  const [intensityLevel, setIntensityLevel] = useState(() =>
    normalizeIntensityLevel(profile.intensityLevel),
  );
  const [context, setContext] = useState(profile.context ?? "");
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(
    normalizeTrainerId(profile.trainerId),
  );
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateProfile = useUpdateProfile();

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
        name: fullName.trim(),
        intensityLevel: normalizeIntensityLevel(intensityLevel),
        context,
        trainerId: Number(selectedTrainerId),
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
      footer={
        <section className="space-y-2.5 pb-1">
          <button
            className={appSheetPrimaryButtonClass}
            disabled={updateProfile.isPending}
            onClick={handleSave}
          >
            {updateProfile.isPending ? "Sparar..." : "Spara ändringar"}
          </button>

          {saveFeedback ? (
            <AppSheetNotice
              tone={saveFeedback.includes("✓") ? "success" : "danger"}
            >
              {saveFeedback}
            </AppSheetNotice>
          ) : null}

          <button
            className={appSheetSecondaryButtonClass}
            onClick={() => setOpen(false)}
          >
            Avbryt
          </button>
        </section>
      }
    >
      <div className="space-y-4 pb-2">
        <AppSheetCard>
          <label htmlFor="fullName" className="block">
            <AppSheetSectionTitle>Namn</AppSheetSectionTitle>
          </label>

          <AppSheetSectionText>
            Namnet används av coachen under samtalet.
          </AppSheetSectionText>

          <div className={`${appSheetFieldClass} mt-3 px-3 py-2.5`}>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-none bg-transparent px-1 py-1 text-[16px] font-semibold text-[#221447] outline-none placeholder:text-[#8f89b3]"
            />
          </div>

          <p className="mt-2 text-[12px] font-semibold leading-snug text-[#6b59b2]">
            {fullName.trim()
              ? "Namnet är hämtat från din profil."
              : "Ingen namnuppgift hittades."}
          </p>
        </AppSheetCard>

        <section>
          <TrainerSelectionModal
            selectedTrainerId={selectedTrainerId}
            onTrainerSelect={setSelectedTrainerId}
          />
        </section>

        <IntensitySlider value={intensityLevel} onChange={setIntensityLevel} />

        <ContextModel value={context} onChange={setContext} />
      </div>
    </AppSheet>
  );
}
