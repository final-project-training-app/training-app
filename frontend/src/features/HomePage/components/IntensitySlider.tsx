import { useState } from "react";

const IntensitySlider = () => {
  const steps = [
    "Mycket lätt",
    "Lätt",
    "Medium",
    "Intensiv",
    "Mycket intensiv",
  ];

  const [value, setValue] = useState(2);
  const progress = (value / (steps.length - 1)) * 100;

  return (
    <section>
      <div className="mb-3 flex items-center gap-3 text-[#4f3bb8]">
        <span className="text-[clamp(1.7rem,4vw,2.35rem)] leading-none">
          ⚙️
        </span>
        <h2 className="text-[clamp(1.75rem,4.4vw,3rem)] font-bold leading-none tracking-tight">
          Intensitet
        </h2>
      </div>

      <p className="max-w-3xl text-[clamp(1.15rem,3vw,1.85rem)] leading-relaxed tracking-[0.01em] text-[#312b70]">
        Valj hur intensiv din traning eller stretching ska vara. Du kan alltid
        andra senare.
      </p>

      <div className="mt-10 px-1 sm:px-2">
        <div className="relative">
          <div className="pointer-events-none absolute left-2 right-2 top-5 h-1.5 rounded-full bg-[#c7bfe8]" />
          <div
            className="pointer-events-none absolute left-2 top-5 h-1.5 rounded-full bg-[#5b44c9] transition-all duration-150"
            style={{ width: `calc(${progress}% - 4px)` }}
          />

          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
            className="absolute inset-x-0 top-0 z-20 h-10 w-full cursor-pointer opacity-0"
            aria-label="Valj intensitet"
          />

          <div className="relative z-30 flex items-center justify-between">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setValue(index)}
                className="-mx-2 px-2"
                aria-label={`Valj ${label}`}
              >
                <span
                  className={`block rounded-full transition-all duration-150 flex items-center justify-center ${
                    index === value
                      ? "h-14 w-14 border-[5px] bg-[#5b44c9] border-[#5b44c9] shadow-lg"
                      : "h-11 w-11 border-[4px] bg-[#f5f2fb] border-[#b6abd9]"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-5 gap-1.5 text-center sm:gap-2">
            {steps.map((label, index) => (
              <span
                key={label}
                className={`leading-[1.16] transition-all duration-150 ${
                  index === value
                    ? "text-[clamp(1.25rem,3.3vw,2rem)] font-bold text-[#2b2277]"
                    : "text-[clamp(1.05rem,2.7vw,1.6rem)] font-medium text-[#342f77]"
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
