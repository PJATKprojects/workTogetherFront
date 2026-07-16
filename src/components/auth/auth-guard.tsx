"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

export function AuthGuard({
  children,
  locale,
  loadingLabel,
}: Readonly<{ children: React.ReactNode; locale: Locale; loadingLabel: string }>) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const query = searchParams.toString();
      const returnUrl = `${pathname}${query ? `?${query}` : ""}`;
      router.replace(
        `${withLocale(locale, "/auth/login")}?returnUrl=${encodeURIComponent(returnUrl)}`
      );
    }
  }, [isAuthenticated, isLoading, locale, pathname, router, searchParams]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 text-sm text-muted-foreground">
        {loadingLabel}
      </div>
    );
  }

  return children;
}
