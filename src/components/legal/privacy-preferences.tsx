"use client";

import { usePrivacyConsent } from "@/hooks/use-privacy-consent";
import { localText, type Locale } from "@/i18n/locales";
import { savePrivacyConsent } from "@/lib/privacy-consent";

export function PrivacyPreferences({ locale }: Readonly<{ locale: Locale }>) {
  const choice = usePrivacyConsent();
  const labels = getLabels(locale);

  const choose = (analytics: boolean) => {
    savePrivacyConsent(analytics);
  };

  return (
    <section
      aria-labelledby="privacy-preferences-title"
      className="mx-auto mb-12 w-full max-w-4xl px-4 sm:px-6"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
          {labels.eyebrow}
        </p>
        <h2 id="privacy-preferences-title" className="mt-2 text-2xl font-semibold">
          {labels.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {labels.description}
        </p>
        <p role="status" aria-live="polite" className="mt-4 text-sm font-semibold">
          {choice === undefined
            ? labels.loading
            : choice?.analytics
              ? labels.analyticsOn
              : choice
                ? labels.analyticsOff
                : labels.noChoice}
        </p>
        <div className="mt-4 grid gap-2 sm:max-w-xl sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choose(false)}
            aria-pressed={choice?.analytics === false}
            className="focus-ring min-h-11 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-muted aria-pressed:border-primary aria-pressed:ring-2 aria-pressed:ring-primary/20"
          >
            {labels.necessaryOnly}
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            aria-pressed={choice?.analytics === true}
            className="focus-ring min-h-11 rounded-xl bg-linear-to-r from-primary to-secondary px-4 text-sm font-semibold text-primary-foreground hover:brightness-110 aria-pressed:ring-2 aria-pressed:ring-primary/30 aria-pressed:ring-offset-2"
          >
            {labels.allowAnalytics}
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{labels.withdrawal}</p>
      </div>
    </section>
  );
}

function getLabels(locale: Locale) {
  const t = (en: string, uk: string, pl: string) => localText(locale, en, uk, pl);
  return {
    eyebrow: t("Privacy control", "Керування приватністю", "Kontrola prywatności"),
    title: t(
      "Optional analytics preference",
      "Налаштування необов’язкової аналітики",
      "Ustawienie opcjonalnej analityki"
    ),
    description: t(
      "Anonymous device statistics help us decide which screen sizes and browsers deserve the most testing. Core features work the same if you decline.",
      "Анонімна статистика пристроїв допомагає визначити, яким розмірам екрана й браузерам приділяти більше тестування. Основні функції працюють однаково, якщо ви відмовитеся.",
      "Anonimowe statystyki urządzeń pomagają nam ustalić, które rozmiary ekranów i przeglądarki wymagają najwięcej testów. Podstawowe funkcje działają tak samo po odmowie."
    ),
    loading: t("Reading your choice…", "Зчитуємо ваш вибір…", "Odczytywanie wyboru…"),
    analyticsOn: t(
      "Current choice: anonymous analytics allowed.",
      "Поточний вибір: анонімну аналітику дозволено.",
      "Obecny wybór: anonimowa analityka dozwolona."
    ),
    analyticsOff: t(
      "Current choice: necessary storage only.",
      "Поточний вибір: лише необхідне сховище.",
      "Obecny wybór: tylko niezbędna pamięć."
    ),
    noChoice: t(
      "You have not made a choice on this browser yet.",
      "У цьому браузері вибір ще не зроблено.",
      "Nie dokonano jeszcze wyboru w tej przeglądarce."
    ),
    necessaryOnly: t("Necessary only", "Лише необхідне", "Tylko niezbędne"),
    allowAnalytics: t(
      "Allow anonymous analytics",
      "Дозволити анонімну аналітику",
      "Zezwól na anonimową analitykę"
    ),
    withdrawal: t(
      "You can change this choice at any time. Withdrawing stops future analytics visits; already aggregated anonymous events cannot be linked back to you.",
      "Ви можете змінити вибір будь-коли. Відкликання припиняє майбутні аналітичні відвідування; уже агреговані анонімні події неможливо пов’язати з вами.",
      "Możesz zmienić wybór w każdej chwili. Wycofanie zatrzymuje przyszłe wizyty analityczne; już zagregowanych anonimowych zdarzeń nie da się powiązać z Tobą."
    ),
  };
}
