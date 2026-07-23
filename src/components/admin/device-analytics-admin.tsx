"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import { adminService, type AdminDeviceAnalytics } from "@/services/adminService";

const chartColors = ["#2563eb", "#8b5cf6", "#0d9488", "#f59e0b", "#e11d48", "#64748b"];

export function DeviceAnalyticsAdmin({ locale }: Readonly<{ locale: Locale }>) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AdminDeviceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const labels = useMemo(() => getLabels(locale), [locale]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await adminService.deviceAnalytics(days));
    } catch (value) {
      setError(getApiError(value, labels.loadError).message);
    } finally {
      setLoading(false);
    }
  }, [days, labels.loadError]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const leadingDevice = data?.devices[0];
  const change =
    data && data.previousPeriodVisits > 0
      ? ((data.totalVisits - data.previousPeriodVisits) / data.previousPeriodVisits) * 100
      : data?.totalVisits
        ? 100
        : 0;

  return (
    <section aria-labelledby="device-analytics-title" className="grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
            {labels.eyebrow}
          </p>
          <h2 id="device-analytics-title" className="mt-2 text-2xl font-semibold">
            {labels.title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{labels.hint}</p>
        </div>
        <div
          role="group"
          aria-label={labels.period}
          className="flex rounded-xl border border-border bg-surface p-1"
        >
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={days === value}
              onClick={() => setDays(value)}
              className="focus-ring min-h-9 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {value} {labels.days}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="focus-ring ml-2 rounded-md font-semibold underline"
          >
            {labels.retry}
          </button>
        </div>
      ) : null}

      {loading && !data ? (
        <div
          role="status"
          className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground"
        >
          {labels.loading}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={labels.consentedVisits}
              value={formatNumber(data.totalVisits, locale)}
              detail={`${formatDateTime(data.rangeStart, locale)} — ${formatDateTime(data.rangeEnd, locale)}`}
            />
            <MetricCard
              label={labels.leadingDevice}
              value={leadingDevice ? deviceLabel(leadingDevice.key, labels) : "—"}
              detail={
                leadingDevice
                  ? `${percentage(leadingDevice.count, data.totalVisits)} · ${formatNumber(leadingDevice.count, locale)}`
                  : labels.noData
              }
            />
            <MetricCard
              label={labels.periodChange}
              value={`${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
              detail={`${formatNumber(data.previousPeriodVisits, locale)} ${labels.previousPeriod}`}
              tone={change > 0 ? "positive" : change < 0 ? "negative" : "neutral"}
            />
            <MetricCard
              label={labels.retention}
              value={`${data.privacy.retentionDays} ${labels.days}`}
              detail={labels.anonymousByDesign}
            />
          </div>

          {data.totalVisits === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
              <p className="font-semibold">{labels.noData}</p>
              <p className="mt-2 text-sm text-muted-foreground">{labels.noDataHint}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <DeviceDonut
                  items={data.devices}
                  total={data.totalVisits}
                  locale={locale}
                  labels={labels}
                />
                <TimelineChart
                  items={data.timeline}
                  locale={locale}
                  title={labels.visitTrend}
                  ariaLabel={labels.visitTrendAria}
                />
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <RankedBars
                  title={labels.operatingSystems}
                  items={data.operatingSystems}
                  total={data.totalVisits}
                  locale={locale}
                />
                <RankedBars
                  title={labels.browsers}
                  items={data.browsers}
                  total={data.totalVisits}
                  locale={locale}
                />
              </div>
            </>
          )}

          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              {labels.privacyTitle}
            </p>
            <p className="mt-1 leading-6 text-muted-foreground">{labels.privacyDetail}</p>
          </div>
        </>
      ) : null}
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  tone?: "positive" | "negative" | "neutral";
}>) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "negative"
        ? "text-amber-700 dark:text-amber-300"
        : "";
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}

function DeviceDonut({
  items,
  total,
  locale,
  labels,
}: Readonly<{
  items: Array<{ key: string; count: number }>;
  total: number;
  locale: Locale;
  labels: ReturnType<typeof getLabels>;
}>) {
  const stops = items.reduce<{ cursor: number; values: string[] }>(
    (state, item, index) => {
      const nextCursor = state.cursor + (item.count / total) * 100;
      return {
        cursor: nextCursor,
        values: [
          ...state.values,
          `${chartColors[index % chartColors.length]} ${state.cursor}% ${nextCursor}%`,
        ],
      };
    },
    { cursor: 0, values: [] }
  ).values;
  const aria = items
    .map((item) => `${deviceLabel(item.key, labels)} ${percentage(item.count, total)}`)
    .join(", ");

  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold">{labels.deviceMix}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{labels.deviceMixHint}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-[190px_1fr] sm:items-center">
        <div
          role="img"
          aria-label={`${labels.deviceMix}: ${aria}`}
          className="relative mx-auto grid size-44 place-items-center rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        >
          <div className="grid size-28 place-items-center rounded-full bg-surface text-center shadow-inner">
            <span>
              <span className="block text-2xl font-semibold">{formatNumber(total, locale)}</span>
              <span className="block text-xs text-muted-foreground">{labels.visits}</span>
            </span>
          </div>
        </div>
        <ul className="grid gap-3">
          {items.map((item, index) => (
            <li key={item.key} className="flex items-center gap-3">
              <span
                aria-hidden
                className="size-3 rounded-full"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {deviceLabel(item.key, labels)}
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {percentage(item.count, total)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function RankedBars({
  title,
  items,
  total,
  locale,
}: Readonly<{
  title: string;
  items: Array<{ key: string; count: number }>;
  total: number;
  locale: Locale;
}>) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-5 grid gap-4">
        {items.slice(0, 6).map((item, index) => (
          <li key={item.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{item.key}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatNumber(item.count, locale)} · {percentage(item.count, total)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full motion-reduce:transition-none"
                style={{
                  width: `${(item.count / maximum) * 100}%`,
                  backgroundColor: chartColors[index % chartColors.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function TimelineChart({
  items,
  locale,
  title,
  ariaLabel,
}: Readonly<{
  items: Array<{ date: string; count: number }>;
  locale: Locale;
  title: string;
  ariaLabel: string;
}>) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  const width = 720;
  const height = 230;
  const left = 24;
  const right = 18;
  const top = 24;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const points = items.map((item, index) => {
    const x = left + (index / Math.max(1, items.length - 1)) * plotWidth;
    const y = top + plotHeight - (item.count / maximum) * plotHeight;
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length
    ? `${left},${top + plotHeight} ${line} ${left + plotWidth},${top + plotHeight}`
    : "";
  const labelIndexes = Array.from(
    new Set([0, Math.floor((items.length - 1) / 2), items.length - 1])
  ).filter((index) => index >= 0);

  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-2xl bg-muted/35 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full text-primary"
          role="img"
          aria-label={ariaLabel}
        >
          {[0, 0.5, 1].map((value) => {
            const y = top + plotHeight * value;
            return (
              <line
                key={value}
                x1={left}
                x2={left + plotWidth}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeDasharray="5 7"
              />
            );
          })}
          <polygon points={area} fill="currentColor" fillOpacity="0.11" />
          <polyline
            points={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point) => (
            <circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              r="3.5"
              fill="var(--surface)"
              stroke="currentColor"
              strokeWidth="3"
            />
          ))}
          {labelIndexes.map((index) => {
            const point = points[index];
            return point ? (
              <text
                key={point.date}
                x={point.x}
                y={height - 12}
                textAnchor={index === 0 ? "start" : index === items.length - 1 ? "end" : "middle"}
                fill="currentColor"
                className="text-[12px]"
              >
                {formatShortDate(point.date, locale)}
              </text>
            ) : null;
          })}
        </svg>
      </div>
    </article>
  );
}

function percentage(value: number, total: number) {
  return `${(total ? (value / total) * 100 : 0).toFixed(1)}%`;
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(
    locale === "uk" ? "uk-UA" : locale === "pl" ? "pl-PL" : "en-US"
  ).format(value);
}

function formatShortDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "pl" ? "pl-PL" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function deviceLabel(key: string, labels: ReturnType<typeof getLabels>) {
  return (
    {
      desktop: labels.desktop,
      mobile: labels.mobile,
      tablet: labels.tablet,
      other: labels.other,
    }[key] ?? key
  );
}

function getLabels(locale: Locale) {
  const t = (en: string, uk: string, pl: string) => localText(locale, en, uk, pl);
  return {
    eyebrow: t("Product intelligence", "Аналітика продукту", "Analityka produktu"),
    title: t("Device analytics", "Аналітика пристроїв", "Analityka urządzeń"),
    hint: t(
      "Privacy-safe statistics from browser sessions that explicitly allowed optional analytics.",
      "Статистика з браузерних сесій, які явно дозволили необов’язкову аналітику, із захистом приватності.",
      "Statystyki z sesji przeglądarek, które wyraźnie zezwoliły na opcjonalną analitykę, z ochroną prywatności."
    ),
    period: t("Analytics period", "Період аналітики", "Okres analityki"),
    days: t("days", "днів", "dni"),
    loadError: t(
      "Could not load device analytics.",
      "Не вдалося завантажити аналітику пристроїв.",
      "Nie udało się wczytać analityki urządzeń."
    ),
    retry: t("Retry", "Повторити", "Spróbuj ponownie"),
    loading: t("Loading analytics…", "Завантаження аналітики…", "Wczytywanie analityki…"),
    consentedVisits: t("Consented visits", "Візити зі згодою", "Wizyty za zgodą"),
    leadingDevice: t("Most common device", "Найчастіший пристрій", "Najczęstsze urządzenie"),
    periodChange: t(
      "Change vs previous period",
      "Зміна до попереднього періоду",
      "Zmiana wobec poprzedniego okresu"
    ),
    previousPeriod: t("in the previous period", "у попередньому періоді", "w poprzednim okresie"),
    retention: t("Event retention", "Зберігання подій", "Retencja zdarzeń"),
    anonymousByDesign: t(
      "Anonymous categories only",
      "Лише анонімні категорії",
      "Wyłącznie anonimowe kategorie"
    ),
    noData: t("No consented visits yet", "Візитів зі згодою ще немає", "Brak wizyt za zgodą"),
    noDataHint: t(
      "Charts will appear after visitors opt in to anonymous analytics.",
      "Діаграми з’являться після того, як відвідувачі погодяться на анонімну аналітику.",
      "Wykresy pojawią się, gdy odwiedzający zgodzą się na anonimową analitykę."
    ),
    deviceMix: t("Device mix", "Розподіл пристроїв", "Struktura urządzeń"),
    deviceMixHint: t(
      "Share of consented browser sessions",
      "Частка браузерних сесій зі згодою",
      "Udział sesji przeglądarki za zgodą"
    ),
    visits: t("visits", "візитів", "wizyt"),
    visitTrend: t("Visit trend", "Динаміка візитів", "Trend wizyt"),
    visitTrendAria: t(
      "Line chart of consented visits by day",
      "Лінійний графік візитів зі згодою за днями",
      "Wykres liniowy wizyt za zgodą według dni"
    ),
    operatingSystems: t("Operating systems", "Операційні системи", "Systemy operacyjne"),
    browsers: t("Browsers", "Браузери", "Przeglądarki"),
    privacyTitle: t("Privacy boundary", "Межі приватності", "Granica prywatności"),
    privacyDetail: t(
      "These charts contain no IP addresses, raw user-agent strings or account IDs. A visit is recorded once per browser session only after opt-in, so totals are not unique-user counts.",
      "Ці діаграми не містять IP-адрес, повних рядків user agent чи ID акаунтів. Візит записується один раз за браузерну сесію лише після згоди, тому це не кількість унікальних користувачів.",
      "Wykresy nie zawierają adresów IP, pełnych ciągów user agent ani ID kont. Wizyta jest zapisywana raz na sesję przeglądarki dopiero po zgodzie, więc nie jest to liczba unikalnych użytkowników."
    ),
    desktop: t("Desktop", "Комп’ютер", "Komputer"),
    mobile: t("Mobile", "Телефон", "Telefon"),
    tablet: t("Tablet", "Планшет", "Tablet"),
    other: t("Other", "Інше", "Inne"),
  };
}
