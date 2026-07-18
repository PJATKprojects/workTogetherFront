"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import {
  matchingService,
  type ComplementaryPerson,
  type ProjectMatch,
} from "@/services/matchingService";

export function MatchingDashboard({
  locale,
  messages,
}: Readonly<{ locale: Locale; messages: SiteMessages }>) {
  const [projects, setProjects] = useState<ProjectMatch[]>([]);
  const [people, setPeople] = useState<ComplementaryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [undo, setUndo] = useState<{ item: ProjectMatch; index: number } | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, u] = await Promise.all([
        matchingService.projects(),
        matchingService.complementaryPeople(),
      ]);
      setProjects(p);
      setPeople(u);
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not build recommendations.",
            "Не вдалося побудувати рекомендації.",
            "Nie udało się przygotować rekomendacji."
          )
        ).message
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const feedback = async (item: ProjectMatch, action: "hide" | "not_interested") => {
    const reason =
      action === "not_interested"
        ? (window.prompt(
            localText(
              locale,
              "What did not fit? This improves your control over recommendations.",
              "Що не підійшло? Це покращить ваш контроль над видачею.",
              "Co nie pasowało? Ta odpowiedź daje Ci większą kontrolę nad rekomendacjami."
            )
          ) ?? undefined)
        : undefined;
    const index = projects.findIndex((v) => v.project.id === item.project.id);
    await matchingService.feedback(item.project.id, action, reason);
    setProjects((v) => v.filter((x) => x.project.id !== item.project.id));
    setUndo({ item, index });
  };
  const restore = async () => {
    if (!undo) return;
    await matchingService.undoFeedback(undo.item.project.id);
    setProjects((v) => {
      const next = [...v];
      next.splice(Math.max(0, undo.index), 0, undo.item);
      return next;
    });
    setUndo(null);
  };
  if (loading)
    return (
      <p className="py-12 text-sm text-muted-foreground">
        {localText(
          locale,
          "Explaining your matches…",
          "Пояснюємо збіги…",
          "Wyjaśniamy dopasowania…"
        )}
      </p>
    );
  return (
    <div className="grid gap-10">
      {error ? <p className="rounded-xl bg-destructive/10 p-4 text-destructive">{error}</p> : null}
      {undo ? (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-foreground px-4 py-3 text-sm text-background shadow-xl">
          <span>
            {localText(
              locale,
              "Recommendation hidden.",
              "Рекомендацію приховано.",
              "Rekomendacja została ukryta."
            )}
          </span>
          <button onClick={() => void restore()} className="font-semibold underline">
            {localText(locale, "Undo", "Скасувати", "Cofnij")}
          </button>
        </div>
      ) : null}
      <section>
        <h2 className="text-2xl font-semibold">
          {localText(locale, "Projects for you", "Проєкти для вас", "Projekty dla Ciebie")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {localText(
            locale,
            "No protected traits and no black box—every point is explained.",
            "Жодних захищених ознак і чорної скриньки — кожен бал пояснений.",
            "Bez cech chronionych i bez czarnej skrzynki — każdy punkt ma wyjaśnienie."
          )}
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((item) => (
            <article key={item.project.id} className="grid content-start gap-3">
              <div className="relative">
                <ProjectCard project={item.project} locale={locale} labels={messages.projects} />
                <span className="absolute right-3 top-3 rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">
                  {item.score}/100
                </span>
              </div>
              <details className="rounded-2xl border border-border bg-surface p-3 text-xs">
                <summary className="cursor-pointer font-semibold">
                  {localText(locale, "Why this match", "Чому цей match", "Dlaczego to dopasowanie")}
                  {item.diversitySlot
                    ? ` · ${localText(
                        locale,
                        "new-project diversity slot",
                        "місце для нового проєкту",
                        "miejsce dla nowego projektu"
                      )}`
                    : ""}
                </summary>
                <ul className="mt-2 grid gap-1.5">
                  {item.reasons.map((reason) => (
                    <li key={reason.code} className="flex justify-between gap-2">
                      <span>{reason.explanation}</span>
                      <strong>+{reason.points}</strong>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-muted-foreground">
                  <Link
                    href={withLocale(locale, "/profile/edit")}
                    className="font-semibold text-primary-text hover:underline"
                  >
                    {localText(locale, "Correct my data", "Виправити мої дані", "Popraw moje dane")}
                  </Link>
                </p>
              </details>
              <div className="flex gap-2">
                <button
                  onClick={() => void feedback(item, "hide")}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-semibold"
                >
                  {localText(locale, "Hide", "Приховати", "Ukryj")}
                </button>
                <button
                  onClick={() => void feedback(item, "not_interested")}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-semibold"
                >
                  {localText(locale, "Not interested", "Не цікаво", "Nie interesuje mnie")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">
          {localText(
            locale,
            "People who complement your skills",
            "Люди, які доповнюють ваші навички",
            "Osoby uzupełniające Twoje umiejętności"
          )}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {localText(
            locale,
            "Similarity is not the goal: this view highlights missing capabilities and working-style fit.",
            "Схожість не є метою: тут ви бачите нові компетенції та сумісність стилю роботи.",
            "Podobieństwo nie jest celem: ten widok pokazuje brakujące kompetencje i zgodność stylu pracy."
          )}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {people.map((item) => (
            <Link
              key={item.user.id}
              href={withLocale(locale, `/users/${item.user.id}`)}
              className="rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex justify-between gap-3">
                <h3 className="font-semibold">{item.user.userName}</h3>
                <strong>{item.score}/100</strong>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {localText(locale, "Adds", "Додає", "Dodaje")}:{" "}
                {item.complementarySkills.join(", ") || "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {localText(locale, "Shared", "Спільні", "Wspólne")}:{" "}
                {item.sharedSkills.join(", ") || "—"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
