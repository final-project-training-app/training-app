import { useRef } from "react";
import IntensitySlider from "./IntensitySlider";

export default function SettingsModalSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const startY = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const diff = e.clientY - startY.current;

    // only close if dragged down enough
    if (diff > 100) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* overlay (click outside to close) */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* bottom sheet */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
        }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-5 shadow-2xl transition-transform duration-300 touch-none"
      >
        {/* drag handle (click to close) */}
        <div
          onClick={() => setOpen(false)}
          className="mx-auto mb-4 h-1.5 w-12 cursor-pointer rounded-full bg-gray-300"
        />

        <h1 className="text-lg font-semibold">Inställningar</h1>

        <section className="intensity mt-6">
          <IntensitySlider />
        </section>

        <section className="mt-4">
          <h2>Kontext</h2>
        </section>
        <section className="mt-6 flex gap-3">
          <button
            className="flex-1 rounded-xl bg-[#5a2d82] px-4 py-3 text-white font-semibold shadow-md transition-all duration-150 hover:bg-[#6a3893] active:scale-[0.97]"
            onClick={() => {
              // save logic here later
              console.log("saved");
            }}
          >
            Spara
          </button>

          <button
            className="flex-1 rounded-xl bg-white px-4 py-3 font-semibold text-[#4d2a7a] shadow-sm ring-1 ring-[#d4c4f4]/70 transition-all duration-150 hover:bg-[#f5efff] active:scale-[0.97]"
            onClick={() => {
              setOpen(false);
            }}
          >
            Avbryt
          </button>
        </section>
      </div>
    </>
  );
}
