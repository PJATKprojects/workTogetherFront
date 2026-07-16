"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useStudentsQuery } from "@/hooks/use-students-query";
import type { Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { UserFilters } from "@/types";

import { StudentCard } from "./student-card";
import { StudentFilters } from "./student-filters";

export function StudentList({
  messages,
  locale,
}: Readonly<{ messages: SiteMessages; locale: Locale }>) {
  const [filters, setFilters] = useState<UserFilters>({ page: 1, pageSize: 12 });
  const query = useStudentsQuery(filters);
  return (
    <>
      <StudentFilters
        filters={filters}
        labels={messages.students}
        common={messages.common}
        projects={messages.projects}
        onChange={setFilters}
      />
      <div className="mt-7">
        {query.isLoading ? <LoadingSkeleton count={6} /> : null}
        {query.isError ? (
          <ErrorState
            message={getApiError(query.error, messages.errors.generic).message}
            retryLabel={messages.common.retry}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data?.items.length === 0 ? (
          <EmptyState title={messages.students.emptyTitle} body={messages.students.emptyBody} />
        ) : null}
        {query.data?.items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {query.data.items.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                labels={messages.students}
                chatLabels={messages.chat}
                locale={locale}
              />
            ))}
          </div>
        ) : null}
      </div>
      {query.data ? (
        <Pagination
          page={query.data.page}
          totalPages={query.data.totalPages}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          previousLabel={messages.common.previous}
          nextLabel={messages.common.next}
          pageLabel={messages.common.pageOf
            .replace("{page}", String(query.data.page))
            .replace("{total}", String(query.data.totalPages))}
        />
      ) : null}
    </>
  );
}
