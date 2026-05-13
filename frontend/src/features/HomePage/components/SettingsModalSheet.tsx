import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import IntensitySlider from "./IntensitySlider";
import ContextModel from "./ContextModal";
import { useMyProfile } from "../../../hooks/useMyProfile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import TrainerSelectionModal from "./TrainerSelectionModal";

const DEFAULT_DISPLAY_NAME = "No name entered";

export default function SettingsModalSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { isSignedIn } = useAuth();
  const { data: user, isSuccess, isLoading, isError, error } = useMyProfile();

  // Default to trainer 1 if not logged in, otherwise use trainer from database
  const defaultTrainerId = isSignedIn ? (user?.trainerId ?? 1) : 1;

  return (
    <SettingsModalBody
      open={open}
      setOpen={setOpen}
      isSuccess={isSuccess}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : null}
      userName={user?.name?.trim() ? user.name : DEFAULT_DISPLAY_NAME}
      intensityLevel={user?.intensityLevel ?? 2}
      context={user?.context ?? ""}
      trainerId={defaultTrainerId}
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
  trainerId: number;
}) {
  const DEFAULT_HEIGHT = 96;
  const MIN_HEIGHT = 68;
  const MAX_HEIGHT = 98;
  const DISMISS_HEIGHT = 54;

  const [sheetHeight, setSheetHeight] = useState(DEFAULT_HEIGHT);
  const startY = useRef(0);
  const startHeight = useRef(DEFAULT_HEIGHT);
  const isDragging = useRef(false);
  const [fullName, setFullName] = useState(userName);
  const [intensityLevel, setIntensityLevel] = useState(initialIntensityLevel);
  const [context, setContext] = useState(initialContext);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(
    initialTrainerId ?? 1,
  );
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateProfile = useUpdateProfile();
  const prevOpenRef = useRef(open);

  useEffect(() => {
    setSelectedTrainerId(initialTrainerId ?? 1);
  }, [initialTrainerId]);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSelectedTrainerId(initialTrainerId ?? 1);
      setFullName(userName);
      setIntensityLevel(initialIntensityLevel);
      setContext(initialContext);
    }
    prevOpenRef.current = open;
  }, [
    open,
    initialTrainerId,
    userName,
    initialIntensityLevel,
    initialContext,
  ]);

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = sheetHeight;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) {
      return;
    }

    const deltaY = e.clientY - startY.current;
    const deltaVh = (deltaY / window.innerHeight) * 100;
    const nextHeight = startHeight.current - deltaVh;
    setSheetHeight(Math.min(MAX_HEIGHT, Math.max(44, nextHeight)));
  };

  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) {
      return;
    }

    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (sheetHeight < DISMISS_HEIGHT) {
      setOpen(false);
      setSheetHeight(DEFAULT_HEIGHT);
      return;
    }

    const clamped = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, sheetHeight));
    setSheetHeight(clamped);
  };

  return (
    <>
      {/* overlay (click outside to close) */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/35 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* bottom sheet */}
      <div
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          height: `${sheetHeight}dvh`,
        }}
        className="fixed bottom-0 left-0 right-0 z-50 overflow-y-auto rounded-t-[2.25rem] bg-[linear-gradient(180deg,#faf8ff_0%,#f7f5fc_45%,#f3effb_100%)] px-6 pb-7 pt-4 shadow-[0_-12px_40px_-8px_rgba(40,29,122,0.18)] transition-[transform,box-shadow] duration-300 ease-out"
      >
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          className="mx-auto mb-6 h-2.5 w-20 cursor-grab rounded-full bg-[#c8bfeb] active:cursor-grabbing"
        />

        <div className="mx-auto w-full max-w-4xl">
          <h1 className="text-center text-[clamp(2.15rem,6vw,4.35rem)] font-bold leading-none tracking-tight bg-gradient-to-r from-[#1a0f52] via-[#5c35c4] to-[#281d7a] bg-clip-text text-transparent drop-shadow-sm">
            Installningar
          </h1>

          <section className="mt-9">
            <div>
              <label
                htmlFor="fullName"
                className="text-[clamp(1.75rem,4.4vw,3rem)] text-[#4f3bb8] font-bold leading-none tracking-tight"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-3 w-full rounded-xl border border-[#ddd2ff] bg-[#f1ecff] px-4 py-3 text-[clamp(1.15rem,3vw,1.85rem)] text-[#3f2a7a] outline-none focus:ring-2 focus:ring-[#c8bfeb]"
              />
              <p className="mt-2 text-sm font-medium text-[#6b59b2]">
                {isLoading
                  ? "Hämtar namn från din profil..."
                  : isSuccess
                    ? fullName === DEFAULT_DISPLAY_NAME
                      ? "Ingen Clerk-namnuppgift hittades. Standardsnamn används."
                      : "Namnet är hämtat från din profil."
                    : isError
                      ? (errorMessage ?? "Kunde inte hämta profilen.")
                      : ""}
              </p>
            </div>
          </section>

          <section className="mt-8">
            <IntensitySlider
              value={intensityLevel}
              onChange={setIntensityLevel}
            />
          </section>

          <section className="mt-7">
            <ContextModel value={context} onChange={setContext} />
          </section>

          <section className="mt-6">
            <p className="mb-3 text-center text-sm font-medium text-[#6b59b2] md:text-base">
              Byt tränare nedan och tryck sedan{" "}
              <span className="font-bold text-[#4f3bb8]">Spara ändringar</span>{" "}
              så valet sparas i din profil.
            </p>
            <TrainerSelectionModal
              selectedTrainerId={selectedTrainerId}
              onTrainerSelect={setSelectedTrainerId}
            />
          </section>

          <section className="mt-2 space-y-2.5 md:mt-1 md:space-y-2">
            <button
              className="w-full rounded-2xl bg-gradient-to-r from-[#5c35c4] to-[#4a2dac] px-4 py-5 text-[clamp(1.3rem,3.8vw,2.1rem)] font-semibold text-white shadow-md transition-all duration-150 hover:shadow-[0_8px_28px_-6px_rgba(74,45,172,0.55)] hover:brightness-105 active:scale-[0.985] active:brightness-90 md:py-6"
              disabled={updateProfile.isPending}
              onClick={() => {
                // Clear existing feedback timeout
                if (feedbackTimeoutRef.current) {
                  clearTimeout(feedbackTimeoutRef.current);
                }
                setSaveFeedback(null);

                const profileData = {
                  name: fullName.trim() || DEFAULT_DISPLAY_NAME,
                  intensityLevel,
                  context,
                  trainerId: selectedTrainerId ?? null,
                };

                updateProfile.mutate(profileData, {
                  onSuccess: () => {
                    setSaveFeedback("Inställningar sparade ✓");
                    // Keep feedback visible for 3 seconds
                    feedbackTimeoutRef.current = setTimeout(() => {
                      setSaveFeedback(null);
                    }, 3000);
                  },
                  onError: (error) => {
                    console.error("[SettingsModalSheet] Save failed:", error);
                    setSaveFeedback("Kunde inte spara ändringarna");
                    feedbackTimeoutRef.current = setTimeout(() => {
                      setSaveFeedback(null);
                    }, 3000);
                  },
                });
              }}
            >
              {updateProfile.isPending ? "Sparar..." : "Spara ändringar"}
            </button>

            {saveFeedback ? (
              <div
                role="status"
                className={`rounded-2xl border px-4 py-3 text-center text-[1.05rem] font-semibold shadow-sm motion-safe:transition-all motion-safe:duration-300 ${
                  saveFeedback.includes("✓")
                    ? "border-emerald-400/45 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500/15"
                    : "border-rose-300/50 bg-rose-50/90 text-rose-950 ring-1 ring-rose-500/15"
                }`}
              >
                {saveFeedback}
              </div>
            ) : null}

            <button
              className="w-full rounded-xl px-4 py-3 text-[clamp(1.24rem,3.5vw,1.95rem)] font-semibold text-[#4d2a7a] transition-all duration-150
  hover:text-[#3f2066]
  active:bg-[#efe9fb] active:text-[#3f2066] active:scale-[0.985]"
              onClick={() => setOpen(false)}
            >
              Avbryt
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
