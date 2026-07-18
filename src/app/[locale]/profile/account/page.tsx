import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AccountLifecycle } from "@/components/profile/account-lifecycle";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { localText } from "@/i18n/locales";
export default async function AccountPage({
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
            className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6"
          >
            <h1 className="text-3xl font-semibold">
              {localText(locale, "Data and account", "Дані та акаунт", "Dane i konto")}
            </h1>
            <p className="mb-8 mt-2 text-muted-foreground">
              {localText(
                locale,
                "Export, project transfer, and controlled account deletion.",
                "Експорт, передача проєктів і контрольоване видалення.",
                "Eksport danych, przekazanie projektów i kontrolowane usunięcie konta."
              )}
            </p>
            <AccountLifecycle locale={locale} />
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
