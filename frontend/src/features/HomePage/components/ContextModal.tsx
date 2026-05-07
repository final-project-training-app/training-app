import { useState } from "react";

const ContextModel = () => {
  const MAX_CHARS = 2000;
  const [context, setContext] = useState("");
  return (
    <section>
      <div className="mb-3 flex items-center gap-3 text-[#4f3bb8]">
        <span className="text-[clamp(1.7rem,4vw,2.35rem)] leading-none">
          📄
        </span>
        <h2 className="text-[clamp(1.75rem,4.4vw,3rem)] font-bold leading-none tracking-tight">
          Kontext
        </h2>
      </div>

      <p className="max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
        Beratta om behov, mal eller eventuella begransningar sa att passet kan
        anpassas battre.
      </p>
      <div className="mt-9 rounded-[24px] border-[3px] border-[#8f7dd6] bg-[#f5f2fb] p-6">
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          placeholder="T.ex. 'Jag har ont i knät och vill träna skonsamt'"
          className="h-80 w-full resize-none border-none bg-transparent text-[24px] leading-relaxed text-[#1f1b3a] outline-none placeholder:text-[#8f89b3] px-1 py-1"
        />
        <div className="mt-4 text-right text-[38px] text-[#8d86bc]">
          {context.length}/{MAX_CHARS}
        </div>
      </div>
    </section>
  );
};

export default ContextModel;
