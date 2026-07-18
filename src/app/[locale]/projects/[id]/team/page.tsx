import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeamWorkspace } from "@/components/team/team-workspace";
import { getMessages, isLocale } from "@/i18n/config";
export default async function TeamPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; id: string }> }>) {
  const { locale, id } = await params;
  const projectId = Number(id);
  if (!isLocale(locale) || !Number.isInteger(projectId) || projectId < 1) notFound();
  const t = getMessages(locale);
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader locale={locale} nav={t.nav} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AuthGuard locale={locale} loadingLabel={t.common.loading}>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
          >
            <TeamWorkspace projectId={projectId} locale={locale} />
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
