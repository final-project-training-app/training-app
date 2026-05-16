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
              px-3 py-1 rounded-md text-sm font-medium transition
              ${
                isActive
                  ? "bg-[#6b59b2] text-white"
                  : "bg-transparent text-[#6b59b2] border border-[#6b59b2]"
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
