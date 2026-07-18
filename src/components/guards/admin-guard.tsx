"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

export function AdminGuard({
  children,
  locale,
}: Readonly<{ children: React.ReactNode; locale: Locale }>) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(
        `${withLocale(locale, "/auth/login")}?returnUrl=${encodeURIComponent(
          withLocale(locale, "/admin")
        )}`
      );
    } else if (!user?.isAdmin) {
      router.replace(withLocale(locale, "/profile"));
    }
  }, [isAuthenticated, isLoading, locale, router, user?.isAdmin]);

  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div
        role="status"
        className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 text-sm text-muted-foreground"
      >
        {localText(
          locale,
          "Checking administrator access…",
          "Перевіряємо доступ адміністратора…",
          "Sprawdzamy dostęp administratora…"
        )}
      </div>
    );
  }

  return children;
}
