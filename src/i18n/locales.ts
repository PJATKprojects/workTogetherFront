export const locales = ["en", "uk", "pl"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Set by middleware when the user visits a localized path (same idea as persisting theme). */
export const localeCookieName = "wt_locale";

export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Small typed helper for copy that lives next to a feature component. */
export function localized<T>(locale: Locale, values: Readonly<Record<Locale, T>>): T {
  return values[locale];
}

export function localText(locale: Locale, en: string, uk: string, pl: string): string {
  return localized(locale, { en, uk, pl });
}
