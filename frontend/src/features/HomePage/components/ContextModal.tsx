import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AppSheetCard,
  AppSheetSectionText,
  AppSheetSectionTitle,
  appSheetFieldClass,
} from "../../../components/AppSheet";

type ContextModelProps = {
  value: string;
  onChange: (value: string) => void;
};

const ContextModel = ({ value, onChange }: ContextModelProps) => {
  const MAX_CHARS = 1000;
  const { t } = useTranslation();

  return (
    <AppSheetCard>
      <div className="mb-2 flex items-center gap-2 text-[#2b2277]">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--brand-primary)]">
          <FileText size={20} />
        </div>

        <AppSheetSectionTitle>{t("context.title")}</AppSheetSectionTitle>
      </div>

      <AppSheetSectionText>{t("context.description")}</AppSheetSectionText>

      <div className={`${appSheetFieldClass} mt-3 p-3`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          placeholder={t("context.textAreaPlaceholder")}
          className="h-[132px] w-full resize-none border-none bg-transparent px-1 py-0.5 text-[16px] font-medium leading-relaxed text-[#1f1b3a] outline-none placeholder:text-[#8f89b3]"
        />

        <div className="mt-1 text-right text-[12px] font-semibold text-[#8d86bc]">
          {value.length}/{MAX_CHARS}
        </div>
      </div>
    </AppSheetCard>
  );
};

export default ContextModel;
