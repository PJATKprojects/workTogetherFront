import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getMessages, isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    return { title: "Create account — WorkTogether" };
  }
  const t = getMessages(raw);
  return {
    title: t.authRegister.metaTitle,
    description: t.authRegister.metaDescription,
  };
}

export default async function RegisterPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }

  const locale = raw as Locale;
  const t = getMessages(locale);
  const R = t.authRegister;
  const prefix = `/${locale}`;

  const labels = {
    backHome: R.backHome,
    title: R.title,
    subtitle: R.subtitle,
    nickname: R.fullName,
    nicknamePlaceholder: R.fullNamePlaceholder,
    email: R.email,
    emailPlaceholder: R.emailPlaceholder,
    password: R.password,
    passwordPlaceholder: R.passwordPlaceholder,
    confirmPassword: R.confirmPassword,
    confirmPasswordPlaceholder: R.confirmPasswordPlaceholder,
    termsPrefix: R.termsPrefix,
    terms: R.terms,
    and: R.and,
    privacy: R.privacy,
    submit: R.submit,
    submitting: R.submitting,
    success: R.success,
    divider: R.divider,
    google: R.google,
    github: R.github,
    haveAccount: R.haveAccount,
    signIn: R.signIn,
    pwdWeak: R.pwdWeak,
    pwdFair: R.pwdFair,
    pwdGood: R.pwdGood,
    pwdStrong: R.pwdStrong,
    errNickname: R.errName,
    errEmail: R.errEmail,
    errPassword: R.errPassword,
    errConfirm: R.errConfirm,
    genericError: R.genericError,
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden text-foreground">
      <div className="relative flex min-h-[100dvh] w-full xl:grid xl:grid-cols-[minmax(620px,1.02fr)_minmax(640px,0.98fr)]">
        <section className="relative hidden overflow-hidden xl:flex">
          {/* Decorative rail background fades into the page background on the right,
              so there is no hard vertical seam between the two columns. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,black_55%,transparent_97%)]"
          >
            <div className="absolute inset-0 bg-surface-muted" />
            <div className="absolute -left-28 -top-28 h-[720px] w-[720px] rounded-full bg-[radial-gradient(circle,rgb(37_99_235/0.32),transparent_65%)]" />
            <div className="absolute -bottom-28 -right-20 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgb(8_145_178/0.26),transparent_65%)]" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-[620px] flex-col justify-center px-12 py-14 min-[1800px]:max-w-[760px] min-[1800px]:px-16">
            <Link href={withLocale(locale, "/")} className="inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-[10px] bg-linear-to-r from-primary to-secondary text-base font-bold text-primary-foreground">
                WT
              </span>
              <span className="text-xl font-bold text-foreground">{t.nav.brandWordmark}</span>
            </Link>

            <div className="register-promo-float relative mt-12 w-full max-w-[460px] min-[1800px]:max-w-[560px]">
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                    Team board
                  </p>
                  <span className="rounded-md bg-success-soft px-2.5 py-1 text-[11px] font-bold tracking-[0.05em] text-success-soft-foreground">
                    {R.launchedToday}
                  </span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-surface-muted p-2.5">
                    <p className="text-[11px] font-semibold text-muted-foreground">Todo</p>
                    <div className="mt-2 h-2 w-11/12 rounded bg-border" />
                    <div className="mt-1.5 h-2 w-8/12 rounded bg-border/70" />
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted p-2.5">
                    <p className="text-[11px] font-semibold text-muted-foreground">In progress</p>
                    <div className="mt-2 h-2 w-10/12 rounded bg-primary/50" />
                    <div className="mt-1.5 h-2 w-7/12 rounded bg-primary/35" />
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted p-2.5">
                    <p className="text-[11px] font-semibold text-muted-foreground">Done</p>
                    <div className="mt-2 h-2 w-9/12 rounded bg-success/55" />
                    <div className="mt-1.5 h-2 w-6/12 rounded bg-success/35" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <RoleChip label={R.roleFrontend} color="from-primary to-secondary" />
                  <RoleChip label={R.roleDesign} color="from-secondary to-primary" />
                  <RoleChip label={R.rolePm} color="from-warning to-accent" />
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-[460px] min-[1800px]:max-w-[560px]">
              <h2 className="text-[28px] font-bold leading-tight text-foreground min-[1800px]:text-[34px]">
                {R.valueProp}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckDot />
                  {R.benefitOne}
                </li>
                <li className="flex items-center gap-2">
                  <CheckDot />
                  {R.benefitTwo}
                </li>
                <li className="flex items-center gap-2">
                  <CheckDot />
                  {R.benefitThree}
                </li>
              </ul>
            </div>

            <div className="mt-8 flex max-w-[460px] items-center justify-between gap-4 rounded-xl border border-border bg-surface/70 px-4 py-3 min-[1800px]:max-w-[560px]">
              <div className="flex items-center">
                <span className="z-[3] flex size-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-xs font-semibold text-primary-foreground ring-2 ring-surface">
                  A
                </span>
                <span className="-ml-2 z-[2] flex size-10 items-center justify-center rounded-full bg-linear-to-br from-secondary to-primary text-xs font-semibold text-primary-foreground ring-2 ring-surface">
                  B
                </span>
                <span className="-ml-2 z-[1] flex size-10 items-center justify-center rounded-full bg-linear-to-br from-warning to-accent text-xs font-semibold text-primary-foreground ring-2 ring-surface">
                  C
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{R.testimonial}</p>
            </div>
            <div className="mt-4 flex max-w-[460px] items-center gap-2 text-xs text-muted-foreground min-[1800px]:max-w-[560px]">
              <span className="rounded-md border border-border bg-surface/70 px-2 py-1">GDG</span>
              <span className="rounded-md border border-border bg-surface/70 px-2 py-1">
                Kyiv IT
              </span>
              <span className="rounded-md border border-border bg-surface/70 px-2 py-1">
                Product Camp
              </span>
              <span className="rounded-md border border-border bg-surface/70 px-2 py-1">
                Builders UA
              </span>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-[100dvh] w-full items-center justify-center px-3 py-2 sm:px-5 sm:py-3 xl:w-auto xl:px-10">
          <div className="pointer-events-none absolute inset-0 xl:hidden">
            <div className="absolute -left-8 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgb(37_99_235/0.16),transparent_68%)]" />
            <div className="absolute -bottom-16 -right-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(8_145_178/0.12),transparent_70%)]" />
          </div>

          <div className="w-full max-w-[620px] 2xl:max-w-[700px] min-[1800px]:max-w-[780px]">
            <div className="mb-3 flex items-center justify-center gap-3 xl:hidden">
              <span className="flex size-10 items-center justify-center rounded-[10px] bg-linear-to-r from-primary to-secondary text-base font-bold text-primary-foreground">
                WT
              </span>
              <span className="text-xl font-bold text-foreground">{t.nav.brandWordmark}</span>
            </div>
            <RegisterForm labels={labels} localePrefix={prefix} />
          </div>
        </section>
      </div>
    </div>
  );
}

function RoleChip({ label, color }: Readonly<{ label: string; color: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[11px] font-medium text-foreground/75">
      <span className={`size-2 rounded-full bg-linear-to-r ${color}`} />
      {label}
    </span>
  );
}

function CheckDot() {
  return (
    <span className="inline-flex size-4 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
      <svg
        className="size-2.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
      </svg>
    </span>
  );
}
