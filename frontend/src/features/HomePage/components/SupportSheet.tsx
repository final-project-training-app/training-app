/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useTranslation } from "react-i18next";
import {
  AppSheet,
  AppSheetCard,
  AppSheetNotice,
  AppSheetSectionText,
  AppSheetSectionTitle,
  appSheetPrimaryButtonClass,
  appSheetSecondaryButtonClass,
} from "../../../components/AppSheet";

export default function SupportSheet({
  open,
  setOpen,
  onBack,
  initialMode,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onBack?: () => void;
  initialMode?: "faq" | "form";
}) {
  const { t } = useTranslation();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const [mode, setMode] = useState<"faq" | "form">("faq");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const submitIssue = () => {
    try {
      const subject = encodeURIComponent(t("support.emailSubject"));
      const body = encodeURIComponent(
        `${t("support.emailIntro")}\n\n${message}\n\n${t("support.userEmail")} : ${userEmail}`,
      );
      // Open user's mail client with prefilled message (free, client-side)
      window.location.href = `mailto:abc.123@gmail.com?subject=${subject}&body=${body}`;
      setFeedback(t("support.sentSuccess"));
      setMessage("");
    } catch (err) {
      console.error("Support submit failed", err);
      setFeedback(t("support.sentError"));
    }
  };

  // when opened, set initial mode if provided
  useEffect(() => {
    if (open && initialMode && mode !== initialMode) setMode(initialMode);
  }, [open, initialMode, mode]);

  return (
    <AppSheet
      open={open}
      title={t("support.title")}
      subtitle={t("support.subtitle")}
      onClose={() => setOpen(false)}
      height="large"
      footer={
        <section className="space-y-2.5 pb-1">
          {mode === "form" ? (
            <>
              <button
                className={appSheetPrimaryButtonClass}
                onClick={submitIssue}
                disabled={!message.trim()}
              >
                {t("support.submit")}
              </button>
              <button
                className={appSheetSecondaryButtonClass}
                onClick={() => {
                  setMode("faq");
                  if (onBack) onBack();
                }}
              >
                {t("support.backToFAQ")}
              </button>
            </>
          ) : (
            <button
              className={appSheetSecondaryButtonClass}
              onClick={() => setOpen(false)}
            >
              {t("settings.close")}
            </button>
          )}
        </section>
      }
    >
      <div className="space-y-4 pb-2">
        <AppSheetCard>
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <AppSheetSectionTitle>
                {t("support.faqTitle")}
              </AppSheetSectionTitle>
              <AppSheetSectionText>
                {t("support.faqTextShort")}
              </AppSheetSectionText>
            </div>
            <div>
              <button
                className="rounded px-3 py-1 text-sm font-semibold text-[#5b3fd6] hover:bg-[#f5f0ff]"
                onClick={() => setMode("form")}
              >
                {t("support.contactUs")}
              </button>
            </div>
          </div>
        </AppSheetCard>

        {mode === "form" && (
          <AppSheetCard>
            <AppSheetSectionTitle>
              {t("support.formTitle")}
            </AppSheetSectionTitle>
            <AppSheetSectionText>
              {t("support.formDescription")}
            </AppSheetSectionText>

            <div className="mt-3 px-3 py-2.5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("support.placeholder") || ""}
                className="w-full min-h-[120px] resize-vertical rounded-md border px-3 py-2 text-sm bg-transparent text-[var(--brand-ink)] outline-none"
              />
            </div>

            {feedback ? (
              <AppSheetNotice
                tone={feedback.includes("✓") ? "success" : "danger"}
              >
                {feedback}
              </AppSheetNotice>
            ) : null}
          </AppSheetCard>
        )}
      </div>
    </AppSheet>
  );
}
