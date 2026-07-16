import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { OAuthCallbackContent } from "@/components/auth/oauth-callback-content";
import { getMessages, isLocale } from "@/i18n/config";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return { title: "Signing you in — WorkTogether" };
  }
  return { title: getMessages(locale).authCallback.metaTitle, robots: { index: false } };
}

export default async function OAuthCallbackPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);

  return (
    // useSearchParams in the client component requires a Suspense boundary.
    <Suspense fallback={null}>
      <OAuthCallbackContent labels={t.authCallback} localePrefix={`/${locale}`} />
    </Suspense>
  );
}
