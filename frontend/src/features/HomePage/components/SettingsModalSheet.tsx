import { useEffect, useRef, useState } from "react";
import IntensitySlider from "./IntensitySlider";
import ContextModel from "./ContextModal";
import { useToast } from "../../../hooks/useToast";

export default function SettingsModalSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const DEFAULT_HEIGHT = 96;
  const MIN_HEIGHT = 68;
  const MAX_HEIGHT = 98;
  const DISMISS_HEIGHT = 54;

  const [sheetHeight, setSheetHeight] = useState(DEFAULT_HEIGHT);
  const startY = useRef(0);
  const startHeight = useRef(DEFAULT_HEIGHT);
  const isDragging = useRef(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSheetHeight(DEFAULT_HEIGHT);
    }
  }, [open]);

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
        className="fixed bottom-0 left-0 right-0 z-50 overflow-y-auto rounded-t-[2.25rem] bg-[#f7f5fc] px-6 pb-7 pt-4 shadow-2xl transition-transform duration-300"
      >
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          className="mx-auto mb-6 h-2.5 w-20 cursor-grab rounded-full bg-[#c8bfeb] active:cursor-grabbing"
        />

        <div className="mx-auto w-full max-w-4xl">
          <h1 className="text-center text-[clamp(2.15rem,6vw,4.35rem)] font-bold leading-none tracking-tight text-[#281d7a]">
            Installningar
          </h1>

          <section className="mt-9">
            <IntensitySlider />
          </section>

          <section className="mt-8">
            <IntensitySlider />
          </section>

          <section className="mt-7">
            <ContextModel />
          </section>

          <section className="mt-2 space-y-2.5 md:mt-1 md:space-y-2">
            <button
              className="w-full rounded-2xl bg-gradient-to-r from-[#5c35c4] to-[#4a2dac] px-4 py-5 text-[clamp(1.3rem,3.8vw,2.1rem)] font-semibold text-white shadow-md transition-all duration-150 hover:brightness-105 active:scale-[0.985] active:brightness-90 md:py-6"
              onClick={() => {
                console.log("saved");
                showToast("Inställningar sparade ✓");
              }}
            >
              Spara ändringar
            </button>

            <button
              className="w-full rounded-xl px-4 py-3 text-[clamp(1.24rem,3.5vw,1.95rem)] font-semibold text-[#4d2a7a] transition-all duration-150
  hover:text-[#3f2066]
  active:bg-[#efe9fb] active:text-[#3f2066] active:scale-[0.985]"
              onClick={() => setOpen(false)}
            >
              Avbryt
            </button>
            {toast && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-2xl bg-[#f1ecff] text-[#3f2a7a] px-6 py-3 text-[1.2rem] font-semibold shadow-lg border border-[#ddd2ff]">
                {" "}
                {toast}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
