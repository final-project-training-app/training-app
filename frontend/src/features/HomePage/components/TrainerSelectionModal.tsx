export default function TrainerSelectionModal(): JSX.Element | null {
  return (
    <>
      <section>
      <div className="mb-3 flex items-center gap-3 text-[#2b2277]">
        <h2 className="text-[clamp(1.75rem,4.4vw,3rem)] text-[#4f3bb8] font-bold leading-none tracking-tight">
          Välj Tränare
        </h2>
      </div>
        <p className="max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
            Välj en tränare som matchar din stil och dina mål. Varje tränare har
            sin egen unika personlighet och specialitet, så välj den som passar dig bäst!
        </p>
      
    </section>
    </>
  );
}
