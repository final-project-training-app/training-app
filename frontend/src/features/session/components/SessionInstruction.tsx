type SessionInstructionProps = {
  instruction: string;
};

export function SessionInstruction({ instruction }: SessionInstructionProps) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-3 text-2xl font-bold text-slate-950">Instruktion</h2>
      <p className="text-xl leading-relaxed text-slate-800">{instruction}</p>
    </section>
  );
}
