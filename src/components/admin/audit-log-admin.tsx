"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { localText, type Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import { moderationService, type AuditItem } from "@/services/moderationService";

export function AuditLogAdmin({ locale }: Readonly<{ locale: Locale }>) {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const labels = useMemo(() => getLabels(locale), [locale]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await moderationService.audit(page));
    } catch (value) {
      setError(getApiError(value, labels.loadError).message);
    } finally {
      setLoading(false);
    }
  }, [labels.loadError, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const actions = Array.from(new Set(items.map((item) => item.action))).sort();
  const term = search.trim().toLowerCase();
  const visible = items.filter((item) => {
    if (action !== "all" && item.action !== action) return false;
    if (!term) return true;
    return [
      item.id,
      item.actorUserId,
      item.actorName,
      item.actorEmail,
      item.action,
      item.entityType,
      item.entityId,
      item.metadataJson,
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(term)
    );
  });

  return (
    <section aria-labelledby="audit-log-title" className="grid gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
          {labels.eyebrow}
        </p>
        <h2 id="audit-log-title" className="mt-2 text-2xl font-semibold">
          {labels.title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{labels.hint}</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[minmax(240px,1fr)_240px_auto]">
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="audit-search">
          {labels.search}
          <input
            id="audit-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.searchHint}
            className="min-h-11 rounded-xl border border-input bg-background px-3 font-normal"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="audit-action">
          {labels.action}
          <select
            id="audit-action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="min-h-11 rounded-xl border border-input bg-background px-3 font-normal"
          >
            <option value="all">{labels.allActions}</option>
            {actions.map((value) => (
              <option key={value} value={value}>
                {actionLabel(value, locale)}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="secondary" className="self-end" onClick={() => void load()}>
          {labels.refresh}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p role="status" className="text-muted-foreground">
          {loading ? labels.loading : labels.events.replace("{count}", String(visible.length))}
        </p>
        <p className="font-medium">{labels.page.replace("{page}", String(page))}</p>
      </div>

      {!loading && visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          {labels.empty}
        </div>
      ) : null}

      <ol className="grid gap-3" aria-busy={loading}>
        {visible.map((item) => (
          <AuditEvent key={item.id} item={item} locale={locale} labels={labels} />
        ))}
      </ol>

      <nav
        aria-label={labels.pagination}
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3"
      >
        <Button
          type="button"
          variant="secondary"
          disabled={page === 1 || loading}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          {labels.previous}
        </Button>
        <span className="text-sm font-medium">{labels.page.replace("{page}", String(page))}</span>
        <Button
          type="button"
          variant="secondary"
          disabled={items.length < 100 || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          {labels.next}
        </Button>
      </nav>
    </section>
  );
}

function AuditEvent({
  item,
  locale,
  labels,
}: Readonly<{
  item: AuditItem;
  locale: Locale;
  labels: ReturnType<typeof getLabels>;
}>) {
  const metadata = parseMetadata(item.metadataJson);
  return (
    <li>
      <details className="group rounded-2xl border border-border bg-surface shadow-sm open:border-primary/30">
        <summary className="focus-ring grid cursor-pointer list-none gap-3 rounded-2xl p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-text">
                {actionLabel(item.action, locale)}
              </span>
              <span className="text-xs text-muted-foreground">#{item.id}</span>
            </div>
            <p className="mt-2 truncate text-sm font-semibold">
              {item.entityType} #{item.entityId}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {labels.by} {item.actorName ?? labels.system}
              {item.actorUserId ? ` (#${item.actorUserId})` : ""}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <time dateTime={item.createdAt} className="text-sm font-medium tabular-nums">
              {formatDateTime(item.createdAt, locale)}
            </time>
            <span aria-hidden className="text-muted-foreground transition group-open:rotate-180">
              ↓
            </span>
          </div>
        </summary>
        <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-[240px_1fr]">
          <dl className="grid content-start gap-3 text-sm">
            <Detail label={labels.exactTime} value={new Date(item.createdAt).toISOString()} />
            <Detail
              label={labels.actor}
              value={
                item.actorName
                  ? `${item.actorName}${item.actorEmail ? ` · ${item.actorEmail}` : ""}`
                  : labels.system
              }
            />
            <Detail label={labels.sourceIp} value={item.ipAddress || labels.hidden} />
            <Detail label={labels.entity} value={`${item.entityType} #${item.entityId}`} />
          </dl>
          <div>
            <h3 className="text-sm font-semibold">{labels.metadata}</h3>
            {metadata.length ? (
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                {metadata.map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-muted/55 p-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {humanizeKey(key)}
                    </dt>
                    <dd className="mt-1 break-words text-sm">{formatMetadataValue(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{labels.noMetadata}</p>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}

function Detail({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words font-mono text-xs">{value}</dd>
    </div>
  );
}

function parseMetadata(value: string): Array<[string, unknown]> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? Object.entries(parsed)
      : [["value", parsed]];
  } catch {
    return value ? [["value", value]] : [];
  }
}

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function actionLabel(action: string, locale: Locale) {
  const labels: Record<string, [string, string, string]> = {
    report_status_changed: [
      "Report status changed",
      "Статус скарги змінено",
      "Zmieniono status zgłoszenia",
    ],
    sanction_created: ["Sanction created", "Санкцію створено", "Utworzono sankcję"],
    sanction_revoked: ["Sanction revoked", "Санкцію відкликано", "Cofnięto sankcję"],
    appeal_resolved: ["Appeal resolved", "Апеляцію розглянуто", "Rozstrzygnięto odwołanie"],
    user_deleted: ["User deleted", "Користувача видалено", "Usunięto użytkownika"],
    verification_granted: ["Verification granted", "Перевірку надано", "Nadano weryfikację"],
    verification_revoked: ["Verification revoked", "Перевірку відкликано", "Cofnięto weryfikację"],
    scheduled_job_requested: ["Job requested", "Запущено фонове завдання", "Zlecono zadanie"],
    illegal_content_notice_status_changed: [
      "Illegal-content notice updated",
      "Повідомлення про незаконний контент оновлено",
      "Zaktualizowano zgłoszenie nielegalnej treści",
    ],
  };
  const value = labels[action];
  return value ? localText(locale, value[0], value[1], value[2]) : humanizeKey(action);
}

function getLabels(locale: Locale) {
  const t = (en: string, uk: string, pl: string) => localText(locale, en, uk, pl);
  return {
    eyebrow: t("Accountability", "Підзвітність", "Rozliczalność"),
    title: t(
      "Administrative audit log",
      "Журнал дій адміністратора",
      "Dziennik działań administratora"
    ),
    hint: t(
      "Review who performed an action, exactly when it happened, which object changed and the recorded decision context.",
      "Переглядайте, хто виконав дію, точний час, змінений об’єкт і збережений контекст рішення.",
      "Sprawdzaj, kto wykonał działanie, dokładny czas, zmieniony obiekt i zapisany kontekst decyzji."
    ),
    search: t("Search events", "Пошук подій", "Szukaj zdarzeń"),
    searchHint: t(
      "Actor, action, object ID or metadata",
      "Виконавець, дія, ID або метадані",
      "Wykonawca, działanie, ID lub metadane"
    ),
    action: t("Action type", "Тип дії", "Typ działania"),
    allActions: t("All actions", "Усі дії", "Wszystkie działania"),
    refresh: t("Refresh", "Оновити", "Odśwież"),
    loadError: t(
      "Could not load the audit log.",
      "Не вдалося завантажити журнал.",
      "Nie udało się wczytać dziennika."
    ),
    loading: t("Loading audit events…", "Завантаження подій…", "Wczytywanie zdarzeń…"),
    events: t("{count} events shown", "Показано подій: {count}", "Wyświetlono zdarzeń: {count}"),
    empty: t(
      "No audit events match these filters.",
      "Подій за цими фільтрами немає.",
      "Brak zdarzeń pasujących do filtrów."
    ),
    page: t("Page {page}", "Сторінка {page}", "Strona {page}"),
    pagination: t("Audit log pagination", "Сторінки журналу", "Strony dziennika"),
    previous: t("Previous", "Назад", "Poprzednia"),
    next: t("Next", "Далі", "Następna"),
    by: t("Performed by", "Виконав", "Wykonał"),
    system: t("system", "система", "system"),
    exactTime: t("Exact time (UTC)", "Точний час (UTC)", "Dokładny czas (UTC)"),
    actor: t("Actor", "Виконавець", "Wykonawca"),
    sourceIp: t("Source network", "Мережа джерела", "Sieć źródłowa"),
    hidden: t("hidden", "приховано", "ukryta"),
    entity: t("Changed object", "Змінений об’єкт", "Zmieniony obiekt"),
    metadata: t("Recorded details", "Збережені деталі", "Zapisane szczegóły"),
    noMetadata: t(
      "No additional details were recorded.",
      "Додаткових деталей немає.",
      "Nie zapisano dodatkowych szczegółów."
    ),
  };
}
