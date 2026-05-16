import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AppSheetCard,
  AppSheetSectionText,
  AppSheetSectionTitle,
} from "../../../components/AppSheet";

type IntensitySliderProps = {
  value: number;
  onChange: (value: number) => void;
};

const INTENSITY_MIN = 1;
const INTENSITY_MAX = 5;

const IntensitySlider = ({ value, onChange }: IntensitySliderProps) => {
  const { t } = useTranslation();
  const steps = [
    t("intensitySlider.0"),
    t("intensitySlider.1"),
    t("intensitySlider.2"),
    t("intensitySlider.3"),
    t("intensitySlider.4"),
  ];
  const safeValue = Math.min(INTENSITY_MAX, Math.max(INTENSITY_MIN, value));
  const progress =
    ((safeValue - INTENSITY_MIN) / (INTENSITY_MAX - INTENSITY_MIN)) * 100;

  return (
    <AppSheetCard>
      <div className="mb-2 flex items-center gap-2 text-[#4f3bb8]">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-(--brand-primary)">
          <Settings size={20} />
        </div>

        <AppSheetSectionTitle>
          {t("intensitySlider.title")}
        </AppSheetSectionTitle>
      </div>

      <AppSheetSectionText>
        {t("intensitySlider.description")}
      </AppSheetSectionText>

      <div className="mt-5 px-1">
        <div className="relative">
          <div className="pointer-events-none absolute left-2 right-2 top-4 h-1 rounded-full bg-[#c7bfe8]" />

          <div
            className="pointer-events-none absolute left-2 top-4 h-1 rounded-full bg-[#5b44c9] transition-all duration-150"
            style={{ width: `calc(${progress}% - 4px)` }}
          />

          <input
            type="range"
            min={INTENSITY_MIN}
            max={INTENSITY_MAX}
            value={safeValue}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="absolute inset-x-0 top-0 z-20 h-10 w-full cursor-pointer opacity-0"
            aria-label={t("intensitySlider.title")}
          />

          <div className="relative z-30 flex items-center justify-between">
            {steps.map((label, index) =>
              (() => {
                const stepValue = index + INTENSITY_MIN;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onChange(stepValue)}
                    className="-mx-2 px-2"
                    aria-label={`${t("intensitySlider.choose")} ${label}`}
                  >
                    <span
                      className={`block rounded-full transition-all duration-150 ${
                        stepValue === safeValue
                          ? "h-9 w-9 border-4 border-[#5b44c9] bg-[#5b44c9]"
                          : "h-7 w-7 border-[3px] border-[#b6abd9] bg-[#f5f2fb]"
                      }`}
                    />
                  </button>
                );
              })(),
            )}
          </div>

          <div className="mt-4 grid grid-cols-5 gap-1 text-center">
            {steps.map((label, index) =>
              (() => {
                const stepValue = index + INTENSITY_MIN;

                return (
                  <span
                    key={label}
                    className={`text-[11px] font-bold leading-tight transition ${
                      stepValue === safeValue
                        ? "text-[#2b2277]"
                        : "text-[#6f6a93]"
                    }`}
                  >
                    {label}
                  </span>
                );
              })(),
            )}
          </div>
        </div>
      </div>
    </AppSheetCard>
  );
};

export default IntensitySlider;
