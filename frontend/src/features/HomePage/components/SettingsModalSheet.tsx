import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SignOutButton, useAuth } from "@clerk/react";
import { useNavigate } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import IntensitySlider from "./IntensitySlider";
import ContextModel from "./ContextModal";
import TrainerSelectionModal from "./TrainerSelectionModal";
import { useMyProfile } from "../../../hooks/useMyProfile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";

const SHEET_CLOSE_DURATION_MS = 350;

import {
  AppSheet,
  AppSheetNotice,
  AppSheetSectionText,
  AppSheetSectionTitle,
  appSheetPrimaryButtonClass,
  appSheetSecondaryButtonClass,
} from "../../../components/AppSheet";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import SupportSheet from "./SupportSheet";
import { useTranslation } from "react-i18next";

type ProfileSettings = {
  name?: string | null;
  intensityLevel?: number | null;
  context?: string | null;
  trainerId?: number | null;
  isAdmin?: boolean;
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
  const { t } = useTranslation();
  return (
    <>
      <AppSheet
        open={open}
        title={t("settings.title")}
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
              {t("settings.close")}
            </button>
          </section>
        }
      >
        <AppSheetNotice>{message}</AppSheetNotice>
      </AppSheet>
    </>
  );
}

export default function SettingsModalSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: user, isSuccess, isLoading, isError, error } = useMyProfile();
  const [isRendered, setIsRendered] = useState(open);

  useLayoutEffect(() => {
    if (open) {
      setIsRendered(true);
    } else {
      const tid = setTimeout(() => setIsRendered(false), SHEET_CLOSE_DURATION_MS);
      return () => clearTimeout(tid);
    }
  }, [open]);

  if (!isRendered) {
    return null;
  }

  if (isLoaded && !isSignedIn) {
    return (
      <SettingsStatusSheet
        open={open}
        setOpen={setOpen}
        message={t("settings.notLoggedIn")}
      />
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <SettingsStatusSheet
        open={open}
        setOpen={setOpen}
        message={t("settings.loading")}
      />
    );
  }

  if (isError || !isSuccess || !user) {
    return (
      <SettingsStatusSheet
        open={open}
        setOpen={setOpen}
        message={
          error instanceof Error ? error.message : t("settings.fetchError")
        }
      />
    );
  }

  return <SettingsModalBody open={open} setOpen={setOpen} profile={user} />;
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile.name?.trim() ?? "");
  const [intensityLevel, setIntensityLevel] = useState(() =>
    normalizeIntensityLevel(profile.intensityLevel),
  );
  const [context, setContext] = useState(profile.context ?? "");
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(
    normalizeTrainerId(profile.trainerId),
  );
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportInitialMode, setSupportInitialMode] = useState<"faq" | "form">(
    "faq",
  );

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const updateProfile = useUpdateProfile();

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save trainer immediately when selection changes, using last-saved profile
  // values for other fields to avoid persisting incomplete form edits.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (selectedTrainerId == null) return;
    updateProfile
      .mutateAsync({
        name: (profile.name ?? "").trim(),
        intensityLevel: normalizeIntensityLevel(profile.intensityLevel),
        context: profile.context ?? "",
        trainerId: selectedTrainerId,
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrainerId]);

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

    try {
      await updateProfile.mutateAsync({
        name: fullName.trim(),
        intensityLevel: normalizeIntensityLevel(intensityLevel),
        context,
        trainerId: Number(selectedTrainerId),
      });

      showFeedback(t("settings.saveSuccess"));
    } catch (error) {
      console.error("[SettingsModalSheet] Save failed:", error);
      showFeedback(t("settings.saveError"));
    }
  };

  return (
    <>
      <AppSheet
        open={open}
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
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
              {updateProfile.isPending
                ? t("settings.saving")
                : t("settings.saveChanges")}
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
              {t("settings.cancel")}
            </button>
          </section>
        }
      >
        <div className="divide-y divide-(--brand-border)/60 pb-2">
          <section className="py-5">
            <div className="flex justify-between items-center">
              <AppSheetSectionTitle>
                {t("settings.language")}
              </AppSheetSectionTitle>
              <LanguageSwitcher
                value={i18n.language}
                onChange={(lng: string) => i18n.changeLanguage(lng)}
              />
            </div>
          </section>

          <section className="py-5">
            <div className="flex justify-between items-center">
              <AppSheetSectionTitle>
                {t("settings.getHelp")}
              </AppSheetSectionTitle>
              <button
                className="rounded-full px-4 py-2 text-[length:var(--text-sm)] font-extrabold bg-(--brand-primary) text-white hover:opacity-95 transition"
                onClick={() => {
                  setSupportInitialMode("form");
                  setSupportOpen(true);
                }}
              >
                {t("settings.getHelpButton")}
              </button>
            </div>
          </section>

          <section className="py-5">
            <label htmlFor="fullName" className="block">
              <AppSheetSectionTitle>
                {t("settings.fullName")}
              </AppSheetSectionTitle>
            </label>

            <AppSheetSectionText>
              {t("settings.fullNameDescription")}
            </AppSheetSectionText>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-(--brand-border-field) bg-(--brand-control) px-4 py-3.5 text-[length:var(--text-base)] font-semibold text-(--brand-ink) outline-none placeholder:text-(--brand-muted) focus:border-(--brand-border-strong) transition"
            />

            <p className="mt-2 text-[length:var(--text-xs)] font-semibold leading-snug text-(--brand-body-ink)">
              {fullName.trim()
                ? t("settings.fullNameFound")
                : t("settings.fullNameNotFound")}
            </p>
          </section>

          <section className="py-5">
            <TrainerSelectionModal
              selectedTrainerId={selectedTrainerId}
              onTrainerSelect={setSelectedTrainerId}
            />
          </section>

          <section className="py-5">
            <IntensitySlider
              value={intensityLevel}
              onChange={setIntensityLevel}
            />
          </section>

          <section className="py-5">
            <ContextModel value={context} onChange={setContext} />
          </section>

          <section className="pt-5 pb-1 space-y-2">
            {profile.isAdmin && (
              <button
                className={appSheetSecondaryButtonClass}
                onClick={() => {
                  setOpen(false);
                  void navigate({ to: "/admin/workouts" });
                }}
              >
                {t("admin.page")}
              </button>
            )}
            <SignOutButton>
              <button className={appSheetSecondaryButtonClass}>
                {t("auth.logout")}
              </button>
            </SignOutButton>
          </section>
        </div>
      </AppSheet>
      <SupportSheet
        open={supportOpen}
        setOpen={setSupportOpen}
        initialMode={supportInitialMode}
      />
    </>
  );
}
