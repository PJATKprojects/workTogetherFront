"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useBillingCheckout, usePlanOverview } from "@/hooks/use-billing";
import type { Locale } from "@/i18n/locales";
import { proCopy } from "@/i18n/pro-copy";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import type { BillingPackage } from "@/types";

const fallbackPackages: BillingPackage[] = [
  packageOf("pro_1_month", 1, 2_000),
  packageOf("pro_3_months", 3, 6_000),
  packageOf("pro_6_months", 6, 10_000),
  packageOf("pro_12_months", 12, 18_000),
];

export function ProPlans({ locale }: Readonly<{ locale: Locale }>) {
  const text = proCopy(locale);
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: plan, refetch: refetchOverview } = usePlanOverview(isAuthenticated);
  const checkout = useBillingCheckout();
  const [error, setError] = useState("");
  const [immediateConsent, setImmediateConsent] = useState(false);
  const checkoutState = searchParams.get("checkout");

  useEffect(() => {
    if (checkoutState !== "success" || !isAuthenticated) return;
    const interval = window.setInterval(() => void refetchOverview(), 2_000);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 30_000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [checkoutState, isAuthenticated, refetchOverview]);

  const packages = plan?.packages.length ? plan.packages : fallbackPackages;

  const startCheckout = async (packageCode: string) => {
    setError("");
    try {
      const session = await checkout.mutateAsync({
        packageCode,
        clientRequestId: crypto.randomUUID(),
        locale,
        immediatePerformanceConsent: immediateConsent,
      });
      window.location.assign(session.url);
    } catch (reason) {
      setError(getApiError(reason, text.error).message);
    }
  };

  return (
    <div className="space-y-8">
      {checkoutState === "success" ? <Status tone="success">{text.paymentSuccess}</Status> : null}
      {checkoutState === "cancelled" ? (
        <Status tone="neutral">{text.paymentCancelled}</Status>
      ) : null}

      {isAuthenticated && plan ? (
        <section className="rounded-3xl border border-primary/20 bg-primary-soft/50 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
                {text.current}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{plan.isPro ? text.pro : text.free}</h2>
              {plan.proUntil ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {text.activeUntil}: {formatDateTime(plan.proUntil, locale)}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2 text-sm sm:min-w-72">
              <UsageLine
                label={text.activeProjects}
                value={usage(plan.activeProjects, plan.activeProjectsLimit, text.unlimited)}
              />
              <UsageLine
                label={text.applications}
                value={usage(
                  plan.applicationsUsedThisWeek,
                  plan.applicationsPerWeekLimit,
                  text.unlimited
                )}
              />
              {!plan.isPro ? (
                <p className="text-xs text-muted-foreground">
                  {text.resets}: {formatDateTime(plan.applicationsResetAt, locale)}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <PlanCard title={text.free} highlighted={!plan?.isPro}>
          <Feature>{text.oneActiveProject}</Feature>
          <Feature>{text.twoApplications}</Feature>
          <Feature>{text.storedProjects}</Feature>
          <Feature>{text.sameCoreFeatures}</Feature>
        </PlanCard>
        <PlanCard title={text.pro} highlighted={Boolean(plan?.isPro)}>
          <Feature>{text.unlimitedProjects}</Feature>
          <Feature>{text.unlimitedApplications}</Feature>
          <Feature>{text.storedProjects}</Feature>
          <Feature>{text.sameCoreFeatures}</Feature>
        </PlanCard>
      </section>

      <section aria-labelledby="period-title">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 id="period-title" className="text-2xl font-semibold tracking-tight">
              {text.choosePeriod}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{text.singlePayment}</p>
          </div>
          <p className="text-xs text-muted-foreground">{text.secureCheckout}</p>
        </div>

        {isAuthenticated ? (
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface/80 p-4 text-sm leading-6">
            <input
              type="checkbox"
              checked={immediateConsent}
              onChange={(event) => setImmediateConsent(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-primary"
              required
            />
            <span>{text.immediateConsent}</span>
          </label>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((item) => {
            const featured = item.durationMonths === 12;
            const disabled = checkout.isPending || !plan?.webCheckoutAvailable || !immediateConsent;
            return (
              <article
                key={item.code}
                className={`flex flex-col rounded-3xl border p-5 transition duration-200 hover:-translate-y-0.5 motion-reduce:transform-none ${
                  featured
                    ? "border-primary/45 bg-primary-soft/45 shadow-[0_18px_45px_-32px_rgb(37_99_235/0.55)]"
                    : "border-border bg-surface/85"
                }`}
              >
                <p className="text-sm font-semibold text-muted-foreground">
                  {item.durationMonths} {item.durationMonths === 1 ? text.month : text.months}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {money(item.priceMinor, locale)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {text.perMonth.replace(
                    "{amount}",
                    money(item.equivalentMonthlyPriceMinor, locale)
                  )}
                </p>
                {item.savingsMinor > 0 ? (
                  <p className="mt-3 inline-flex w-fit rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                    {text.save.replace("{amount}", money(item.savingsMinor, locale))}
                  </p>
                ) : (
                  <div className="mt-3 h-6" aria-hidden />
                )}
                <div className="mt-5">
                  {!isAuthenticated && !authLoading ? (
                    <Link
                      href={`${withLocale(locale, "/auth/login")}?returnUrl=${encodeURIComponent(
                        withLocale(locale, "/pro")
                      )}`}
                      className="focus-ring inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                      {text.signIn}
                    </Link>
                  ) : (
                    <Button
                      type="button"
                      className="w-full"
                      disabled={disabled}
                      onClick={() => void startCheckout(item.code)}
                    >
                      {text.buy.replace("{amount}", money(item.priceMinor, locale))}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {isAuthenticated && plan && !plan.webCheckoutAvailable ? (
          <p className="mt-4 text-sm text-warning-soft-foreground">{text.unavailable}</p>
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <p className="mt-5 text-xs text-muted-foreground">
          {text.termsPrefix}{" "}
          <Link className="underline underline-offset-2" href={withLocale(locale, "/terms")}>
            {text.terms}
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function PlanCard({
  title,
  highlighted,
  children,
}: Readonly<{ title: string; highlighted: boolean; children: React.ReactNode }>) {
  return (
    <article
      className={`rounded-3xl border p-6 ${
        highlighted ? "border-primary/40 bg-primary-soft/35" : "border-border bg-surface/80"
      }`}
    >
      <h2 className="text-2xl font-semibold">{title}</h2>
      <ul className="mt-5 grid gap-3 text-sm">{children}</ul>
    </article>
  );
}

function Feature({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/12 text-xs font-bold text-success">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function UsageLine({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-border/70 bg-surface/70 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Status({
  tone,
  children,
}: Readonly<{ tone: "success" | "neutral"; children: React.ReactNode }>) {
  return (
    <div
      role="status"
      className={`rounded-2xl border p-4 text-sm ${
        tone === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-border bg-surface-muted text-foreground"
      }`}
    >
      {children}
    </div>
  );
}

function packageOf(
  code: BillingPackage["code"],
  durationMonths: BillingPackage["durationMonths"],
  priceMinor: number
): BillingPackage {
  return {
    code,
    durationMonths,
    priceMinor,
    currency: "PLN",
    equivalentMonthlyPriceMinor: Math.floor(priceMinor / durationMonths),
    savingsMinor: Math.max(0, durationMonths * 2_000 - priceMinor),
  };
}

function money(minor: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "uk" ? "uk-UA" : locale === "pl" ? "pl-PL" : "en-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

function usage(used: number, limit: number | null, unlimited: string) {
  return limit === null ? `${used} · ${unlimited}` : `${used} / ${limit}`;
}
