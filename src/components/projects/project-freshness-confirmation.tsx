"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import { projectService } from "@/services/projectService";

type Preview = Awaited<ReturnType<typeof projectService.previewFreshnessLink>>;

export function ProjectFreshnessConfirmation({
  locale,
  projectId,
  token,
}: Readonly<{ locale: Locale; projectId: number; token: string }>) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"active" | "close" | "">("");
  const [done, setDone] = useState<"active" | "close" | "">("");

  const load = useCallback(async () => {
    if (!token) {
      setError(
        localText(
          locale,
          "The confirmation token is missing.",
          "Відсутній токен підтвердження.",
          "Brakuje tokenu potwierdzenia."
        )
      );
      return;
    }
    try {
      setPreview(await projectService.previewFreshnessLink(projectId, token));
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "This link is invalid, expired or already used.",
            "Це посилання недійсне, прострочене або вже використане.",
            "Ten link jest nieprawidłowy, wygasł albo został już użyty."
          )
        ).message
      );
    }
  }, [locale, projectId, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const confirm = async (action: "active" | "close") => {
    setBusy(action);
    setError("");
    try {
      await projectService.confirmFreshnessLink(projectId, token, action);
      setDone(action);
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Confirmation failed.",
            "Не вдалося підтвердити.",
            "Potwierdzenie nie powiodło się."
          )
        ).message
      );
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        WorkTogether ·{" "}
        {localText(locale, "Recruitment freshness", "Актуальність набору", "Aktualność rekrutacji")}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {done
          ? localText(locale, "Decision saved", "Рішення збережено", "Decyzja zapisana")
          : localText(
              locale,
              "Confirm before anything changes",
              "Підтвердьте, перш ніж щось зміниться",
              "Potwierdź, zanim cokolwiek się zmieni"
            )}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {done
          ? done === "active"
            ? localText(
                locale,
                "Recruitment is active again.",
                "Набір знову активний.",
                "Rekrutacja jest znów aktywna."
              )
            : localText(
                locale,
                "Recruitment is paused.",
                "Набір призупинено.",
                "Rekrutacja została wstrzymana."
              )
          : localText(
              locale,
              "Opening this page does not update or close the project. Choose one explicit action below.",
              "Відкриття цієї сторінки не оновлює і не закриває проєкт. Нижче оберіть явну дію.",
              "Samo otwarcie tej strony nie aktualizuje ani nie zamyka projektu. Wybierz poniżej konkretną czynność."
            )}
      </p>

      {error ? (
        <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!preview && !error ? (
        <p role="status" className="mt-5 text-sm text-muted-foreground">
          {localText(
            locale,
            "Checking the signed link…",
            "Перевіряємо підписане посилання…",
            "Sprawdzamy podpisany link…"
          )}
        </p>
      ) : null}
      {preview && !done ? (
        <>
          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="font-semibold">{preview.project.projectName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {localText(locale, "Link expires", "Посилання діє до", "Link wygasa")}:{" "}
              {formatDateTime(preview.expiresAt, locale)}
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void confirm("active")}
              className="focus-ring min-h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy === "active"
                ? localText(locale, "Saving…", "Зберігаємо…", "Zapisywanie…")
                : localText(
                    locale,
                    "Keep recruitment active",
                    "Залишити набір активним",
                    "Pozostaw rekrutację aktywną"
                  )}
            </button>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void confirm("close")}
              className="focus-ring min-h-12 rounded-xl border border-border px-5 font-semibold hover:bg-muted disabled:opacity-50"
            >
              {localText(locale, "Pause recruitment", "Призупинити набір", "Wstrzymaj rekrutację")}
            </button>
          </div>
        </>
      ) : null}
      {done ? (
        <Link
          href={withLocale(locale, `/projects/${projectId}`)}
          className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-xl bg-foreground px-5 font-semibold text-background"
        >
          {localText(locale, "Open project", "Відкрити проєкт", "Otwórz projekt")}
        </Link>
      ) : null}
    </section>
  );
}
