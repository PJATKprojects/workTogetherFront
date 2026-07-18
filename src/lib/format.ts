import type { Locale } from "@/i18n/locales";

export function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTime(value: string, locale: Locale, timeZone?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function intlLocale(locale: Locale) {
  return locale === "uk" ? "uk-UA" : locale === "pl" ? "pl-PL" : "en-US";
}
