import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { MessageCenter } from "@/components/chat/message-center";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";

export default async function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getMessages(raw);

  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={raw} nav={t.nav} />
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <AuthGuard locale={raw} loadingLabel={t.common.loading}>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
          >
            <MessageCenter locale={raw} messages={t} />
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
