"use client";

import Link from "next/link";

import { usePrivacyConsent } from "@/hooks/use-privacy-consent";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { savePrivacyConsent } from "@/lib/privacy-consent";

export function PrivacyConsentBanner({ locale }: Readonly<{ locale: Locale }>) {
  const choice = usePrivacyConsent();
  const labels = getLabels(locale);

  if (choice !== null) return null;

  const choose = (analytics: boolean) => {
    savePrivacyConsent(analytics);
  };

  return (
    <aside
      aria-label={labels.title}
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-4xl rounded-3xl border border-border bg-surface/95 p-4 shadow-[0_20px_70px_rgb(15_23_42/0.28)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-text"
            >
              <ShieldIcon />
            </span>
            <h2 className="text-base font-semibold">{labels.title}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{labels.description}</p>
          <Link
            href={withLocale(locale, "/cookies")}
            className="focus-ring mt-2 inline-flex rounded-md text-sm font-semibold text-primary-text hover:underline"
          >
            {labels.details}
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[330px]">
          <button
            type="button"
            onClick={() => choose(false)}
            className="focus-ring min-h-11 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-muted"
          >
            {labels.necessaryOnly}
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="focus-ring min-h-11 rounded-xl bg-linear-to-r from-primary to-secondary px-4 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            {labels.allowAnalytics}
          </button>
        </div>
      </div>
    </aside>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-4" />
    </svg>
  );
}

function getLabels(locale: Locale) {
  const t = (en: string, uk: string, pl: string) => localText(locale, en, uk, pl);
  return {
    title: t("Your privacy choices", "Ваш вибір конфіденційності", "Twój wybór prywatności"),
    description: t(
      "Necessary storage keeps login and language working. With your permission, we also count anonymous visits by device type, operating system and browser. We do not store an IP address, raw user agent or account ID for these statistics.",
      "Необхідне сховище забезпечує вхід і вибір мови. З вашого дозволу ми також рахуємо анонімні відвідування за типом пристрою, операційною системою та браузером. Для цієї статистики ми не зберігаємо IP-адресу, повний user agent чи ID акаунта.",
      "Niezbędna pamięć obsługuje logowanie i język. Za Twoją zgodą liczymy też anonimowe wizyty według typu urządzenia, systemu i przeglądarki. W tych statystykach nie zapisujemy adresu IP, pełnego user agenta ani ID konta."
    ),
    details: t("See exactly what we use", "Переглянути точний перелік", "Zobacz dokładny zakres"),
    necessaryOnly: t("Necessary only", "Лише необхідне", "Tylko niezbędne"),
    allowAnalytics: t(
      "Allow anonymous analytics",
      "Дозволити анонімну аналітику",
      "Zezwól na anonimową analitykę"
    ),
  };
}
