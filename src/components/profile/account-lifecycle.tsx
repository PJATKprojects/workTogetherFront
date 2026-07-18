"use client";

import Link from "next/link";
import { useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import { accountService } from "@/services/accountService";

export function AccountLifecycle({ locale }: Readonly<{ locale: Locale }>) {
  const [archiveProjects, setArchiveProjects] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const exportData = async () => {
    setBusy("export");
    setMessage("");
    try {
      const blob = await accountService.exportData();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `worktogether-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (value) {
      setMessage(
        getApiError(
          value,
          localText(
            locale,
            "Could not create your export.",
            "Не вдалося створити експорт.",
            "Nie udało się utworzyć eksportu."
          )
        ).message
      );
    } finally {
      setBusy("");
    }
  };

  const requestDeletion = async () => {
    if (
      !window.confirm(
        localText(
          locale,
          "Schedule account deletion? You will have 30 days to cancel.",
          "Запланувати видалення акаунта? У вас буде 30 днів на скасування.",
          "Zaplanować usunięcie konta? Będziesz mieć 30 dni na anulowanie."
        )
      )
    )
      return;
    setBusy("delete");
    setMessage("");
    try {
      const result = await accountService.requestDeletion(archiveProjects);
      setScheduledAt(result.accountDeletionScheduledAt);
      setMessage(result.message);
    } catch (value) {
      setMessage(
        getApiError(
          value,
          localText(
            locale,
            "Transfer active team projects first, or choose to archive them.",
            "Спочатку передайте власність активних командних проєктів або оберіть архівування.",
            "Najpierw przekaż aktywne projekty zespołowe albo wybierz ich archiwizację."
          )
        ).message
      );
    } finally {
      setBusy("");
    }
  };

  const cancel = async () => {
    setBusy("cancel");
    try {
      await accountService.cancelDeletion();
      setScheduledAt(null);
      setMessage(
        localText(
          locale,
          "Deletion was cancelled.",
          "Видалення скасовано.",
          "Usunięcie zostało anulowane."
        )
      );
    } catch (value) {
      setMessage(
        getApiError(
          value,
          localText(
            locale,
            "Could not cancel deletion.",
            "Не вдалося скасувати видалення.",
            "Nie udało się anulować usunięcia."
          )
        ).message
      );
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="grid gap-6">
      {message ? (
        <p role="status" className="rounded-xl border border-border bg-surface-muted p-4 text-sm">
          {message}
        </p>
      ) : null}
      <section className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold">
          {localText(locale, "Export your data", "Експорт даних", "Eksport danych")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {localText(
            locale,
            "Download your profile, login methods, sessions, projects, application history, messages, saved searches, and achievements as JSON.",
            "Завантажте профіль, способи входу, сесії, проєкти, заявки з історією, повідомлення, збережені пошуки й досягнення у JSON.",
            "Pobierz profil, metody logowania, sesje, projekty, historię zgłoszeń, wiadomości, zapisane wyszukiwania i osiągnięcia w formacie JSON."
          )}
        </p>
        <button
          disabled={busy.length > 0}
          onClick={() => void exportData()}
          className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy === "export"
            ? "…"
            : localText(locale, "Download export", "Завантажити експорт", "Pobierz eksport")}
        </button>
      </section>
      <section className="rounded-3xl border border-destructive/30 bg-surface p-6">
        <h2 className="text-xl font-semibold text-destructive">
          {localText(locale, "Delete account", "Видалення акаунта", "Usuń konto")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {localText(
            locale,
            "Deletion has a 30-day grace period. Afterward, personal data is anonymized while team contribution history remains attributed to Deleted user.",
            "Запит має 30-денний grace period. Після нього особисті дані анонімізуються, а історія командного внеску залишається під ім’ям Deleted user.",
            "Usunięcie ma 30-dniowy okres ochronny. Później dane osobowe są anonimizowane, a historia wkładu zespołowego pozostaje przypisana do „Usuniętego użytkownika”."
          )}
        </p>
        <p className="mt-3 text-sm">
          {localText(
            locale,
            "If a project has members, first ",
            "Якщо у проєкті є учасники, найкраще ",
            "Jeżeli projekt ma członków, najpierw "
          )}
          <Link
            href={withLocale(locale, "/projects/my")}
            className="font-semibold text-primary-text hover:underline"
          >
            {localText(locale, "transfer ownership", "передати власність", "przekaż własność")}
          </Link>
          .
        </p>
        <label className="mt-4 flex items-start gap-3 rounded-xl bg-surface-muted p-4 text-sm">
          <input
            type="checkbox"
            checked={archiveProjects}
            onChange={(e) => setArchiveProjects(e.target.checked)}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            {localText(
              locale,
              "Explicitly archive all projects whose ownership has not been transferred.",
              "Явно архівувати всі проєкти, власність яких не передано.",
              "Jawnie zarchiwizuj wszystkie projekty, których własność nie została przekazana."
            )}
          </span>
        </label>
        {scheduledAt ? (
          <div className="mt-4 rounded-xl bg-warning/10 p-4 text-sm">
            <p>
              {localText(locale, "Scheduled for", "Заплановано на", "Zaplanowano na")}{" "}
              {formatDateTime(scheduledAt, locale)}.
            </p>
            <button
              disabled={busy.length > 0}
              onClick={() => void cancel()}
              className="mt-3 rounded-xl border border-border bg-surface px-4 py-2 font-semibold"
            >
              {localText(locale, "Cancel deletion", "Скасувати видалення", "Anuluj usunięcie")}
            </button>
          </div>
        ) : (
          <button
            disabled={busy.length > 0}
            onClick={() => void requestDeletion()}
            className="mt-4 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "delete"
              ? "…"
              : localText(
                  locale,
                  "Schedule deletion",
                  "Запланувати видалення",
                  "Zaplanuj usunięcie"
                )}
          </button>
        )}
      </section>
    </div>
  );
}
