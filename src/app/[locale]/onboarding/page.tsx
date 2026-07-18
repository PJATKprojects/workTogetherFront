import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ProductOnboardingWizard } from "@/components/onboarding/product-onboarding-wizard";
import { isLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/config";

export default async function ProductOnboardingPage({
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
          className="mx-auto flex min-h-[100dvh] w-full max-w-5xl items-center px-4 py-10 sm:px-6"
        >
          <div className="w-full">
            <ProductOnboardingWizard locale={locale} />
          </div>
        </main>
      </AuthGuard>
    </Suspense>
  );
}
