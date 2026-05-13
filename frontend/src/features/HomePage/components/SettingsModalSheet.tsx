import { useRef, useState } from "react";
import IntensitySlider from "./IntensitySlider";
import ContextModel from "./ContextModal";
import { useMyProfile } from "../../../hooks/useMyProfile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";

const DEFAULT_DISPLAY_NAME = "No name entered";

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
      key={open ? "open" : "closed"}
      open={open}
      setOpen={setOpen}
      isSuccess={isSuccess}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : null}
      userName={user?.name?.trim() ? user.name : DEFAULT_DISPLAY_NAME}
      intensityLevel={user?.intensityLevel ?? 2}
      context={user?.context ?? ""}
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
}) {
  const DEFAULT_HEIGHT = 78;
  const MIN_HEIGHT = 62;
  const MAX_HEIGHT = 88;
  const DISMISS_HEIGHT = 52;

  const [sheetHeight, setSheetHeight] = useState(DEFAULT_HEIGHT);
  const startY = useRef(0);
  const startHeight = useRef(DEFAULT_HEIGHT);
  const isDragging = useRef(false);

  const [fullName, setFullName] = useState(userName);
  const [intensityLevel, setIntensityLevel] = useState(initialIntensityLevel);
  const [context, setContext] = useState(initialContext);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const updateProfile = useUpdateProfile();

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = sheetHeight;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;

    const deltaY = e.clientY - startY.current;
    const deltaVh = (deltaY / window.innerHeight) * 100;
    const nextHeight = startHeight.current - deltaVh;

    setSheetHeight(Math.min(MAX_HEIGHT, Math.max(44, nextHeight)));
  };

  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;

    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (sheetHeight < DISMISS_HEIGHT) {
      setOpen(false);
      setSheetHeight(DEFAULT_HEIGHT);
      return;
    }

    setSheetHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, sheetHeight)));
  };

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-[#221447]/18 backdrop-blur-[3px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          height: `${sheetHeight}dvh`,
        }}
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[2rem] bg-[#fbf8ff] px-5 pb-6 pt-3 shadow-[0_-18px_60px_rgba(55,38,110,0.20)] transition-transform duration-300"
      >
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          className="mx-auto mb-5 h-1.5 w-14 cursor-grab rounded-full bg-[#c8bfeb] active:cursor-grabbing"
        />

        <div className="mx-auto w-full">
          <h1 className="text-[34px] font-extrabold leading-none tracking-tight text-[#281d7a]">
            Inställningar
          </h1>

          <section className="mt-6">
            <label
              htmlFor="fullName"
              className="text-[18px] font-extrabold leading-none text-[#4f3bb8]"
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
                    ? "Ingen namnuppgift hittades."
                    : "Namnet är hämtat från din profil."
                  : isError
                    ? (errorMessage ?? "Kunde inte hämta profilen.")
                    : ""}
            </p>
          </section>

          <section className="mt-6">
            <IntensitySlider
              value={intensityLevel}
              onChange={setIntensityLevel}
            />
          </section>

          <section className="mt-6">
            <ContextModel value={context} onChange={setContext} />
          </section>

          <section className="mt-6 space-y-2.5">
            <button
              className="w-full rounded-2xl bg-[#5b3fd6] px-4 py-3.5 text-[16px] font-extrabold text-white transition active:scale-[0.985]"
              disabled={updateProfile.isPending}
              onClick={() => {
                setSaveFeedback(null);
                updateProfile.mutate(
                  {
                    name: fullName.trim() || DEFAULT_DISPLAY_NAME,
                    intensityLevel,
                    context,
                  },
                  {
                    onSuccess: () => setSaveFeedback("Inställningar sparade ✓"),
                    onError: () =>
                      setSaveFeedback("Kunde inte spara ändringarna"),
                  },
                );
              }}
            >
              {updateProfile.isPending ? "Sparar..." : "Spara ändringar"}
            </button>

            {saveFeedback ? (
              <div className="rounded-2xl border border-[#ddd2ff] bg-[#f1ecff] px-4 py-3 text-center text-[14px] font-bold text-[#3f2a7a]">
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
      </div>
    </>
  );
}
