"use client";

import { useCallback, useEffect, useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { adminService, type EmailOutboxAdminItem } from "@/services/adminService";

export function EmailOutboxAdmin({ locale }: Readonly<{ locale: Locale }>) {
  const [state, setState] = useState("failed");
  const [items, setItems] = useState<EmailOutboxAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems((await adminService.emailOutbox(state)).items);
    } catch {
      setError(
        localText(
          locale,
          "Could not load the queue. Check administrator access.",
          "Не вдалося завантажити чергу. Перевірте права адміністратора.",
          "Nie udało się wczytać kolejki. Sprawdź uprawnienia administratora."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [state, locale]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const retry = async (messageId: string) => {
    setBusy(messageId);
    setError("");
    setNotice("");
    try {
      await adminService.retryEmail(messageId);
      await load();
      setNotice(
        localText(
          locale,
          "Email safely queued for retry.",
          "Email безпечно поставлено в чергу на повтор.",
          "E-mail bezpiecznie dodano do kolejki ponowienia."
        )
      );
    } catch {
      setError(
        localText(
          locale,
          "Retry is unavailable: the message was sent or is currently leased by a worker.",
          "Повтор зараз неможливий: лист уже надіслано або його обробляє worker.",
          "Ponowienie jest niedostępne: wiadomość została wysłana albo przetwarza ją worker."
        )
      );
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            {localText(locale, "Email delivery queue", "Черга email", "Kolejka wysyłki email")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {localText(
              locale,
              "Email bodies and security tokens are intentionally hidden.",
              "Тіла листів і токени навмисно не показуються.",
              "Treść wiadomości i tokeny bezpieczeństwa są celowo ukryte."
            )}
          </p>
        </div>
        <label className="grid gap-1 text-xs font-semibold">
          {localText(locale, "Queue state", "Стан черги", "Stan kolejki")}
          <select
            value={state}
            onChange={(event) => setState(event.target.value)}
            className="h-10 rounded-lg border border-input bg-surface px-3 text-sm"
          >
            <option value="failed">{localText(locale, "Failed", "Помилки", "Nieudane")}</option>
            <option value="dead">
              {localText(locale, "Dead letter", "Dead letter", "Martwe wiadomości")}
            </option>
            <option value="pending">
              {localText(locale, "Pending", "Очікують", "Oczekujące")}
            </option>
            <option value="sent">{localText(locale, "Sent", "Надіслані", "Wysłane")}</option>
            <option value="all">{localText(locale, "All", "Усі", "Wszystkie")}</option>
          </select>
        </label>
      </div>
      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="py-10 text-sm text-muted-foreground">
          {localText(locale, "Loading…", "Завантаження…", "Wczytywanie…")}
        </p>
      ) : items.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          {localText(
            locale,
            "No messages in this state.",
            "У цьому стані листів немає.",
            "Brak wiadomości w tym stanie."
          )}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <caption className="sr-only">
              {localText(
                locale,
                "Email delivery queue",
                "Черга доставки email",
                "Kolejka dostarczania e-maili"
              )}
            </caption>
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="p-2">
                  {localText(locale, "Type", "Тип", "Typ")}
                </th>
                <th scope="col" className="p-2">
                  {localText(locale, "Recipient", "Одержувач", "Odbiorca")}
                </th>
                <th scope="col" className="p-2">
                  {localText(locale, "Subject", "Тема", "Temat")}
                </th>
                <th scope="col" className="p-2">
                  {localText(locale, "Attempts", "Спроби", "Próby")}
                </th>
                <th scope="col" className="p-2">
                  {localText(locale, "Last error", "Остання помилка", "Ostatni błąd")}
                </th>
                <th scope="col" className="p-2">
                  <span className="sr-only">{localText(locale, "Action", "Дія", "Działanie")}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.messageId}>
                  <td className="p-2 font-mono text-xs">{item.type}</td>
                  <td className="p-2">{item.recipientEmail}</td>
                  <td className="p-2">{item.subject}</td>
                  <td className="p-2">
                    {item.attempts}/{item.maxAttempts}
                  </td>
                  <td
                    className="max-w-xs truncate p-2 text-xs text-destructive"
                    title={item.lastError}
                  >
                    {item.lastError || "—"}
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      disabled={Boolean(item.sentAt) || item.isLeased || busy.length > 0}
                      onClick={() => void retry(item.messageId)}
                      className="focus-ring rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                    >
                      {localText(locale, "Retry", "Повторити", "Ponów")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
