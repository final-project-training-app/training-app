export default function SettingsModalSheet({ open }: { open: boolean }) {
  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-5 shadow-2xl transition-transform duration-300
        ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" />

        <h1 className="text-lg font-semibold">Inställningar</h1>

        <section className="mt-4">
          <h2>Intensitet</h2>
        </section>

        <section className="mt-4">
          <h2>Kontext</h2>
        </section>
      </div>
    </>
  );
}