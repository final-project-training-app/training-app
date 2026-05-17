/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useTranslation } from "react-i18next";
import {
  AppSheet,
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
      <div className="divide-y divide-(--brand-border)/60 pb-2">
        <section className="py-5">
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <AppSheetSectionTitle>
                {t("support.faqTitle")}
              </AppSheetSectionTitle>
              <AppSheetSectionText>
                {t("support.faqTextShort")}
              </AppSheetSectionText>
            </div>
            <button
              className="rounded-full px-3 py-1.5 text-[length:var(--text-sm)] font-semibold text-(--brand-primary) hover:bg-(--brand-soft) transition"
              onClick={() => setMode("form")}
            >
              {t("support.contactUs")}
            </button>
          </div>
        </section>

        {mode === "form" && (
          <section className="py-5">
            <AppSheetSectionTitle>
              {t("support.formTitle")}
            </AppSheetSectionTitle>
            <AppSheetSectionText>
              {t("support.formDescription")}
            </AppSheetSectionText>

            <div className="mt-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("support.placeholder") || ""}
                className="w-full min-h-[120px] resize-vertical rounded-2xl border border-(--brand-border-field) bg-(--brand-field-bg) px-4 py-3 text-[length:var(--text-base)] text-(--brand-ink) outline-none placeholder:text-(--brand-muted) focus:border-(--brand-border-strong) transition"
              />
            </div>

            {feedback ? (
              <AppSheetNotice
                tone={feedback.includes("✓") ? "success" : "danger"}
              >
                {feedback}
              </AppSheetNotice>
            ) : null}
          </section>
        )}
      </div>
    </AppSheet>
  );
}
