"use client";

import { useQuery } from "@tanstack/react-query";
import { localText, type Locale } from "@/i18n/locales";
import { queryKeys } from "@/lib/query/keys";
import { onboardingService } from "@/services/onboardingService";

export function OnboardingProgress({ locale }: Readonly<{ locale: Locale }>) {
  const query = useQuery({
    queryKey: queryKeys.onboarding.progress(),
    queryFn: onboardingService.progress,
  });
  if (!query.data) return null;
  const progress = query.data;
  const completed =
    progress.profileProgressPercent >= 100 ||
    (progress.steps.length > 0 && progress.steps.every((step) => step.completed));
  if (completed) return null;
  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface/80 p-5">
      {progress.newlyUnlocked.length ? (
        <div
          role="status"
          className="mb-4 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm text-warning-soft-foreground"
        >
          🎉{" "}
          {localText(locale, "Achievement unlocked", "Нове досягнення", "Odblokowano osiągnięcie")}:{" "}
          {progress.newlyUnlocked.map((code) => achievementLabel(code, locale)).join(", ")}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {localText(locale, "First steps", "Перші кроки", "Pierwsze kroki")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {localText(
              locale,
              "Progress only counts information that genuinely improves matching.",
              "Прогрес рахується лише за даними, які реально покращують matching.",
              "Postęp uwzględnia tylko informacje, które rzeczywiście poprawiają dopasowanie."
            )}
          </p>
        </div>
        <span className="text-xl font-semibold">{progress.profileProgressPercent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-linear-to-r from-primary to-secondary"
          style={{ width: `${progress.profileProgressPercent}%` }}
        />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {progress.steps.map((step) => (
          <div
            key={step.code}
            className={`rounded-xl border p-3 text-sm ${step.completed ? "border-success/30 bg-success-soft/50" : "border-border"}`}
          >
            <div className="flex justify-between gap-2">
              <p className="font-semibold">
                {step.completed ? "✓ " : ""}
                {stepLabel(step.code, locale)}
              </p>
              <span className="text-xs text-muted-foreground">
                {step.current}/{step.target}
              </span>
            </div>
            {!step.completed ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {stepImprovement(step.code, locale)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {progress.achievements.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {progress.achievements.map((achievement) => (
            <span
              key={achievement.code}
              className="rounded-full border border-warning/30 bg-warning-soft px-3 py-1 text-xs font-semibold text-warning-soft-foreground"
            >
              🥉 {achievementLabel(achievement.code, locale)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function stepLabel(code: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    intent: {
      en: "Choose your intent",
      uk: "Оберіть свій намір",
      pl: "Wybierz swój zamiar",
    },
    role_skills: {
      en: "Add role and skills",
      uk: "Додайте роль і навички",
      pl: "Dodaj rolę i umiejętności",
    },
    availability: {
      en: "Add availability",
      uk: "Додати доступність",
      pl: "Dodaj dostępność",
    },
    languages_goal: {
      en: "Add languages and goal",
      uk: "Додайте мови й мету",
      pl: "Dodaj języki i cel",
    },
    three_skills: {
      en: "Add 3 skills",
      uk: "Додати 3 навички",
      pl: "Dodaj 3 umiejętności",
    },
    view_projects: {
      en: "View 3 projects",
      uk: "Переглянути 3 проєкти",
      pl: "Zobacz 3 projekty",
    },
    saved_search: {
      en: "Save a search",
      uk: "Зберегти пошук",
      pl: "Zapisz wyszukiwanie",
    },
  };
  return (
    labels[code]?.[locale] ??
    localText(locale, "Complete profile step", "Завершіть крок профілю", "Uzupełnij krok profilu")
  );
}

function stepImprovement(code: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    intent: {
      en: "Choose whether you want to join, find people, or both.",
      uk: "Оберіть: приєднатися, знайти людей або обидва варіанти.",
      pl: "Wybierz: dołączyć, znaleźć ludzi albo jedno i drugie.",
    },
    role_skills: {
      en: "Add one role and at least one real skill with its level.",
      uk: "Додайте одну роль і хоча б одну реальну навичку з рівнем.",
      pl: "Dodaj jedną rolę i co najmniej jedną rzeczywistą umiejętność z poziomem.",
    },
    availability: {
      en: "Add timezone, weekly hours, format, and a start date.",
      uk: "Додайте часовий пояс, години на тиждень, формат і дату початку.",
      pl: "Dodaj strefę czasową, godziny tygodniowo, format i datę rozpoczęcia.",
    },
    languages_goal: {
      en: "Add working languages and your collaboration goal.",
      uk: "Додайте робочі мови й мету співпраці.",
      pl: "Dodaj języki robocze i cel współpracy.",
    },
  };
  return (
    labels[code]?.[locale] ??
    localText(
      locale,
      "Add the missing information when it becomes useful.",
      "Додайте відсутні дані, коли вони стануть корисними.",
      "Dodaj brakujące informacje, gdy będą przydatne."
    )
  );
}

function achievementLabel(code: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    bronze_onboarding: {
      en: "Onboarding complete",
      uk: "Онбординг завершено",
      pl: "Onboarding ukończony",
    },
    bronze_skills: {
      en: "Skills added",
      uk: "Навички додано",
      pl: "Umiejętności dodane",
    },
    bronze_explorer: {
      en: "Project explorer",
      uk: "Дослідник проєктів",
      pl: "Odkrywca projektów",
    },
    bronze_saved_search: {
      en: "Search saved",
      uk: "Пошук збережено",
      pl: "Wyszukiwanie zapisane",
    },
    first_application: {
      en: "First application",
      uk: "Перша заявка",
      pl: "Pierwsze zgłoszenie",
    },
    first_response: {
      en: "First response",
      uk: "Перша відповідь",
      pl: "Pierwsza odpowiedź",
    },
    first_team_charter: {
      en: "First team charter",
      uk: "Перші правила команди",
      pl: "Pierwsza karta zespołu",
    },
  };
  return labels[code]?.[locale] ?? localText(locale, "Milestone", "Важливий крок", "Kamień milowy");
}
