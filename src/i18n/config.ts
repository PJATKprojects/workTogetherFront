import type { SiteMessages } from "@/messages/types";
import type { Locale } from "./locales";
import { en } from "@/messages/en";
import { uk } from "@/messages/uk";

export { defaultLocale, isLocale, locales, type Locale } from "./locales";

const catalogs: Record<Locale, SiteMessages> = {
  en,
  uk,
};

export function getMessages(locale: Locale): SiteMessages {
  return catalogs[locale];
}
