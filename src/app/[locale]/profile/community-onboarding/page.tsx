import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { CommunityOnboardingForm } from "@/components/profile/community-onboarding-form";
import { getMessages, isLocale } from "@/i18n/config";
import { localText } from "@/i18n/locales";

export default async function CommunityOnboardingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AuthGuard locale={locale} loadingLabel={messages.common.loading}>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-12 sm:px-6"
        >
          <div className="w-full">
            <p className="text-sm font-semibold text-primary-text">WorkTogether safety</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {localText(locale, "One more step", "Ще один крок", "Jeszcze jeden krok")}
            </h1>
            <p className="mb-7 mt-2 text-muted-foreground">
              {localText(
                locale,
                "Confirm the age policy and community rules before participating.",
                "Підтвердьте вікову політику та правила перед участю у спільноті.",
                "Potwierdź zasady dotyczące wieku i społeczności przed rozpoczęciem udziału."
              )}
            </p>
            <CommunityOnboardingForm locale={locale} />
          </div>
        </main>
      </AuthGuard>
    </Suspense>
  );
}
