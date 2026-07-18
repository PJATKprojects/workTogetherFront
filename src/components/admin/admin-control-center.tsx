"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand/logo";
import { NavbarLocaleMenu } from "@/components/navbar-locale-menu";
import { NavbarThemeToggle } from "@/components/navbar-theme-toggle";
import { SkipLink } from "@/components/ui/skip-link";
import { useAuth } from "@/hooks/use-auth";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import {
  adminService,
  type AdminJob,
  type AdminOverview,
  type AdminUser,
} from "@/services/adminService";

import { EmailOutboxAdmin } from "./email-outbox-admin";
import { ModerationAdmin } from "./moderation-admin";

export type AdminTab = "overview" | "moderation" | "delivery" | "jobs" | "users";

export function AdminControlCenter({
  locale,
  initialTab = "overview",
}: Readonly<{ locale: Locale; initialTab?: AdminTab }>) {
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const labels = useMemo(() => getLabels(locale), [locale]);
  const tabs: { id: AdminTab; label: string }[] = [
    { id: "overview", label: labels.overview },
    { id: "moderation", label: labels.moderation },
    { id: "delivery", label: labels.delivery },
    { id: "jobs", label: labels.jobs },
    { id: "users", label: labels.users },
  ];
  const selectTab = (next: AdminTab) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "overview") url.searchParams.delete("section");
    else url.searchParams.set("section", next);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`
    );
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AdminConsoleHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              WorkTogether Operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {labels.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{labels.subtitle}</p>
          </div>
          <span className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            {labels.mfa}
          </span>
        </div>

        <div
          role="tablist"
          aria-label={labels.sections}
          className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-surface p-2"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              id={`admin-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`admin-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => selectTab(item.id)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                const current = tabs.findIndex((value) => value.id === tab);
                const direction = event.key === "ArrowRight" ? 1 : -1;
                const next = tabs[(current + direction + tabs.length) % tabs.length];
                selectTab(next.id);
                window.requestAnimationFrame(() =>
                  document.getElementById(`admin-tab-${next.id}`)?.focus()
                );
              }}
              className={`focus-ring min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold transition ${
                tab === item.id
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section
          id={`admin-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${tab}`}
          className="mt-6"
        >
          {tab === "overview" ? <OverviewPanel locale={locale} /> : null}
          {tab === "moderation" ? <ModerationAdmin locale={locale} /> : null}
          {tab === "delivery" ? <EmailOutboxAdmin locale={locale} /> : null}
          {tab === "jobs" ? <JobsPanel locale={locale} /> : null}
          {tab === "users" ? <UsersPanel locale={locale} /> : null}
        </section>
      </main>
    </div>
  );
}

function AdminConsoleHeader({ locale }: Readonly<{ locale: Locale }>) {
  const labels = getLabels(locale);
  const { user, logout } = useAuth();
  const [leaving, setLeaving] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-xl">
      <SkipLink label={labels.skipToContent} />
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
        <Link
          href={withLocale(locale, "/admin")}
          className="focus-ring flex min-w-0 items-center gap-3 rounded-xl"
        >
          <BrandMark className="size-9 shrink-0" rounded="rounded-xl" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">WorkTogether</span>
            <span className="block truncate text-xs text-muted-foreground">
              {labels.opsConsole}
            </span>
          </span>
        </Link>
        <span className="hidden h-7 w-px bg-border sm:block" aria-hidden />
        <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 sm:inline-flex">
          {labels.adminSession}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden max-w-44 truncate text-xs text-muted-foreground lg:block">
            {labels.signedInAs} {user?.userName}
          </span>
          <Link
            href={withLocale(locale, "/")}
            className="focus-ring inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {labels.backToSite}
          </Link>
          <NavbarLocaleMenu
            locale={locale}
            labels={{
              menuButtonAria: labels.language,
              localeEnglishAria: labels.english,
              localeUkrainianAria: labels.ukrainian,
              localePolishAria: labels.polish,
            }}
          />
          <NavbarThemeToggle ariaLabel={labels.theme} />
          <button
            type="button"
            disabled={leaving}
            onClick={() => {
              setLeaving(true);
              void logout().finally(() => {
                window.location.assign(withLocale(locale, "/auth/login"));
              });
            }}
            className="focus-ring min-h-10 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            {leaving ? labels.signingOut : labels.signOut}
          </button>
        </div>
      </div>
    </header>
  );
}

function OverviewPanel({ locale }: Readonly<{ locale: Locale }>) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const labels = getLabels(locale);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      setError("");
      try {
        setOverview(await adminService.overview());
      } catch (value) {
        setError(getApiError(value, labels.loadError).message);
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [labels.loadError]
  );

  useEffect(() => {
    const start = window.setTimeout(() => void load(), 0);
    const poll = window.setInterval(() => void load(true), 30_000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(poll);
    };
  }, [load]);

  if (!overview && !error) return <AdminLoading label={labels.loading} />;

  const cards = overview
    ? [
        [labels.activeUsers, overview.users.active, `${overview.users.total} ${labels.total}`],
        [
          labels.recruiting,
          overview.projects.recruiting,
          `${overview.projects.stale} ${labels.stale}`,
        ],
        [
          labels.waitingApplications,
          overview.applications.waiting,
          `+${overview.applications.sentLast24Hours} / 24h`,
        ],
        [
          labels.openReports,
          overview.moderation.openReports,
          `${overview.moderation.openAppeals} ${labels.appeals}`,
        ],
        [
          labels.outbox,
          overview.delivery.outboxPending,
          `${overview.delivery.outboxDeadLetter} dead-letter`,
        ],
        [
          labels.jobHealth,
          overview.jobs.total - overview.jobs.failed,
          `${overview.jobs.lagging} ${labels.lagging}`,
        ],
        [
          labels.activeAlerts,
          overview.alerts?.length ?? 0,
          (overview.alerts?.length ?? 0) === 0 ? labels.noActiveAlerts : labels.needsAttention,
        ],
      ]
    : [];

  return (
    <div className="grid gap-5">
      <div aria-live="polite" className="sr-only">
        {refreshing ? labels.refreshing : ""}
      </div>
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {overview
            ? `${labels.updated} ${formatDateTime(overview.generatedAt, locale)} · ID ${overview.correlationId}`
            : labels.noSnapshot}
        </p>
        <button
          type="button"
          disabled={refreshing}
          onClick={() => void load()}
          className="focus-ring min-h-10 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"
        >
          {labels.refresh}
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, value, detail]) => (
          <article
            key={String(title)}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </article>
        ))}
      </div>
      {overview ? (
        <>
          <OperationalAlerts overview={overview} locale={locale} />
          <div className="grid gap-5 xl:grid-cols-3">
            <MetricGroup
              title={labels.reliability}
              rows={[
                [
                  labels.apmExport,
                  overview.observability?.apmExportConfigured
                    ? labels.configured
                    : labels.notConfigured,
                ],
                [labels.requests, formatNumber(overview.counters.requestCount ?? 0, locale)],
                [
                  labels.averageLatency,
                  `${(overview.counters.averageLatencyMs ?? 0).toFixed(1)} ms`,
                ],
                [labels.errorRate, `${(overview.counters.errorRatePercent ?? 0).toFixed(2)}%`],
                [labels.authAttempts, formatNumber(overview.counters.authAttempts ?? 0, locale)],
                [labels.loginAttempts, formatNumber(overview.counters.loginAttempts ?? 0, locale)],
                [labels.resetAttempts, formatNumber(overview.counters.resetAttempts ?? 0, locale)],
                [labels.oauthAttempts, formatNumber(overview.counters.oauthAttempts ?? 0, locale)],
                [labels.authRejected, formatNumber(overview.counters.authRejected ?? 0, locale)],
                [
                  labels.applicationErrors,
                  formatNumber(overview.counters.applicationErrors ?? 0, locale),
                ],
                [labels.pushFailures, formatNumber(overview.counters.pushFailures ?? 0, locale)],
                [labels.jobFailures, formatNumber(overview.counters.jobFailures ?? 0, locale)],
              ]}
            />
            <MetricGroup
              title={labels.deliveryHealth}
              rows={[
                [
                  labels.oldestEmail,
                  formatDuration(overview.delivery.oldestOutboxAgeSeconds, locale),
                ],
                [labels.pushPending, String(overview.delivery.pushPending)],
                [labels.pushExhausted, String(overview.delivery.pushExhausted)],
                [labels.rateLimit, String(overview.counters.rateLimitRejects ?? 0)],
                [labels.signalR, String(overview.counters.signalRReconnects ?? 0)],
              ]}
            />
            <MetricGroup
              title={labels.capacity}
              rows={[
                [labels.database, formatBytes(overview.process.databaseSizeBytes)],
                [labels.storage, formatBytes(overview.process.storageSizeBytes)],
                [labels.memory, formatBytes(overview.process.workingSetBytes)],
                [labels.uptime, formatDuration(overview.process.uptimeSeconds, locale)],
                [labels.slowQueries, String(overview.counters.slowQueries ?? 0)],
              ]}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function OperationalAlerts({
  overview,
  locale,
}: Readonly<{ overview: AdminOverview; locale: Locale }>) {
  const labels = getLabels(locale);
  const alerts = overview.alerts ?? [];
  return (
    <section
      aria-labelledby="operational-alerts-title"
      className={`rounded-2xl border p-5 ${
        alerts.length
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-emerald-500/30 bg-emerald-500/10"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="operational-alerts-title" className="font-semibold">
            {labels.operationalAlerts}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {alerts.length ? labels.alertsHint : labels.noAlertsHint}
          </p>
        </div>
        <StatusPill tone={alerts.length ? "warn" : "good"}>
          {alerts.length ? `${alerts.length} ${labels.active}` : labels.healthy}
        </StatusPill>
      </div>
      {alerts.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-live="polite">
          {alerts.map((alert) => (
            <li
              key={alert.code}
              className="rounded-xl border border-amber-500/20 bg-surface/80 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{alertLabel(locale, alert.code)}</span>
                <StatusPill tone={alert.severity === "critical" ? "bad" : "warn"}>
                  {alert.severity === "critical" ? labels.critical : labels.warning}
                </StatusPill>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {formatAlertValue(alert.code, alert.value, locale)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function JobsPanel({ locale }: Readonly<{ locale: Locale }>) {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const labels = getLabels(locale);

  const load = useCallback(async () => {
    setError("");
    try {
      setJobs(await adminService.jobs());
    } catch (value) {
      setError(getApiError(value, labels.loadError).message);
    }
  }, [labels.loadError]);

  useEffect(() => {
    const start = window.setTimeout(() => void load(), 0);
    const poll = window.setInterval(() => void load(), 15_000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(poll);
    };
  }, [load]);

  const trigger = async (name: string) => {
    setBusy(name);
    setError("");
    try {
      await adminService.triggerJob(name);
      await load();
    } catch (value) {
      setError(getApiError(value, labels.actionError).message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="grid gap-4">
      {error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[900px] text-left text-sm">
          <caption className="sr-only">{labels.jobs}</caption>
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-4">{labels.name}</th>
              <th>{labels.status}</th>
              <th>{labels.lastSuccess}</th>
              <th>{labels.nextRun}</th>
              <th>{labels.runs}</th>
              <th>{labels.lastError}</th>
              <th className="p-4 text-right">{labels.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr key={job.name}>
                <td className="p-4 font-semibold">{job.name}</td>
                <td>
                  <StatusPill
                    tone={
                      job.isLagging || job.lastError
                        ? "bad"
                        : job.isRunning || job.manualRunPending
                          ? "warn"
                          : "good"
                    }
                  >
                    {job.isLagging
                      ? labels.lagging
                      : job.isRunning
                        ? labels.running
                        : job.manualRunPending
                          ? labels.queued
                          : labels.healthy}
                  </StatusPill>
                </td>
                <td>{job.lastSucceededAt ? formatDateTime(job.lastSucceededAt, locale) : "—"}</td>
                <td>
                  {job.nextExpectedRunAt
                    ? formatDateTime(job.nextExpectedRunAt, locale)
                    : labels.firstRun}
                </td>
                <td>
                  {job.runCount} / {job.failureCount}
                </td>
                <td className="max-w-72 truncate text-destructive" title={job.lastError}>
                  {job.lastError || "—"}
                </td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    disabled={busy === job.name || job.isRunning || job.manualRunPending}
                    onClick={() => void trigger(job.name)}
                    className="focus-ring min-h-10 rounded-xl border border-border px-3 font-semibold hover:bg-muted disabled:opacity-40"
                  >
                    {labels.runNow}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersPanel({ locale }: Readonly<{ locale: Locale }>) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [draft, setDraft] = useState<
    Record<number, { type: "domain" | "organization"; label: string }>
  >({});
  const labels = getLabels(locale);

  const load = useCallback(
    async (query = "") => {
      setError("");
      try {
        setUsers((await adminService.users(query)).items);
      } catch (value) {
        setError(getApiError(value, labels.loadError).message);
      }
    },
    [labels.loadError]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const grant = async (user: AdminUser) => {
    const value = draft[user.id] ?? { type: "domain" as const, label: "" };
    if (!value.label.trim()) return;
    setBusy(`grant-${user.id}`);
    try {
      await adminService.grantVerification(user.id, value.type, value.label.trim());
      await load(search);
    } catch (reason) {
      setError(getApiError(reason, labels.actionError).message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="grid gap-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          void load(search);
        }}
        className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row"
      >
        <label htmlFor="admin-user-search" className="sr-only">
          {labels.searchUsers}
        </label>
        <input
          id="admin-user-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={labels.searchHint}
          className="min-h-11 flex-1 rounded-xl border border-input bg-background px-3"
        />
        <button
          type="submit"
          className="focus-ring min-h-11 rounded-xl bg-foreground px-5 font-semibold text-background"
        >
          {labels.search}
        </button>
      </form>
      {error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4">
        {users.map((user) => {
          const value = draft[user.id] ?? { type: "domain" as const, label: "" };
          const badges = [
            user.badges.email ? "Email" : null,
            user.badges.github ? "GitHub" : null,
            user.badges.completedCollaboration ? labels.completedCollaboration : null,
            ...user.badges.attestations.map((item) => `${item.type}: ${item.label}`),
          ].filter(Boolean);
          return (
            <article key={user.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    #{user.id} · {user.userName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill tone={user.isActive ? "good" : "bad"}>
                      {user.isActive ? labels.active : labels.inactive}
                    </StatusPill>
                    {user.isAdmin ? <StatusPill tone="warn">{labels.admin}</StatusPill> : null}
                    {badges.map((badge) => (
                      <StatusPill key={badge} tone="neutral">
                        {badge}
                      </StatusPill>
                    ))}
                    {user.badges.attestations.map((badge) => (
                      <button
                        key={`revoke-${badge.type}`}
                        type="button"
                        disabled={busy === `revoke-${user.id}-${badge.type}`}
                        onClick={() => {
                          setBusy(`revoke-${user.id}-${badge.type}`);
                          void adminService
                            .revokeVerification(user.id, badge.type)
                            .then(() => load(search))
                            .catch((reason) =>
                              setError(getApiError(reason, labels.actionError).message)
                            )
                            .finally(() => setBusy(""));
                        }}
                        className="focus-ring rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive disabled:opacity-40"
                      >
                        {labels.revoke}: {badge.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>
                    {labels.created}: {formatDateTime(user.createdAt, locale)}
                  </p>
                  <p>
                    {labels.sessions}: {user.activeSessions}
                  </p>
                  <p>
                    {labels.loginMethods}: {user.loginMethods.join(", ") || "password"}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-[160px_1fr_auto]">
                <select
                  aria-label={labels.badgeType}
                  value={value.type}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [user.id]: {
                        ...value,
                        type: event.target.value as "domain" | "organization",
                      },
                    }))
                  }
                  className="min-h-10 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="domain">Domain</option>
                  <option value="organization">Organization</option>
                </select>
                <input
                  aria-label={labels.badgeLabel}
                  value={value.label}
                  maxLength={160}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [user.id]: { ...value, label: event.target.value },
                    }))
                  }
                  placeholder={labels.badgeLabel}
                  className="min-h-10 rounded-xl border border-input bg-background px-3 text-sm"
                />
                <button
                  type="button"
                  disabled={!value.label.trim() || busy === `grant-${user.id}`}
                  onClick={() => void grant(user)}
                  className="focus-ring min-h-10 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-40"
                >
                  {labels.grant}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MetricGroup({ title, rows }: Readonly<{ title: string; rows: [string, string][] }>) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-4 divide-y divide-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-mono font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StatusPill({
  tone,
  children,
}: Readonly<{ tone: "good" | "warn" | "bad" | "neutral"; children: React.ReactNode }>) {
  const styles = {
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    bad: "border-destructive/30 bg-destructive/10 text-destructive",
    neutral: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function AdminLoading({ label }: Readonly<{ label: string }>) {
  return (
    <div
      role="status"
      className="min-h-48 animate-pulse rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground"
    >
      {label}
    </div>
  );
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function formatDuration(seconds: number, locale: Locale) {
  if (!Number.isFinite(seconds) || seconds < 60) return `${Math.max(0, Math.round(seconds))} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h`;
  return localText(
    locale,
    `${Math.round(seconds / 86400)} d`,
    `${Math.round(seconds / 86400)} д`,
    `${Math.round(seconds / 86400)} d`
  );
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(
    locale === "uk" ? "uk-UA" : locale === "pl" ? "pl-PL" : "en-US"
  ).format(value);
}

function alertLabel(locale: Locale, code: NonNullable<AdminOverview["alerts"]>[number]["code"]) {
  const labels: Record<typeof code, [string, string, string]> = {
    scheduled_job_lag: [
      "Scheduled job missed its window",
      "Фонова задача пропустила вікно",
      "Zadanie cykliczne przekroczyło okno",
    ],
    outbox_age: [
      "Email outbox is delayed",
      "Черга email затримується",
      "Kolejka e-mail jest opóźniona",
    ],
    outbox_dead_letter: [
      "Dead-letter email requires review",
      "Dead-letter email потребує перевірки",
      "Martwy e-mail wymaga przeglądu",
    ],
    push_exhausted: [
      "Push retries exhausted",
      "Вичерпано повтори push",
      "Wyczerpano ponowienia push",
    ],
    database_capacity: [
      "Database capacity threshold",
      "Поріг місткості бази",
      "Próg pojemności bazy",
    ],
    storage_capacity: ["File storage threshold", "Поріг файлового сховища", "Próg pamięci plików"],
  };
  const value = labels[code];
  return localText(locale, value[0], value[1], value[2]);
}

function formatAlertValue(
  code: NonNullable<AdminOverview["alerts"]>[number]["code"],
  value: number,
  locale: Locale
) {
  if (code === "outbox_age") return formatDuration(value, locale);
  if (code === "database_capacity" || code === "storage_capacity") return formatBytes(value);
  return formatNumber(value, locale);
}

function getLabels(locale: Locale) {
  const t = (en: string, uk: string, pl: string) => localText(locale, en, uk, pl);
  return {
    skipToContent: t("Skip to content", "Перейти до вмісту", "Przejdź do treści"),
    opsConsole: t("Operations console", "Операційна консоль", "Konsola operacyjna"),
    adminSession: t(
      "Protected admin session",
      "Захищена адмін-сесія",
      "Chroniona sesja administratora"
    ),
    signedInAs: t("Signed in as", "Вхід як", "Zalogowano jako"),
    backToSite: t("Back to site", "На сайт", "Wróć do serwisu"),
    language: t("Change language", "Змінити мову", "Zmień język"),
    english: t("Switch to English", "Перемкнути на англійську", "Przełącz na angielski"),
    ukrainian: t("Switch to Ukrainian", "Перемкнути на українську", "Przełącz na ukraiński"),
    polish: t("Switch to Polish", "Перемкнути на польську", "Przełącz na polski"),
    theme: t("Change color theme", "Змінити тему", "Zmień motyw"),
    signOut: t("Sign out", "Вийти", "Wyloguj"),
    signingOut: t("Signing out…", "Вихід…", "Wylogowywanie…"),
    title: t("Administration", "Адміністрування", "Administracja"),
    subtitle: t(
      "One place for service health, moderation, delivery, scheduled jobs and account verification.",
      "Єдине місце для стану сервісу, модерації, доставки, фонових задач і верифікацій.",
      "Jedno miejsce do monitorowania usługi, moderacji, dostarczania, zadań i weryfikacji."
    ),
    mfa: t(
      "Sensitive actions require recent MFA",
      "Чутливі дії вимагають недавнього MFA",
      "Wrażliwe działania wymagają świeżego MFA"
    ),
    sections: t("Administration sections", "Розділи адміністрування", "Sekcje administracji"),
    overview: t("Overview", "Огляд", "Przegląd"),
    moderation: t("Moderation", "Модерація", "Moderacja"),
    delivery: t("Email delivery", "Доставка email", "Dostarczanie email"),
    jobs: t("Scheduled jobs", "Фонові задачі", "Zadania cykliczne"),
    users: t("Users & badges", "Користувачі та badges", "Użytkownicy i odznaki"),
    loading: t(
      "Loading operational snapshot…",
      "Завантажуємо стан системи…",
      "Wczytywanie stanu systemu…"
    ),
    refreshing: t("Refreshing data", "Оновлюємо дані", "Odświeżanie danych"),
    loadError: t(
      "Administrative data is unavailable.",
      "Адміністративні дані недоступні.",
      "Dane administracyjne są niedostępne."
    ),
    actionError: t(
      "The administrative action failed.",
      "Адміністративна дія не вдалася.",
      "Działanie administracyjne nie powiodło się."
    ),
    updated: t("Updated", "Оновлено", "Zaktualizowano"),
    noSnapshot: t("No snapshot is available.", "Знімок недоступний.", "Brak dostępnego zrzutu."),
    refresh: t("Refresh", "Оновити", "Odśwież"),
    activeUsers: t("Active users", "Активні користувачі", "Aktywni użytkownicy"),
    total: t("total", "усього", "łącznie"),
    recruiting: t("Recruiting projects", "Проєкти з набором", "Projekty rekrutujące"),
    stale: t("need review", "потребують перевірки", "wymaga przeglądu"),
    waitingApplications: t("Waiting applications", "Заявки в очікуванні", "Oczekujące zgłoszenia"),
    openReports: t("Moderation queue", "Черга модерації", "Kolejka moderacji"),
    appeals: t("appeals", "апеляцій", "odwołań"),
    outbox: t("Pending email", "Email в очікуванні", "Oczekujące e-maile"),
    jobHealth: t("Healthy jobs", "Справні задачі", "Zdrowe zadania"),
    activeAlerts: t("Active alerts", "Активні сповіщення", "Aktywne alerty"),
    noActiveAlerts: t("none", "немає", "brak"),
    needsAttention: t("needs attention", "потребує уваги", "wymaga uwagi"),
    lagging: t("lagging", "відстають", "opóźnione"),
    operationalAlerts: t("Operational alerts", "Операційні сповіщення", "Alerty operacyjne"),
    alertsHint: t(
      "Review these conditions before they affect users.",
      "Перевірте ці стани, перш ніж вони вплинуть на користувачів.",
      "Sprawdź te stany, zanim wpłyną na użytkowników."
    ),
    noAlertsHint: t(
      "No queue, job or capacity threshold is currently breached.",
      "Пороги черг, задач і місткості не перевищені.",
      "Żaden próg kolejki, zadania ani pojemności nie został przekroczony."
    ),
    critical: t("Critical", "Критично", "Krytyczne"),
    warning: t("Warning", "Попередження", "Ostrzeżenie"),
    reliability: t("APM and reliability", "APM і надійність", "APM i niezawodność"),
    apmExport: t("OTLP/APM export", "Експорт OTLP/APM", "Eksport OTLP/APM"),
    configured: t("Configured", "Налаштовано", "Skonfigurowano"),
    notConfigured: t("Not configured", "Не налаштовано", "Nie skonfigurowano"),
    requests: t("Requests since start", "Запити від запуску", "Żądania od uruchomienia"),
    averageLatency: t("Average latency", "Середня затримка", "Średnie opóźnienie"),
    errorRate: t("5xx error rate", "Частка помилок 5xx", "Odsetek błędów 5xx"),
    authAttempts: t(
      "Auth/reset/OAuth attempts",
      "Спроби auth/reset/OAuth",
      "Próby auth/reset/OAuth"
    ),
    loginAttempts: t("Login attempts", "Спроби входу", "Próby logowania"),
    resetAttempts: t(
      "Password reset attempts",
      "Спроби скидання пароля",
      "Próby resetowania hasła"
    ),
    oauthAttempts: t("OAuth attempts", "Спроби OAuth", "Próby OAuth"),
    authRejected: t(
      "Rejected auth attempts",
      "Відхилені спроби входу",
      "Odrzucone próby logowania"
    ),
    applicationErrors: t("Application errors", "Помилки застосунку", "Błędy aplikacji"),
    pushFailures: t("Push failures", "Помилки push", "Błędy push"),
    jobFailures: t("Job failures", "Помилки задач", "Błędy zadań"),
    deliveryHealth: t("Delivery and traffic", "Доставка та трафік", "Dostarczanie i ruch"),
    oldestEmail: t("Oldest pending email", "Найстаріший email", "Najstarszy oczekujący e-mail"),
    pushPending: t("Pending push", "Push в очікуванні", "Oczekujące push"),
    pushExhausted: t(
      "Exhausted push retries",
      "Вичерпані push retry",
      "Wyczerpane ponowienia push"
    ),
    rateLimit: t("Rate-limit rejects", "Відхилення rate limit", "Odrzucenia limitu"),
    signalR: t(
      "SignalR reconnect events",
      "Події перепідключення SignalR",
      "Zdarzenia ponownego połączenia SignalR"
    ),
    capacity: t("Capacity and runtime", "Місткість та runtime", "Pojemność i środowisko"),
    database: t("Database size", "Розмір бази", "Rozmiar bazy"),
    storage: t("File storage", "Файлове сховище", "Pamięć plików"),
    memory: t("Process memory", "Пам’ять процесу", "Pamięć procesu"),
    uptime: t("Uptime", "Час роботи", "Czas działania"),
    slowQueries: t("Slow queries", "Повільні запити", "Wolne zapytania"),
    name: t("Name", "Назва", "Nazwa"),
    status: t("Status", "Статус", "Status"),
    lastSuccess: t("Last success", "Останній успіх", "Ostatni sukces"),
    nextRun: t("Next run", "Наступний запуск", "Następne uruchomienie"),
    runs: t("Runs / failures", "Запуски / помилки", "Uruchomienia / błędy"),
    lastError: t("Last error", "Остання помилка", "Ostatni błąd"),
    action: t("Action", "Дія", "Działanie"),
    running: t("Running", "Виконується", "Działa"),
    queued: t("Queued", "У черзі", "W kolejce"),
    healthy: t("Healthy", "Справно", "Zdrowe"),
    firstRun: t("First run pending", "Очікується перший запуск", "Oczekuje na pierwszy start"),
    runNow: t("Run safely", "Безпечно запустити", "Uruchom bezpiecznie"),
    searchUsers: t("Search users", "Пошук користувачів", "Szukaj użytkowników"),
    searchHint: t(
      "Username, user ID, or exact email",
      "Username, ID або точний email",
      "Nazwa, ID lub dokładny e-mail"
    ),
    search: t("Search", "Знайти", "Szukaj"),
    active: t("Active", "Активний", "Aktywny"),
    inactive: t("Inactive", "Неактивний", "Nieaktywny"),
    admin: t("Admin", "Адмін", "Admin"),
    completedCollaboration: t(
      "Completed collaboration",
      "Завершена співпраця",
      "Ukończona współpraca"
    ),
    created: t("Created", "Створено", "Utworzono"),
    sessions: t("Active sessions", "Активні сесії", "Aktywne sesje"),
    loginMethods: t("Login methods", "Способи входу", "Metody logowania"),
    badgeType: t("Verification type", "Тип верифікації", "Typ weryfikacji"),
    badgeLabel: t(
      "Verified domain or organization",
      "Підтверджений домен або організація",
      "Zweryfikowana domena lub organizacja"
    ),
    grant: t("Grant badge", "Додати badge", "Nadaj odznakę"),
    revoke: t("Revoke", "Відкликати", "Cofnij"),
  };
}
