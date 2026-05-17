import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sv", label: "Svenska" },
];

export default function LanguageSwitcher({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (lang: string) => void;
}) {
  const { i18n } = useTranslation();

  const activeLang = value ?? i18n.language;

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    onChange?.(lang);
  };

  return (
    <div className="relative">
      <select
        value={activeLang}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none rounded-xl border border-(--brand-btn-secondary-border) bg-(--brand-btn-secondary-bg) px-3 py-2 pr-8 text-[length:var(--text-sm)] font-extrabold text-(--brand-btn-secondary-text) cursor-pointer focus:outline-none focus:border-(--brand-border-strong) transition"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={2.5}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--brand-btn-secondary-text)"
      />
    </div>
  );
}
