import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { LoginHeroPanel } from "@/components/auth/login-hero-panel";
import { BrandMark } from "@/components/brand/logo";
import { getMessages, isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ returnUrl?: string }>;
}>;

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

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    notFound();
  }

  const locale = raw as Locale;
  const t = getMessages(locale);
  const L = t.authLogin;
  const prefix = `/${locale}`;
  const requestedReturnUrl = (await searchParams)?.returnUrl;
  const returnUrl =
    requestedReturnUrl &&
    (requestedReturnUrl === prefix || requestedReturnUrl.startsWith(`${prefix}/`))
      ? requestedReturnUrl
      : undefined;
  const backHomeText = L.backHome.replace(/^←\s*/, "");

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
    noAccount: L.noAccount,
    signUpCta: L.signUpCta,
    submitting: L.submitting,
    invalidCredentials: L.invalidCredentials,
    genericError: L.genericError,
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden lg:flex lg:items-center lg:justify-center lg:p-3">
      {/* Base + two restrained brand washes (blue / cyan) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-background" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_12%_72%,rgb(8_145_178/0.14),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_88%_38%,rgb(37_99_235/0.12),transparent_55%)]"
      />

      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden lg:mx-auto lg:h-[calc(100dvh-1.5rem)] lg:max-h-[calc(100dvh-1.5rem)] lg:min-h-0 lg:max-w-[1100px] lg:flex-row lg:rounded-2xl lg:border lg:border-border lg:bg-surface/70 lg:shadow-[0_26px_64px_-30px_rgb(15_23_42/0.45)] lg:backdrop-blur-xl">
        <LoginHeroPanel
          line1={L.panelLine1}
          line2={L.panelLine2}
          illustrationAlt={L.illustrationAlt}
          heroChipLive={L.heroChipLive}
          heroChipMatched={L.heroChipMatched}
        />

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface/90 backdrop-blur-md">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[18%] bottom-[-22%] h-[68%] w-[72%] rounded-full bg-secondary/12 blur-[110px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-8%] top-[12%] h-[48%] w-[52%] rounded-full bg-primary/10 blur-[100px]"
          />

          <header className="relative z-[1] flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5 sm:px-5 lg:px-8">
            <Link
              href={withLocale(locale, "/")}
              className="flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
            >
              <BrandMark className="size-8" rounded="rounded-xl" />
              <span className="hidden sm:inline">{t.nav.brandWordmark}</span>
            </Link>
            <Link
              href={withLocale(locale, "/")}
              className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-[color,transform,background-color] hover:-translate-x-0.5 hover:bg-muted hover:text-primary-text"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              {backHomeText}
            </Link>
          </header>

          <main className="relative z-[1] flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-5 sm:px-5 sm:py-6 lg:min-h-0 lg:px-10 lg:py-8">
            <div className="mx-auto w-full max-w-[400px]">
              <h1 className="login-fade-up bg-linear-to-r from-foreground via-foreground to-secondary bg-clip-text font-[family-name:var(--font-login-display)] text-[clamp(2.15rem,4.2vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-transparent">
                {L.title}
              </h1>

              <div className="login-fade-up-delayed mt-8">
                <LoginForm
                  labels={formLabels}
                  localePrefix={prefix}
                  compact
                  returnUrl={returnUrl}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
