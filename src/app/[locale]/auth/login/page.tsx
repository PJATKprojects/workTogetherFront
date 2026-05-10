import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { LoginHeroPanel } from "@/components/auth/login-hero-panel";
import { getMessages, isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    return { title: "Log in — WorkTogether" };
  }

  const t = getMessages(raw);
  return {
    title: t.authLogin.metaTitle,
    description: t.authLogin.metaDescription,
  };
}

export default async function LoginPage({ params }: Props) {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    notFound();
  }

  const locale = raw as Locale;
  const t = getMessages(locale);
  const L = t.authLogin;
  const prefix = `/${locale}`;

  const formLabels = {
    emailLabel: L.emailLabel,
    emailPlaceholder: L.emailPlaceholder,
    passwordLabel: L.passwordLabel,
    passwordPlaceholder: L.passwordPlaceholder,
    showPassword: L.showPassword,
    hidePassword: L.hidePassword,
    forgotPassword: L.forgotPassword,
    submit: L.submit,
    divider: L.divider,
    google: L.google,
    github: L.github,
    oauthSoon: L.oauthSoon,
    noAccount: L.noAccount,
    signUpCta: L.signUpCta,
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden lg:flex lg:items-center lg:justify-center lg:p-3">
      {/* Base + soft spots — slate/teal forward, indigo as a single restrained wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-zinc-100 via-teal-50/40 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_12%_72%,rgb(45_212_191/0.16),transparent_58%)] dark:bg-[radial-gradient(ellipse_85%_65%_at_12%_72%,rgb(45_212_191/0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_88%_38%,rgb(99_102_241/0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_75%_60%_at_88%_38%,rgb(99_102_241/0.11),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_-10%,rgb(255_255_255/0.85),transparent_50%)] opacity-70 dark:bg-[radial-gradient(ellipse_55%_45%_at_50%_-10%,rgb(148_163_184/0.08),transparent_52%)] dark:opacity-100"
      />

      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden lg:mx-auto lg:min-h-0 lg:h-[calc(100dvh-1.5rem)] lg:max-h-[calc(100dvh-1.5rem)] lg:max-w-[1100px] lg:flex-row lg:rounded-2xl lg:border lg:border-white/15 lg:bg-zinc-950/35 lg:shadow-2xl lg:shadow-zinc-950/45 lg:backdrop-blur-xl dark:lg:border-white/10 dark:lg:bg-zinc-950/45">
        <LoginHeroPanel
          line1={L.panelLine1}
          line2={L.panelLine2}
          illustrationAlt={L.illustrationAlt}
          heroChipLive={L.heroChipLive}
          heroChipMatched={L.heroChipMatched}
          className="lg:border-r lg:border-white/[0.07]"
        />

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-br from-white/96 via-zinc-50/90 to-teal-50/35 backdrop-blur-md dark:from-zinc-950/92 dark:via-zinc-950/88 dark:to-zinc-950/95">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[18%] bottom-[-22%] h-[68%] w-[72%] rounded-full bg-teal-400/14 blur-[110px] dark:bg-teal-400/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-8%] top-[12%] h-[48%] w-[52%] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/8"
          />

          <header className="relative z-[1] flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-3 dark:border-zinc-800/80 lg:px-8">
            <Link
              href={withLocale(locale, "/")}
              className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900 transition-opacity hover:opacity-80 dark:text-white"
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-indigo-600 text-xs font-bold text-white shadow-md shadow-teal-600/20">
                WT
              </span>
              <span className="hidden sm:inline">{t.nav.brandWordmark}</span>
            </Link>
            <Link
              href={withLocale(locale, "/")}
              className="text-sm font-medium text-zinc-600 transition hover:text-teal-700 dark:text-zinc-400 dark:hover:text-teal-400"
            >
              {L.backHome}
            </Link>
          </header>

          <main className="relative z-[1] flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-5 py-6 lg:min-h-0 lg:px-10 lg:py-8">
            <div className="mx-auto w-full max-w-[400px]">
              <h1 className="font-[family-name:var(--font-login-display)] text-[clamp(2.75rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-balance text-zinc-900 dark:text-white">
                {L.title}
              </h1>

              <div className="mt-8">
                <LoginForm labels={formLabels} localePrefix={prefix} compact />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
