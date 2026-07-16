"use client";

import { useProjectStatusesQuery, useRolesQuery } from "@/hooks/use-lookups-query";
import type { SiteMessages } from "@/messages/types";
import type { ProjectFilters as ProjectFilterValues } from "@/types";

import { Button } from "../ui/button";
import { DropdownSelect } from "../ui/dropdown-select";
import { Input } from "../ui/input";
import { TechnologyFilter } from "../ui/technology-filter";

export function ProjectFilters({
  filters,
  labels,
  common,
  onChange,
}: Readonly<{
  filters: ProjectFilterValues;
  labels: SiteMessages["projects"];
  common: SiteMessages["common"];
  onChange: (filters: ProjectFilterValues) => void;
}>) {
  const roles = useRolesQuery();
  const statuses = useProjectStatusesQuery();
  const selectedTechnologies = filters.technologyIds ?? [];

  return (
    <div className="rounded-3xl border border-border bg-surface/75 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ ...filters, page: 1, search: event.target.value })}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          className="lg:col-span-2"
        />
        <DropdownSelect
          value={String(filters.statusId ?? "")}
          onChange={(value) =>
            onChange({ ...filters, page: 1, statusId: value ? Number(value) : undefined })
          }
          ariaLabel={labels.status}
          options={[
            { value: "", label: `${labels.status}: ${labels.all}` },
            ...(statuses.data?.map((status) => ({
              value: String(status.id),
              label: status.statusName,
            })) ?? []),
          ]}
        />
        <DropdownSelect
          value={String(filters.roleId ?? "")}
          onChange={(value) =>
            onChange({ ...filters, page: 1, roleId: value ? Number(value) : undefined })
          }
          ariaLabel={labels.role}
          options={[
            { value: "", label: `${labels.role}: ${labels.all}` },
            ...(roles.data?.map((role) => ({ value: String(role.id), label: role.name })) ?? []),
          ]}
        />
        <DropdownSelect
          value={filters.sort ?? "newest"}
          onChange={(value) => onChange({ ...filters, page: 1, sort: value })}
          ariaLabel={labels.sort}
          options={[
            { value: "newest", label: labels.newest },
            { value: "oldest", label: labels.oldest },
            { value: "name_asc", label: labels.nameAsc },
          ]}
        />
        <label className="flex h-11 items-center gap-2 rounded-xl border border-input px-3 text-sm">
          <input
            type="checkbox"
            checked={filters.hasOpenPositions ?? false}
            onChange={(event) =>
              onChange({ ...filters, page: 1, hasOpenPositions: event.target.checked || undefined })
            }
          />
          {labels.openOnly}
        </label>
        <TechnologyFilter
          selected={selectedTechnologies}
          onChange={(ids) =>
            onChange({ ...filters, page: 1, technologyIds: ids.length ? ids : undefined })
          }
          labels={{
            label: labels.technologies,
            all: labels.all,
            searchPlaceholder: common.search,
            clear: labels.clearFilters,
          }}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChange({ page: 1, pageSize: filters.pageSize ?? 12, sort: "newest" })}
        >
          {labels.clearFilters}
        </Button>
      </div>
    </div>
  );
}
