"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query/keys";
import { onboardingService } from "@/services/onboardingService";

const labels: Record<string, { en: string; uk: string }> = {
  bronze_availability: { en: "Availability added", uk: "Доступність додано" },
  bronze_skills: { en: "Three skills added", uk: "Три навички додано" },
  bronze_explorer: { en: "Project explorer", uk: "Дослідник проєктів" },
  bronze_saved_search: { en: "First saved search", uk: "Перший збережений пошук" },
  first_application: { en: "First meaningful application", uk: "Перша змістовна заявка" },
  first_response: { en: "First application response", uk: "Перша відповідь на заявку" },
  first_team_charter: { en: "First team charter", uk: "Перший team charter" },
};
const noUnlockedAchievements: string[] = [];

export function AchievementCelebration() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const uk = pathname.split("/")[1] === "uk";
  const query = useQuery({
    queryKey: queryKeys.onboarding.progress(),
    queryFn: onboardingService.progress,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchInterval: isAuthenticated ? 60_000 : false,
  });
  const unlocked = query.data?.newlyUnlocked ?? noUnlockedAchievements;

  useEffect(() => {
    if (!unlocked.length) return;
    const timer = window.setTimeout(() => void query.refetch(), 6_000);
    return () => window.clearTimeout(timer);
  }, [query, unlocked]);

  if (!isAuthenticated || !unlocked.length) return null;

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
        <div>
          <p className="font-semibold">{uk ? "Досягнення відкрито" : "Achievement unlocked"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {unlocked
              .map((code) => labels[code]?.[uk ? "uk" : "en"] ?? code.replaceAll("_", " "))
              .join(", ")}
          </p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 origin-left animate-pulse bg-linear-to-r from-warning to-primary" />
    </aside>
  );
}
