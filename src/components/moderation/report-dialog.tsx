"use client";

import { useCallback, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/hooks/use-auth";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { localText, type Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import {
  moderationService,
  type ReportCategory,
  type ReportTargetType,
} from "@/services/moderationService";

export function ReportDialog({
  targetType,
  targetId,
  locale,
  className = "",
}: Readonly<{
  targetType: ReportTargetType;
  targetId: number;
  locale: Locale;
  className?: string;
}>) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory>("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const close = useCallback(() => {
    if (!busy) setOpen(false);
  }, [busy]);
  const dialogRef = useDialogFocus<HTMLFormElement>(open, close);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await moderationService.report(targetType, targetId, category, details);
      setMessage(
        localText(
          locale,
          "Your report was sent to moderation.",
          "Скаргу надіслано команді модерації.",
          "Zgłoszenie zostało wysłane do moderacji."
        )
      );
      setDetails("");
    } catch (error) {
      setMessage(
        getApiError(
          error,
          localText(
            locale,
            "Could not send the report.",
            "Не вдалося надіслати скаргу.",
            "Nie udało się wysłać zgłoszenia."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) return null;
  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          // Safari does not focus a button on pointer click by default. Make
          // the return target explicit before the dialog captures focus.
          event.currentTarget.focus();
          setOpen(true);
          setMessage("");
        }}
        className={`focus-ring rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted ${className}`}
      >
        {localText(locale, "Report", "Поскаржитися", "Zgłoś")}
      </button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-dialog-title"
              aria-describedby="report-dialog-description"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              <form
                ref={dialogRef}
                tabIndex={-1}
                onSubmit={submit}
                className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="report-dialog-title" className="text-xl font-semibold">
                      {localText(
                        locale,
                        "Report a safety issue",
                        "Повідомити про порушення",
                        "Zgłoś problem z bezpieczeństwem"
                      )}
                    </h2>
                    <p
                      id="report-dialog-description"
                      className="mt-1 text-sm text-muted-foreground"
                    >
                      {localText(
                        locale,
                        "We do not tell the reported person who submitted it.",
                        "Ми не повідомляємо автору, хто подав скаргу.",
                        "Nie informujemy zgłoszonej osoby, kto wysłał zgłoszenie."
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="focus-ring rounded-lg px-2 py-1 text-xl text-muted-foreground hover:bg-muted"
                    aria-label={localText(locale, "Close", "Закрити", "Zamknij")}
                  >
                    ×
                  </button>
                </div>
                <label className="mt-5 grid gap-2 text-sm font-semibold">
                  {localText(locale, "Category", "Категорія", "Kategoria")}
                  <select
                    value={category}
                    data-dialog-initial-focus
                    onChange={(event) => setCategory(event.target.value as ReportCategory)}
                    className="h-11 rounded-xl border border-input bg-surface px-3 font-normal"
                  >
                    <option value="spam">Spam</option>
                    <option value="scam">
                      {localText(locale, "Scam", "Шахрайство", "Oszustwo")}
                    </option>
                    <option value="harassment">
                      {localText(locale, "Harassment", "Переслідування", "Nękanie")}
                    </option>
                    <option value="plagiarism">
                      {localText(locale, "Plagiarism", "Плагіат", "Plagiat")}
                    </option>
                  </select>
                </label>
                <label className="mt-4 grid gap-2 text-sm font-semibold">
                  {localText(
                    locale,
                    "What happened? (optional)",
                    "Що сталося? (необов’язково)",
                    "Co się stało? (opcjonalnie)"
                  )}
                  <textarea
                    value={details}
                    maxLength={2000}
                    rows={5}
                    onChange={(event) => setDetails(event.target.value)}
                    className="rounded-xl border border-input bg-surface p-3 font-normal"
                  />
                </label>
                {message ? (
                  <p className="mt-4 text-sm" role="status">
                    {message}
                  </p>
                ) : null}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="focus-ring rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    {localText(locale, "Cancel", "Закрити", "Anuluj")}
                  </button>
                  <button
                    disabled={busy}
                    className="focus-ring rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy
                      ? "…"
                      : localText(locale, "Submit report", "Надіслати", "Wyślij zgłoszenie")}
                  </button>
                </div>
              </form>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
