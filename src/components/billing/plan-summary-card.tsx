"use client";

import Link from "next/link";

import { usePlanOverview } from "@/hooks/use-billing";
import { useAuth } from "@/hooks/use-auth";
import { proCopy } from "@/i18n/pro-copy";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatDateTime } from "@/lib/format";

export function PlanSummaryCard({ locale }: Readonly<{ locale: Locale }>) {
  const { isAuthenticated } = useAuth();
  const overview = usePlanOverview(isAuthenticated);
  const text = proCopy(locale);

  if (!isAuthenticated || overview.isError) return null;
  if (overview.isLoading || !overview.data) {
    return <div className="mt-6 h-32 animate-pulse rounded-2xl bg-muted" aria-hidden />;
  }

  const plan = overview.data;
  return (
    <section className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft/55 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
            {text.current}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{plan.isPro ? text.pro : text.free}</h2>
          {plan.proUntil ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {text.activeUntil}: {formatDateTime(plan.proUntil, locale)}
            </p>
          ) : null}
        </div>
        <Link
          href={withLocale(locale, "/pro")}
          className="focus-ring inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          {text.profileLink}
        </Link>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Usage
          label={text.activeProjects}
          value={formatUsage(plan.activeProjects, plan.activeProjectsLimit, text.unlimited)}
        />
        <Usage
          label={text.applications}
          value={formatUsage(
            plan.applicationsUsedThisWeek,
            plan.applicationsPerWeekLimit,
            text.unlimited
          )}
        />
      </dl>
    </section>
  );
}

function Usage({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface/75 px-3 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function formatUsage(used: number, limit: number | null, unlimited: string) {
  return limit === null ? `${used} · ${unlimited}` : `${used} / ${limit}`;
}
