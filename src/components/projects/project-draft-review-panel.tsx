"use client";

import { useCallback, useEffect, useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import { projectService, type ProjectDraftReviewItem } from "@/services/projectService";

export function ProjectDraftReviewPanel({
  projectId,
  locale,
}: Readonly<{ projectId: number; locale: Locale }>) {
  const [items, setItems] = useState<ProjectDraftReviewItem[]>([]);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await projectService.draftReviews(projectId));
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not load private reviews.",
            "Не вдалося завантажити приватні review.",
            "Nie udało się wczytać prywatnych recenzji."
          )
        ).message
      );
    }
  }, [locale, projectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const invite = async () => {
    if (!userName.trim()) return;
    setBusy("invite");
    setError("");
    setStatus("");
    try {
      await projectService.inviteDraftReviewer(projectId, userName.trim());
      setUserName("");
      setStatus(
        localText(
          locale,
          "Private invitation sent by email and in-app notification.",
          "Приватне запрошення надіслано email і в застосунку.",
          "Prywatne zaproszenie wysłano e-mailem i w aplikacji."
        )
      );
      await load();
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not invite this reviewer.",
            "Не вдалося запросити reviewer.",
            "Nie udało się zaprosić recenzenta."
          )
        ).message
      );
    } finally {
      setBusy("");
    }
  };

  return (
    <section
      aria-labelledby="draft-review-title"
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <h2 id="draft-review-title" className="font-semibold">
        {localText(
          locale,
          "Private draft co-review",
          "Приватний co-review чернетки",
          "Prywatna wspólna recenzja szkicu"
        )}
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {localText(
          locale,
          "Invite an exact WorkTogether username. The reviewer sees a private preview, never the internal quality score.",
          "Запросіть точний username WorkTogether. Reviewer побачить приватний preview, але не внутрішній quality score.",
          "Zaproś dokładną nazwę użytkownika WorkTogether. Recenzent zobaczy prywatny podgląd, ale nigdy wewnętrzny quality score."
        )}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="draft-review-username" className="sr-only">
          {localText(locale, "Reviewer username", "Username reviewer", "Nazwa recenzenta")}
        </label>
        <input
          id="draft-review-username"
          value={userName}
          maxLength={80}
          onChange={(event) => setUserName(event.target.value)}
          placeholder={localText(
            locale,
            "Exact username",
            "Точний username",
            "Dokładna nazwa użytkownika"
          )}
          className="min-h-11 flex-1 rounded-xl border border-input bg-background px-3"
        />
        <button
          type="button"
          disabled={!userName.trim() || busy === "invite"}
          onClick={() => void invite()}
          className="focus-ring min-h-11 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-40"
        >
          {localText(locale, "Invite", "Запросити", "Zaproś")}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {status ? (
        <p role="status" className="mt-3 text-sm text-success">
          {status}
        </p>
      ) : null}
      {items.length ? (
        <ul className="mt-4 grid gap-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{item.userName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.status} · {formatDateTime(item.expiresAt, locale)}
                  </p>
                </div>
                {item.status === "pending" ? (
                  <button
                    type="button"
                    disabled={busy === item.id}
                    onClick={() => {
                      setBusy(item.id);
                      void projectService
                        .revokeDraftReview(projectId, item.id)
                        .then(load)
                        .finally(() => setBusy(""));
                    }}
                    className="focus-ring min-h-9 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-40"
                  >
                    {localText(locale, "Revoke", "Відкликати", "Odwołaj")}
                  </button>
                ) : null}
              </div>
              {item.comment ? (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-3 leading-6">
                  {item.comment}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
