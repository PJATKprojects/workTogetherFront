"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { moderationService } from "@/services/moderationService";

import { ReportDialog } from "./report-dialog";

export function UserSafetyActions({
  userId,
  locale,
}: Readonly<{ userId: number; locale: Locale }>) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!user || user.id === userId) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <ReportDialog targetType="user" targetId={userId} locale={locale} />
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (
            !window.confirm(
              localText(
                locale,
                "Block this user for both sides?",
                "Заблокувати цього користувача з обох сторін?",
                "Zablokować tę osobę po obu stronach?"
              )
            )
          )
            return;
          setBusy(true);
          void moderationService
            .block(userId)
            .then(() => router.replace(withLocale(locale, "/students")))
            .finally(() => setBusy(false));
        }}
        className="rounded-xl border border-destructive/40 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        {localText(locale, "Block", "Заблокувати", "Zablokuj")}
      </button>
    </div>
  );
}
