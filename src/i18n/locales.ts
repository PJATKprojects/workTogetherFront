export const locales = ["en", "uk"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Set by middleware when the user visits a localized path (same idea as persisting theme). */
export const localeCookieName = "wt_locale";

export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
