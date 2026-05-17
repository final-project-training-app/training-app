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
    <div className="flex gap-2">
      {LANGUAGES.map((lang) => {
        const isActive = activeLang === lang.code;

        return (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`
              px-3 py-1.5 rounded-xl text-sm font-extrabold transition active:scale-[0.97]
              ${
                isActive
                  ? "bg-(--brand-primary) text-white hover:bg-(--brand-primary-strong)"
                  : "border border-(--brand-btn-secondary-border) bg-(--brand-btn-secondary-bg) text-(--brand-btn-secondary-text) hover:bg-(--brand-btn-secondary-hover)"
              }
            `}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
