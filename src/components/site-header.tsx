import Link from "next/link";

import { AuthNavActions } from "@/components/auth-nav-actions";
import { BrandMark } from "@/components/brand/logo";
import { NavbarLocaleMenu } from "@/components/navbar-locale-menu";
import { NavbarThemeToggle } from "@/components/navbar-theme-toggle";
import { SkipLink } from "@/components/ui/skip-link";
import { localText, type Locale } from "@/i18n/locales";
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
    localePolishAria: nav.localePolishAria,
  };

  return (
    <header className="glass-nav sticky top-0 z-50">
      <SkipLink label={nav.skipToContent} />
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-5 sm:px-6">
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2 xl:flex-none xl:gap-6">
          <Link
            href={withLocale(locale, "/")}
            aria-label={nav.brandWordmark}
            className="-m-1.5 flex shrink-0 items-center gap-2 p-1.5 font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            <BrandMark className="size-8" rounded="rounded-lg" />
            <span className="hidden sm:inline">{nav.brandWordmark}</span>
          </Link>
          <details className="group relative xl:hidden">
            <summary className="focus-ring flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              {nav.menu}
              <svg
                className="size-4 transition-transform group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <nav className="glass-panel site-menu-panel absolute left-0 top-11 grid min-w-44 gap-1 rounded-2xl p-2">
              <Link
                href={withLocale(locale, "/projects")}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {nav.projects}
              </Link>
              <Link
                href={withLocale(locale, "/students")}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {nav.students}
              </Link>
              <Link
                href={withLocale(locale, "/messages")}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {nav.messages}
              </Link>
              <Link
                href={withLocale(locale, "/how-it-works")}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {nav.howItWorks}
              </Link>
              <Link
                href={withLocale(locale, "/pro")}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-primary-text transition hover:bg-primary-soft"
              >
                {localText(locale, "Pro", "Pro", "Pro")}
              </Link>
            </nav>
          </details>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap text-sm font-medium text-muted-foreground xl:flex">
          <Link
            href={withLocale(locale, "/projects")}
            className="link-underline-anim rounded-lg px-3 py-1.5 transition-colors hover:text-foreground"
          >
            {nav.projects}
          </Link>
          <Link
            href={withLocale(locale, "/students")}
            className="link-underline-anim rounded-lg px-3 py-1.5 transition-colors hover:text-foreground"
          >
            {nav.students}
          </Link>
          <Link
            href={withLocale(locale, "/how-it-works")}
            className="link-underline-anim rounded-lg px-3 py-1.5 transition-colors hover:text-foreground"
          >
            {nav.howItWorks}
          </Link>
          <Link
            href={withLocale(locale, "/pro")}
            className="link-underline-anim rounded-lg px-3 py-1.5 font-semibold text-primary-text transition-colors hover:text-primary"
          >
            Pro
          </Link>
        </nav>

        <div className="relative z-10 flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
          <AuthNavActions locale={locale} nav={nav} />

          <NavbarLocaleMenu locale={locale} labels={localeLabels} />

          <NavbarThemeToggle ariaLabel={nav.themeToggleAria} />
        </div>
      </div>
    </header>
  );
}
