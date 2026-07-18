import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SkipLink } from "@/components/ui/skip-link";
import { getMessages, isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/locales";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { title: "Reset password — WorkTogether" };
  const labels = getMessages(locale).authReset;
  return { title: labels.metaTitle, description: labels.metaDescription };
}

export default async function ResetPasswordPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getMessages(locale);
  const labels = t.authReset;
  return (
    <>
      <SkipLink label={t.nav.skipToContent} />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-full flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-16"
      >
        <Suspense
          fallback={<div className="h-80 w-full max-w-md animate-pulse rounded-2xl bg-muted" />}
        >
          <ResetPasswordForm locale={locale} labels={labels} />
        </Suspense>
      </main>
    </>
  );
}
