"use client";

import { useEffect } from "react";

import type { Locale } from "@/i18n/locales";

/**
 * Keeps `<html lang>` aligned with route locale (root layout cannot read `[locale]` params).
 */
export function LocaleHtmlAttributes({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "uk" ? "uk" : "en";
  }, [locale]);

  return null;
}
