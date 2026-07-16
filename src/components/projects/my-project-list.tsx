"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useMyProjectsQuery } from "@/hooks/use-projects-query";
import type { Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";

import { ProjectCard } from "./project-card";
import { ProjectOwnerControls } from "./project-owner-controls";

export function MyProjectList({
  locale,
  messages,
}: Readonly<{ locale: Locale; messages: SiteMessages }>) {
  const [page, setPage] = useState(1);
  const query = useMyProjectsQuery({ page, pageSize: 12 });
  if (query.isLoading) return <LoadingSkeleton count={6} />;
  if (query.isError)
    return (
      <ErrorState
        message={getApiError(query.error, messages.errors.generic).message}
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );
  if (!query.data?.items.length)
    return <EmptyState title={messages.projects.emptyTitle} body={messages.projects.emptyBody} />;
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {query.data.items.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            locale={locale}
            labels={messages.projects}
            ownerView
            ownerControls={
              <ProjectOwnerControls project={project} locale={locale} messages={messages} compact />
            }
          />
        ))}
      </div>
      <Pagination
        page={query.data.page}
        totalPages={query.data.totalPages}
        onPageChange={setPage}
        previousLabel={messages.common.previous}
        nextLabel={messages.common.next}
        pageLabel={messages.common.pageOf
          .replace("{page}", String(query.data.page))
          .replace("{total}", String(query.data.totalPages))}
      />
    </>
  );
}
