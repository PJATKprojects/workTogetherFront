"use client";

import Link from "next/link";

import { useApplicationsBadge } from "@/hooks/use-applications-badge";
import { useAuth } from "@/hooks/use-auth";
import { useChatUnreadCount } from "@/hooks/use-chat";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";

type Props = Readonly<{ locale: Locale; nav: SiteMessages["nav"] }>;

const pillCta =
  "focus-ring inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-linear-to-r from-primary to-secondary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-[0_10px_28px_-12px_rgb(37_99_235/0.7)] transition duration-200 hover:brightness-110 sm:px-4 sm:py-2";

export function AuthNavActions({ locale, nav }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const pendingCount = useApplicationsBadge(isAuthenticated);
  const unreadMessages = useChatUnreadCount(isAuthenticated).data ?? 0;

  if (isLoading) {
    return <span className="h-9 w-24 animate-pulse rounded-full bg-muted" />;
  }

  if (isAuthenticated) {
    return (
      <>
        <Link
          href={withLocale(locale, "/messages")}
          aria-label={nav.messages}
          className="focus-ring relative hidden whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
        >
          {nav.messages}
          {unreadMessages > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm">
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          ) : null}
        </Link>
        <Link
          href={withLocale(locale, "/applications")}
          className="focus-ring hidden whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:inline-flex"
        >
          {nav.myApplications}
        </Link>
        <Link
          href={withLocale(locale, "/projects/my")}
          className="focus-ring relative hidden whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:inline-flex"
        >
          {nav.myProjects}
          {pendingCount > 0 ? (
            // Unread-style badge: pending applications waiting for review.
            <span
              aria-label={`${pendingCount} pending`}
              className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm"
            >
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          ) : null}
        </Link>
        <Link href={withLocale(locale, "/profile")} className={pillCta}>
          {nav.profile}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={withLocale(locale, "/auth/login")}
        className="focus-ring hidden whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
      >
        {nav.login}
      </Link>
      <Link href={withLocale(locale, "/auth/register")} className={pillCta}>
        {nav.signUp}
      </Link>
    </>
  );
}
