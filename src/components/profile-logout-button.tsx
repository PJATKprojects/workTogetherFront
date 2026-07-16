"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

export function ProfileLogoutButton({
  locale,
  label,
}: Readonly<{ locale: Locale; label: string }>) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const onLogout = async () => {
    setIsPending(true);
    try {
      await logout();
    } catch {
      // The in-memory session is cleared even if the server is temporarily unavailable.
    } finally {
      router.replace(withLocale(locale, "/"));
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onLogout}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
    >
      {label}
    </button>
  );
}
