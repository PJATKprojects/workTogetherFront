import { Suspense } from "react";
import { notFound } from "next/navigation";

import { MyApplicationList } from "@/components/applications/application-list";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PlanSummaryCard } from "@/components/billing/plan-summary-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackLink } from "@/components/ui/back-link";
import { getMessages, isLocale } from "@/i18n/config";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getMessages(raw);
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={raw} nav={t.nav} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AuthGuard locale={raw} loadingLabel={t.common.loading}>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
          >
            <BackLink href={`/${raw}/profile`} label={t.common.back} />
            <h1 className="text-3xl font-semibold">{t.applications.title}</h1>
            <p className="mt-2 mb-7 text-muted-foreground">{t.applications.subtitle}</p>
            <PlanSummaryCard locale={raw} />
            <div className="mt-8">
              <MyApplicationList locale={raw} messages={t} />
            </div>
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
