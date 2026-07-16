"use client";

import { Input } from "@/components/ui/input";
import { TechnologyFilter } from "@/components/ui/technology-filter";
import type { SiteMessages } from "@/messages/types";
import type { UserFilters } from "@/types";

export function StudentFilters({
  filters,
  labels,
  common,
  projects,
  onChange,
}: Readonly<{
  filters: UserFilters;
  labels: SiteMessages["students"];
  common: SiteMessages["common"];
  projects: SiteMessages["projects"];
  onChange: (filters: UserFilters) => void;
}>) {
  const selected = filters.technologyIds ?? [];
  return (
    <div className="rounded-3xl border border-border bg-surface/75 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
        <Input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ ...filters, page: 1, search: event.target.value })}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
        />
        <TechnologyFilter
          selected={selected}
          onChange={(ids) =>
            onChange({ ...filters, page: 1, technologyIds: ids.length ? ids : undefined })
          }
          labels={{
            label: labels.technologies,
            all: projects.all,
            searchPlaceholder: common.search,
            clear: projects.clearFilters,
          }}
        />
      </div>
    </div>
  );
}
