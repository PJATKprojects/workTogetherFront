import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MatchingDashboard } from "@/components/matching/matching-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { localText } from "@/i18n/locales";
export default async function MatchesPage({
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
            className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
          >
            <h1 className="text-3xl font-semibold">
              {localText(
                locale,
                "Explainable matching",
                "Пояснимий matching",
                "Wyjaśnialne dopasowanie"
              )}
            </h1>
            <p className="mb-9 mt-2 max-w-3xl text-muted-foreground">
              {localText(
                locale,
                "Skills are only part of the picture. Availability, timezone overlap, goals, risk, pace, and communication style all remain visible and correctable.",
                "Навички — лише частина картини. Враховуємо доступність, timezone overlap, мету, ризик, темп і стиль комунікації.",
                "Umiejętności są tylko częścią obrazu. Dostępność, wspólne godziny, cele, ryzyko, tempo i styl komunikacji pozostają widoczne i możliwe do poprawienia."
              )}
            </p>
            <MatchingDashboard locale={locale} messages={t} />
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
