import { useState } from "react";

const IntensitySlider = () => {
  const steps = [
    "Mycket lätt",
    "Lätt",
    "Medium",
    "Intensiv",
    "Mycket intensiv",
  ];
  // Default to 2 (Medium)
  const [value, setValue] = useState(2);

  const handleDotClick = (index: number) => {
    setValue(index);
  };

  return (
    <section className="mt-4 max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-purple-600">⚙️</span>
        <h2 className="font-bold text-gray-800">Intensitet</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Välj hur intensiv din träning eller stretching ska vara. Du kan alltid
        ändra senare.
      </p>

      <div className="relative px-4 py-8">
        {/* Container for dots and line */}
        <div className="relative">
          {/* Background progress line (from start to selected) */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 transition-all duration-300"
            style={{
              width: `${(value / (steps.length - 1)) * 100}%`,
            }}
          />

          {/* Background track line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-purple-200 -translate-y-1/2" />

          {/* Interactive dots */}
          <div className="relative flex justify-between">
            {steps.map((label, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1"
              >
                {/* Clickable Dot */}
                <button
                  onClick={() => handleDotClick(index)}
                  className={`w-6 h-6 rounded-full mb-4 transition-all duration-300 cursor-pointer border-2 ${
                    index <= value
                      ? "bg-purple-600 border-purple-600"
                      : "bg-purple-100 border-purple-300"
                  }`}
                  aria-label={`Select ${label}`}
                />
                <span
                  className={`text-xs text-center leading-tight transition-colors duration-300 ${
                    index === value
                      ? "text-purple-900 font-bold"
                      : "text-purple-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntensitySlider;
