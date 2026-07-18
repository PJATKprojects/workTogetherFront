import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SafetyCenter } from "@/components/moderation/safety-center";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { localText } from "@/i18n/locales";
export default async function SafetyPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader locale={locale} nav={t.nav} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AuthGuard locale={locale} loadingLabel={t.common.loading}>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6"
          >
            <h1 className="text-3xl font-semibold">
              {localText(locale, "Safety center", "Центр безпеки", "Centrum bezpieczeństwa")}
            </h1>
            <p className="mb-8 mt-2 text-muted-foreground">
              {localText(
                locale,
                "Blocks, reports, sanctions, and a transparent appeal process.",
                "Блокування, скарги, санкції та прозорий процес апеляції.",
                "Blokady, zgłoszenia, sankcje i przejrzysty proces odwoławczy."
              )}
            </p>
            <SafetyCenter locale={locale} />
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
