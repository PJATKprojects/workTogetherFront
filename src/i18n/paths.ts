import type { Locale } from "./locales";
import { isLocale } from "./locales";

/**
 * Internal app path beginning with "/", without locale segment (e.g. "/projects", "/").
 */
export type LocalePath = `/${string}` | "/";

/** Prefix paths with `/[locale]` for Link href and redirects. */
export function withLocale(locale: Locale, path: LocalePath | string): string {
  const normalized = path === "/" || path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized}` as const;
}

/** Same pathname as current route but first segment swapped to `target` (for locale menus). */
export function hrefForLocaleFromPathname(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${target}`;
  if (isLocale(parts[0])) {
    const nextParts = [...parts];
    nextParts[0] = target;
    return `/${nextParts.join("/")}`;
  }
  return `/${target}`;
}
