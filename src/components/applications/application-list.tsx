"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  useMyApplicationsQuery,
  useProjectApplicationsQuery,
} from "@/hooks/use-applications-query";
import type { Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";

import { ApplicationCard } from "./application-card";

export function MyApplicationList({
  locale,
  messages,
}: Readonly<{ locale: Locale; messages: SiteMessages }>) {
  const [page, setPage] = useState(1);
  const query = useMyApplicationsQuery({ page, pageSize: 12 });
  if (query.isLoading) return <LoadingSkeleton />;
  if (query.isError)
    return (
      <ErrorState
        message={getApiError(query.error, messages.errors.generic).message}
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );
  if (!query.data?.items.length)
    return (
      <EmptyState title={messages.applications.emptyTitle} body={messages.applications.emptyBody} />
    );
  return (
    <>
      <div className="grid gap-4">
        {query.data.items.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            locale={locale}
            messages={messages}
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

export function ProjectApplicationList({
  projectId,
  locale,
  messages,
  enabled,
}: Readonly<{ projectId: number; locale: Locale; messages: SiteMessages; enabled: boolean }>) {
  const [page, setPage] = useState(1);
  const query = useProjectApplicationsQuery(projectId, { page, pageSize: 12 }, enabled);
  if (query.isLoading) return <LoadingSkeleton />;
  if (query.isError)
    return (
      <ErrorState
        message={getApiError(query.error, messages.errors.generic).message}
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );
  if (!query.data?.items.length)
    return (
      <EmptyState title={messages.applications.emptyTitle} body={messages.applications.emptyBody} />
    );

  const groups = Map.groupBy(
    query.data.items,
    (application) => `${application.position.id}:${application.position.role.name}`
  );
  return (
    <>
      <div className="grid gap-8">
        {[...groups.entries()].map(([key, applications]) => (
          <section key={key}>
            <h2 className="mb-3 text-xl font-semibold">{key.split(":").slice(1).join(":")}</h2>
            <div className="grid gap-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  locale={locale}
                  messages={messages}
                  ownerView
                />
              ))}
            </div>
          </section>
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
