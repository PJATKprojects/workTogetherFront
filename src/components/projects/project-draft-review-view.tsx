"use client";

import { useCallback, useEffect, useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import { projectService, type ProjectDraftReviewPreview } from "@/services/projectService";

export function ProjectDraftReviewView({
  locale,
  token,
}: Readonly<{ locale: Locale; token: string }>) {
  const [preview, setPreview] = useState<ProjectDraftReviewPreview | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setError(
        localText(
          locale,
          "Review token is missing.",
          "Відсутній review token.",
          "Brakuje tokenu recenzji."
        )
      );
      return;
    }
    try {
      const data = await projectService.previewDraftReview(token);
      setPreview(data);
      setComment(data.comment ?? "");
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "This private review is unavailable.",
            "Цей приватний review недоступний.",
            "Ta prywatna recenzja jest niedostępna."
          )
        ).message
      );
    }
  }, [locale, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async () => {
    if (comment.trim().length < 3) return;
    setBusy(true);
    setError("");
    try {
      await projectService.submitDraftReview(token, comment.trim());
      setSent(true);
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not send the review.",
            "Не вдалося надіслати review.",
            "Nie udało się wysłać recenzji."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };

  if (!preview && !error) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {localText(
          locale,
          "Loading private preview…",
          "Завантажуємо приватний preview…",
          "Wczytywanie prywatnego podglądu…"
        )}
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      {error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {preview ? (
        <>
          <header className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {localText(
                locale,
                "Private draft · not published",
                "Приватна чернетка · не опубліковано",
                "Prywatny szkic · nieopublikowany"
              )}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {preview.project.projectName}
            </h1>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <Fact
                label={localText(locale, "Stage", "Стадія", "Etap")}
                value={preview.project.stage}
              />
              <Fact
                label={localText(locale, "Format", "Формат", "Format")}
                value={preview.project.format}
              />
              <Fact
                label={localText(locale, "Duration", "Тривалість", "Czas trwania")}
                value={preview.project.duration}
              />
            </dl>
          </header>
          <section className="grid gap-5 rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <DraftText
              title={localText(locale, "Problem", "Проблема", "Problem")}
              text={preview.project.problem}
            />
            <DraftText
              title={localText(
                locale,
                "Expected result",
                "Очікуваний результат",
                "Oczekiwany rezultat"
              )}
              text={preview.project.expectedOutcome}
            />
          </section>
          <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-xl font-semibold">
              {localText(locale, "Open roles", "Відкриті ролі", "Otwarte role")}
            </h2>
            <div className="mt-4 grid gap-3">
              {preview.project.positions.map((position) => (
                <article key={position.id} className="rounded-2xl border border-border p-4">
                  <h3 className="font-semibold">
                    {position.role} · {position.level}
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {position.tasks}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Must-have: {position.mustHave.join(", ")} · Nice-to-have:{" "}
                    {position.niceToHave.join(", ") || "—"}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <label htmlFor="draft-review-comment" className="text-lg font-semibold">
              {localText(
                locale,
                "Private feedback to the owner",
                "Приватний feedback власнику",
                "Prywatna opinia dla właściciela"
              )}
            </label>
            <p id="draft-review-help" className="mt-1 text-sm text-muted-foreground">
              {localText(
                locale,
                "Be specific about unclear expectations, scope or roles.",
                "Конкретно вкажіть неясні очікування, scope або ролі.",
                "Wskaż konkretnie niejasne oczekiwania, zakres lub role."
              )}
            </p>
            <textarea
              id="draft-review-comment"
              aria-describedby="draft-review-help"
              value={comment}
              maxLength={2000}
              rows={7}
              onChange={(event) => setComment(event.target.value)}
              className="mt-4 w-full rounded-xl border border-input bg-background p-3"
            />
            {sent ? (
              <p role="status" className="mt-3 text-sm font-semibold text-success">
                {localText(locale, "Feedback sent.", "Feedback надіслано.", "Opinia wysłana.")}
              </p>
            ) : (
              <button
                type="button"
                disabled={busy || comment.trim().length < 3}
                onClick={() => void submit()}
                className="focus-ring mt-4 min-h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-40"
              >
                {busy
                  ? localText(locale, "Sending…", "Надсилаємо…", "Wysyłanie…")
                  : localText(locale, "Send review", "Надіслати review", "Wyślij recenzję")}
              </button>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function Fact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function DraftText({ title, text }: Readonly<{ title: string; text: string }>) {
  return (
    <div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{text}</p>
    </div>
  );
}
