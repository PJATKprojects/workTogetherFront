import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { MyProjectList } from "@/components/projects/my-project-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackLink } from "@/components/ui/back-link";
import { PlanSummaryCard } from "@/components/billing/plan-summary-card";
import { getMessages, isLocale } from "@/i18n/config";

export default async function MyProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
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
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
          >
            <BackLink href={`/${raw}/profile`} label={t.common.back} />
            <h1 className="mb-8 text-3xl font-semibold">{t.profile.myProjects}</h1>
            <PlanSummaryCard locale={raw} />
            <div className="mt-8">
              <MyProjectList locale={raw} messages={t} />
            </div>
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
