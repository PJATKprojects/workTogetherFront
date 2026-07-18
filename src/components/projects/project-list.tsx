"use client";

import Link from "next/link";
import { useState } from "react";

import { useProjectsQuery } from "@/hooks/use-projects-query";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { ProjectFilters as ProjectFilterValues } from "@/types";

import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { ErrorState } from "../ui/error-state";
import { LoadingSkeleton } from "../ui/loading-skeleton";
import { Pagination } from "../ui/pagination";
import { ProjectCard } from "./project-card";
import { ProjectFilters } from "./project-filters";
import { SavedSearchControls } from "./saved-search-controls";

export function ProjectList({
  locale,
  labels,
  common,
  errors,
  initialSavedSearchId,
}: Readonly<{
  locale: Locale;
  labels: SiteMessages["projects"];
  common: SiteMessages["common"];
  errors: SiteMessages["errors"];
  initialSavedSearchId?: number;
}>) {
  const [filters, setFilters] = useState<ProjectFilterValues>({
    page: 1,
    pageSize: 12,
    sort: "-createdAt",
  });
  const query = useProjectsQuery(filters);

  return (
    <>
      <ProjectFilters
        filters={filters}
        labels={labels}
        common={common}
        locale={locale}
        onChange={setFilters}
      />
      <SavedSearchControls
        locale={locale}
        filters={filters}
        onApply={setFilters}
        initialSavedSearchId={initialSavedSearchId}
      />
      <div className="mt-7">
        {query.isLoading ? <LoadingSkeleton count={6} /> : null}
        {query.isError ? (
          <ErrorState
            message={getApiError(query.error, errors.generic).message}
            retryLabel={common.retry}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data?.items.length === 0 ? (
          <EmptyState
            title={labels.emptyTitle}
            body={labels.emptyBody}
            action={
              <Link href={withLocale(locale, "/projects/new")}>
                <Button type="button">{labels.createProject}</Button>
              </Link>
            }
          />
        ) : null}
        {query.data?.items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {query.data.items.map((project) => (
              <ProjectCard key={project.id} project={project} locale={locale} labels={labels} />
            ))}
          </div>
        ) : null}
      </div>
      {query.data ? (
        <Pagination
          page={query.data.page}
          totalPages={query.data.totalPages}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          previousLabel={common.previous}
          nextLabel={common.next}
          pageLabel={common.pageOf
            .replace("{page}", String(query.data.page))
            .replace("{total}", String(query.data.totalPages))}
        />
      ) : null}
    </>
  );
}
