import { notFound } from "next/navigation";

import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackLink } from "@/components/ui/back-link";
import { getMessages, isLocale } from "@/i18n/config";

export default async function ProjectPage({
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <BackLink href={`/${raw}/projects`} label={t.common.back} />
        <ProjectDetailView projectId={projectId} locale={raw} messages={t} />
      </main>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
