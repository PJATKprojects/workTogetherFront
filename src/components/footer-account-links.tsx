"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

export type FooterAccountLabels = Readonly<{
  login: string;
  signUp: string;
  profile: string;
  myApplications: string;
}>;

const linkCls = "w-fit text-muted-foreground transition-colors hover:text-foreground";

/**
 * Account column links in the footer: guests see Log in / Sign up, an
 * authenticated user sees Profile / My applications instead (mirrors the
 * header's AuthNavActions behavior).
 */
export function FooterAccountLinks({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: FooterAccountLabels }>) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <span className="h-4 w-20 animate-pulse rounded bg-muted" />
        <span className="h-4 w-24 animate-pulse rounded bg-muted" />
      </>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <Link href={withLocale(locale, "/profile")} className={linkCls}>
          {labels.profile}
        </Link>
        <Link href={withLocale(locale, "/applications")} className={linkCls}>
          {labels.myApplications}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href={withLocale(locale, "/auth/login")} className={linkCls}>
        {labels.login}
      </Link>
      <Link href={withLocale(locale, "/auth/register")} className={linkCls}>
        {labels.signUp}
      </Link>
    </>
  );
}
