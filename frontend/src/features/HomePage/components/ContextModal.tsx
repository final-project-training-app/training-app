import { FileText } from "lucide-react";
type ContextModelProps = {
  value: string;
  onChange: (value: string) => void;
};

const ContextModel = ({ value, onChange }: ContextModelProps) => {
  const MAX_CHARS = 1000;

  return (
    <section>
      <div className="mb-3 flex items-center gap-3 text-[#2b2277]">
        <FileText className="text-[var(--brand-primary)]" size={28} />
        <h2 className="text-[clamp(1.75rem,4.4vw,3rem)] text-[#4f3bb8] font-bold leading-none tracking-tight">
          Kontext
        </h2>
      </div>

      <p className="max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
        Berätta om behov, mål eller eventuella begränsningar så att passet kan
        anpassas bättre.
      </p>
      <div className="mt-5 rounded-[24px] border-[3px] border-[#8f7dd6] bg-[#f5f2fb] p-4 sm:p-5">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          placeholder="T.ex. 'Jag har ont i knät och vill träna skonsamt'"
          className="h-[clamp(12rem,25vh,15.5rem)] w-full resize-none border-none bg-transparent px-1 py-0.5 text-[clamp(1rem,2.1vw,1.3rem)] leading-[1.45] text-[#1f1b3a] outline-none placeholder:text-[#8f89b3]"
        />
        <div className="mt-1.5 text-right text-[clamp(0.95rem,1.9vw,1.2rem)] text-[#8d86bc]">
          {value.length}/{MAX_CHARS}
        </div>
      </div>
    </section>
  );
};

export default ContextModel;
