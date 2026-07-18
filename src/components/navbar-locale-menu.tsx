"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Locale } from "@/i18n/locales";
import { hrefForLocaleFromPathname } from "@/i18n/paths";

export const localeMenuCodes = ["en", "uk", "pl"] as const satisfies readonly Locale[];

export type NavbarLocaleLabels = {
  menuButtonAria: string;
  localeEnglishAria: string;
  localeUkrainianAria: string;
  localePolishAria: string;
};

function localeShort(code: Locale): string {
  switch (code) {
    case "en":
      return "EN";
    case "uk":
      return "UA";
    case "pl":
      return "PL";
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}

function localeOptionAria(code: Locale, labels: NavbarLocaleLabels): string {
  if (code === "en") return labels.localeEnglishAria;
  if (code === "uk") return labels.localeUkrainianAria;
  return labels.localePolishAria;
}

export function NavbarLocaleMenu({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: NavbarLocaleLabels }>) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const items = localeMenuCodes.map((code) => ({
    code,
    short: localeShort(code),
    aria: localeOptionAria(code, labels),
  }));

  const currentShort = localeShort(locale);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={labels.menuButtonAria}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 min-w-[2.75rem] items-center justify-center rounded-full border border-border bg-surface/90 px-3 text-xs font-semibold tracking-wide text-foreground shadow-sm transition-[background-color,transform] duration-200 ease-out hover:bg-muted active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        {currentShort}
      </button>

      <ul
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-1/2 top-full z-[60] mt-1 min-w-full origin-top -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface py-0.5 shadow-md transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1.5 scale-[0.96] opacity-0"
        }`}
      >
        {items.map((item) => (
          <li key={item.code} role="presentation">
            <Link
              role="option"
              aria-label={item.aria}
              aria-selected={locale === item.code}
              tabIndex={open ? 0 : -1}
              href={hrefForLocaleFromPathname(pathname, item.code)}
              onClick={() => close()}
              className={`flex min-h-10 min-w-[3.25rem] items-center justify-center px-3 py-2 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                locale === item.code ? "bg-muted text-foreground" : "text-foreground/80"
              } hover:bg-muted`}
            >
              {item.short}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
