import { useState } from "react";

const IntensitySlider = () => {
  const steps = [
    "Mycket latt",
    "Latt",
    "Medium",
    "Intensiv",
    "Mycket intensiv",
  ];

  const [value, setValue] = useState(2);
  const progress = (value / (steps.length - 1)) * 100;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-3 text-[#4f3bb8]">
        <span className="text-[clamp(1.7rem,4vw,2.35rem)] leading-none">
          ⚙️
        </span>
        <h2 className="text-[clamp(1.75rem,4.4vw,3rem)] font-bold leading-none tracking-tight">
          Intensitet
        </h2>
      </div>

      <p className="max-w-3xl text-[clamp(1.2rem,3.4vw,2rem)] leading-[1.28] text-[#2f2b68]">
        Valj hur intensiv din traning eller stretching ska vara. Du kan alltid
        andra senare.
      </p>

      <div className="mt-14 px-2">
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
                  className={`block h-11 w-11 rounded-full border-[4px] transition-all duration-150 ${
                    index === value
                      ? "border-[#5b44c9] bg-[#5b44c9]"
                      : "border-[#b6abd9] bg-[#f5f2fb]"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-9 grid grid-cols-5 gap-2 text-center">
            {steps.map((label, index) => (
              <span
                key={label}
                className={`leading-[1.16] transition-all duration-150 ${
                  index === value
                    ? "text-[clamp(1.05rem,2.9vw,1.65rem)] font-bold text-[#2b2277]"
                    : "text-[clamp(0.95rem,2.5vw,1.5rem)] font-medium text-[#342f77]"
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
