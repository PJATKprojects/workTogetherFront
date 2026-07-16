"use client";

import { OwnerGuard } from "@/components/guards/owner-guard";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useProjectQuery } from "@/hooks/use-projects-query";
import type { Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";

import { ProjectApplicationList } from "./application-list";

export function ProjectApplicationsView({
  projectId,
  locale,
  messages,
}: Readonly<{ projectId: number; locale: Locale; messages: SiteMessages }>) {
  const project = useProjectQuery(projectId);
  if (project.isLoading) return <LoadingSkeleton />;
  if (project.isError || !project.data)
    return (
      <ErrorState
        message={getApiError(project.error, messages.errors.generic).message}
        retryLabel={messages.common.retry}
        onRetry={() => void project.refetch()}
      />
    );
  return (
    <OwnerGuard isOwner={project.data.isOwner} deniedLabel={messages.errors.accessDenied}>
      <ProjectApplicationList
        projectId={projectId}
        locale={locale}
        messages={messages}
        enabled={project.data.isOwner}
      />
    </OwnerGuard>
  );
}
