"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query/keys";
import { onboardingService } from "@/services/onboardingService";

const labels: Record<string, { en: string; uk: string }> = {
  bronze_onboarding: { en: "Onboarding complete", uk: "Онбординг завершено" },
  bronze_skills: { en: "Three skills added", uk: "Три навички додано" },
  bronze_explorer: { en: "Project explorer", uk: "Дослідник проєктів" },
  bronze_saved_search: { en: "First saved search", uk: "Перший збережений пошук" },
  first_application: { en: "First meaningful application", uk: "Перша змістовна заявка" },
  first_response: { en: "First application response", uk: "Перша відповідь на заявку" },
  first_team_charter: { en: "First team charter", uk: "Перший team charter" },
};
const noUnlockedAchievements: string[] = [];
const achievementToastDurationMs = 3_500;

export function AchievementCelebration() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const uk = locale === "uk";
  const pl = locale === "pl";
  const [dismissedNotification, setDismissedNotification] = useState("");
  const query = useQuery({
    queryKey: queryKeys.onboarding.progress(),
    queryFn: onboardingService.progress,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchInterval: isAuthenticated ? 60_000 : false,
  });
  const unlocked = query.data?.newlyUnlocked ?? noUnlockedAchievements;
  const notificationKey = unlocked.length ? `${user?.id ?? "unknown"}:${unlocked.join("|")}` : "";
  const refetch = query.refetch;

  useEffect(() => {
    if (!notificationKey || dismissedNotification === notificationKey) return;
    const timer = window.setTimeout(() => {
      setDismissedNotification(notificationKey);
      void refetch();
    }, achievementToastDurationMs);
    return () => window.clearTimeout(timer);
  }, [dismissedNotification, notificationKey, refetch]);

  if (!isAuthenticated || !unlocked.length || dismissedNotification === notificationKey) {
    return null;
  }

  const dismissLabel = uk
    ? "Закрити повідомлення"
    : pl
      ? "Zamknij powiadomienie"
      : "Dismiss notification";
  const dismiss = () => {
    setDismissedNotification(notificationKey);
    void refetch();
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[100] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-warning/40 bg-surface/95 p-4 shadow-2xl backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-3xl">
          🎉
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{uk ? "Досягнення відкрито" : "Achievement unlocked"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {unlocked
              .map((code) => labels[code]?.[uk ? "uk" : "en"] ?? code.replaceAll("_", " "))
              .join(", ")}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={dismissLabel}
          className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-xl text-xl leading-none text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 origin-left animate-pulse bg-linear-to-r from-warning to-primary" />
    </aside>
  );
}
