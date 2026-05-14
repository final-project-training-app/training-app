import { Settings } from "lucide-react";

type IntensitySliderProps = {
  value: number;
  onChange: (value: number) => void;
};

const IntensitySlider = ({ value, onChange }: IntensitySliderProps) => {
  const steps = [
    "Mycket lätt",
    "Lätt",
    "Medium",
    "Intensiv",
    "Mycket intensiv",
  ];
  const progress = (value / (steps.length - 1)) * 100;

  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-[#4f3bb8]">
        <Settings className="text-[var(--brand-primary)]" size={20} />
        <h2 className="text-[22px] font-extrabold leading-none tracking-tight">
          Intensitet
        </h2>
      </div>

      <p className="max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
        Välj hur intensiv din träning eller stretching ska vara. Du kan alltid
        ändra senare.
      </p>

      <div className="mt-6 px-1">
        <div className="relative">
          <div className="pointer-events-none absolute left-2 right-2 top-4 h-1 rounded-full bg-[#c7bfe8]" />

          <div
            className="pointer-events-none absolute left-2 top-4 h-1 rounded-full bg-[#5b44c9] transition-all duration-150"
            style={{ width: `calc(${progress}% - 4px)` }}
          />

          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="absolute inset-x-0 top-0 z-20 h-10 w-full cursor-pointer opacity-0"
            aria-label="Välj intensitet"
          />

          <div className="relative z-30 flex items-center justify-between">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => onChange(index)}
                className="-mx-2 px-2"
                aria-label={`Välj ${label}`}
              >
                <span
                  className={`block rounded-full transition-all duration-150 ${
                    index === value
                      ? "h-9 w-9 border-[4px] border-[#5b44c9] bg-[#5b44c9]"
                      : "h-7 w-7 border-[3px] border-[#b6abd9] bg-[#f5f2fb]"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-5 gap-1 text-center">
            {steps.map((label, index) => (
              <span
                key={label}
                className={`text-[11px] font-bold leading-tight transition ${
                  index === value ? "text-[#2b2277]" : "text-[#6f6a93]"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntensitySlider;
