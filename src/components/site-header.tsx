import Link from "next/link";

import { NavbarLocaleMenu } from "@/components/navbar-locale-menu";
import { NavbarThemeToggle } from "@/components/navbar-theme-toggle";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";

type Props = Readonly<{
  locale: Locale;
  nav: SiteMessages["nav"];
}>;

export function SiteHeader({ locale, nav }: Props) {
  const localeLabels = {
    menuButtonAria: nav.localeMenuButtonAria,
    localeEnglishAria: nav.localeEnglishAria,
    localeUkrainianAria: nav.localeUkrainianAria,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/75 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/75">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-6 sm:px-6">
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 md:flex-none md:gap-8">
          <Link
            href={withLocale(locale, "/")}
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm shadow-indigo-500/25">
              WT
            </span>
            <span className="hidden sm:inline">{nav.brandWordmark}</span>
          </Link>
          <Link
            href={withLocale(locale, "/projects")}
            className="truncate text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 md:hidden"
          >
            {nav.projects}
          </Link>
        </div>

        <nav className="pointer-events-none absolute left-1/2 top-1/2 z-[5] hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-400">
          <Link
            href={withLocale(locale, "/projects")}
            className="pointer-events-auto transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {nav.projects}
          </Link>
          <Link
            href={withLocale(locale, "/how-it-works")}
            className="pointer-events-auto transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {nav.howItWorks}
          </Link>
        </nav>

        <div className="relative z-10 flex shrink-0 flex-nowrap items-center gap-2 sm:gap-3">
          <Link
            href={withLocale(locale, "/auth/login")}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white sm:inline-flex"
          >
            {nav.login}
          </Link>
          <Link
            href={withLocale(locale, "/auth/register")}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {nav.signUp}
          </Link>

          <NavbarLocaleMenu locale={locale} labels={localeLabels} />

          <NavbarThemeToggle ariaLabel={nav.themeToggleAria} />
        </div>
      </div>
    </header>
  );
}
