import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";

export default async function NotificationsPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <div className="min-h-full text-foreground">
      <SiteHeader locale={locale} nav={messages.nav} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AuthGuard locale={locale} loadingLabel={messages.common.loading}>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
          >
            <NotificationCenter locale={locale} />
          </main>
        </AuthGuard>
      </Suspense>
    </div>
  );
}
