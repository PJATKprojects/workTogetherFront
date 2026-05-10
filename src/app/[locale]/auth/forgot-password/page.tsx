import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMessages, isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

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
  const F = getMessages(locale).authForgot;

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {F.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{F.hint}</p>
        <Link
          href={withLocale(locale, "/auth/login")}
          className="mt-6 inline-flex text-sm font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
        >
          {F.backToLogin}
        </Link>
      </div>
    </div>
  );
}
