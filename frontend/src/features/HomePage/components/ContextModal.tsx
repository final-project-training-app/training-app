import { FileText } from "lucide-react";

type ContextModelProps = {
  value: string;
  onChange: (value: string) => void;
};

const ContextModel = ({ value, onChange }: ContextModelProps) => {
  const MAX_CHARS = 1000;

  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-[#2b2277]">
        <FileText className="text-[var(--brand-primary)]" size={20} />
        <h2 className="text-[22px] font-extrabold leading-none tracking-tight text-[#4f3bb8]">
          Kontext
        </h2>
      </div>

      <p className="text-[15px] font-medium leading-relaxed text-[#312b70]">
        Berätta om behov, mål eller begränsningar så passet kan anpassas bättre.
      <p className="max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
        Berätta om behov, mål eller eventuella begränsningar så att passet kan
        anpassas bättre.
      </p>

      <div className="mt-3 rounded-2xl border border-[#ddd2ff] bg-[#f5f2fb] p-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          placeholder="T.ex. Jag har ont i knät och vill träna skonsamt."
          className="h-[132px] w-full resize-none border-none bg-transparent px-1 py-0.5 text-[14px] font-medium leading-relaxed text-[#1f1b3a] outline-none placeholder:text-[#8f89b3]"
        />

        <div className="mt-1 text-right text-[12px] font-semibold text-[#8d86bc]">
          {value.length}/{MAX_CHARS}
        </div>
      </div>
    </section>
  );
};

export default ContextModel;
