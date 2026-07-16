import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ProjectEditView } from "@/components/projects/project-edit-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackLink } from "@/components/ui/back-link";
import { getMessages, isLocale } from "@/i18n/config";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const projectId = Number(id);
  if (!isLocale(raw) || !Number.isInteger(projectId) || projectId < 1) notFound();
  const t = getMessages(raw);
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={raw} nav={t.nav} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AuthGuard locale={raw} loadingLabel={t.common.loading}>
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
            <BackLink href={`/${raw}/projects/${projectId}`} label={t.common.back} />
            <h1 className="text-3xl font-semibold">{t.projects.editTitle}</h1>
            <p className="mt-2 mb-7 text-muted-foreground">{t.projects.editSubtitle}</p>
            <ProjectEditView projectId={projectId} locale={raw} messages={t} />
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
