import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SkipLink } from "@/components/ui/skip-link";
import { getMessages, isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/locales";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    return { title: "Forgot password — WorkTogether" };
  }

  const t = getMessages(raw);
  return {
    title: t.authForgot.metaTitle,
    description: t.authForgot.metaDescription,
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    notFound();
  }

  const locale = raw as Locale;
  const t = getMessages(locale);
  const F = t.authForgot;

  return (
    <>
      <SkipLink label={t.nav.skipToContent} />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-full flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-16"
      >
        <ForgotPasswordForm locale={locale} labels={F} />
      </main>
    </>
  );
}
