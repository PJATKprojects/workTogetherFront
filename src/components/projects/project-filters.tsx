"use client";

import { Button } from "@/components/ui/button";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { TechnologyFilter } from "@/components/ui/technology-filter";
import { useRolesQuery } from "@/hooks/use-lookups-query";
import type { Locale } from "@/i18n/locales";
import { localizeRole } from "@/i18n/lookups";
import {
  positionLevelLabel,
  projectFormatLabel,
  projectHealthLabel,
  projectStageLabel,
} from "@/i18n/project-copy";
import type { SiteMessages } from "@/messages/types";
import type {
  PositionLevel,
  ProjectFilters as ProjectFilterValues,
  ProjectFormat,
  ProjectHealth,
  ProjectStage,
} from "@/types";

const copy = {
  en: {
    advanced: "Matching filters",
    skillMode: "Skill matching",
    anySkill: "Any selected skill (OR)",
    allSkills: "All selected skills (AND)",
    level: "Position level",
    format: "Format",
    stage: "Stage",
    health: "Project health",
    maxHours: "Maximum hours per week",
    activeDays: "Active within N days",
    overlap: "Minimum timezone overlap",
    language: "Team language",
    popular: "Popular",
  },
  uk: {
    advanced: "Фільтри відповідності",
    skillMode: "Збіг навичок",
    anySkill: "Будь-яка вибрана навичка (OR)",
    allSkills: "Усі вибрані навички (AND)",
    level: "Рівень позиції",
    format: "Формат",
    stage: "Стадія",
    health: "Стан проєкту",
    maxHours: "Максимум годин на тиждень",
    activeDays: "Активні за N днів",
    overlap: "Мінімальний перетин часових поясів",
    language: "Мова команди",
    popular: "Популярні",
  },
  pl: {
    advanced: "Filtry dopasowania",
    skillMode: "Dopasowanie umiejętności",
    anySkill: "Dowolna wybrana umiejętność (OR)",
    allSkills: "Wszystkie wybrane umiejętności (AND)",
    level: "Poziom stanowiska",
    format: "Format",
    stage: "Etap",
    health: "Stan projektu",
    maxHours: "Maksymalna liczba godzin tygodniowo",
    activeDays: "Aktywny w ciągu N dni",
    overlap: "Minimalne nakładanie stref czasowych",
    language: "Język zespołu",
    popular: "Popularne",
  },
} as const;

const levels: PositionLevel[] = ["any", "beginner", "intermediate", "advanced"];
const formats: ProjectFormat[] = ["remote", "local", "hybrid"];
const stages: ProjectStage[] = ["idea", "prototype", "mvp", "growth"];
const healthStates: ProjectHealth[] = ["active", "slow", "paused", "completed", "abandoned"];

export function ProjectFilters({
  filters,
  labels,
  common,
  locale,
  onChange,
}: Readonly<{
  filters: ProjectFilterValues;
  labels: SiteMessages["projects"];
  common: SiteMessages["common"];
  locale: Locale;
  onChange: (filters: ProjectFilterValues) => void;
}>) {
  const roles = useRolesQuery();
  const local = copy[locale];
  const selectedTechnologies = filters.technologyIds ?? [];

  return (
    <div className="rounded-3xl border border-border bg-surface/75 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input
          value={filters.search ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              page: 1,
              search: event.target.value || undefined,
            })
          }
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          className="lg:col-span-2"
        />
        <DropdownSelect
          value={String(filters.roleId ?? "")}
          onChange={(value) =>
            onChange({
              ...filters,
              page: 1,
              roleId: value ? Number(value) : undefined,
            })
          }
          ariaLabel={labels.role}
          options={[
            { value: "", label: `${labels.role}: ${labels.all}` },
            ...(roles.data?.map((role) => ({
              value: String(role.id),
              label: localizeRole(role, locale),
            })) ?? []),
          ]}
        />
        <DropdownSelect
          value={filters.sort ?? "-createdAt"}
          onChange={(value) => onChange({ ...filters, page: 1, sort: value })}
          ariaLabel={labels.sort}
          options={[
            { value: "-createdAt", label: labels.newest },
            { value: "createdAt", label: labels.oldest },
            { value: "projectName", label: labels.nameAsc },
            { value: "popular", label: local.popular },
          ]}
        />
        <label className="flex h-11 items-center gap-2 rounded-xl border border-input px-3 text-sm">
          <input
            type="checkbox"
            checked={filters.hasOpenPositions ?? false}
            onChange={(event) =>
              onChange({
                ...filters,
                page: 1,
                hasOpenPositions: event.target.checked || undefined,
              })
            }
            className="accent-primary"
          />
          {labels.openOnly}
        </label>
        <TechnologyFilter
          selected={selectedTechnologies}
          onChange={(ids) =>
            onChange({
              ...filters,
              page: 1,
              technologyIds: ids.length ? ids : undefined,
            })
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
          onClick={() =>
            onChange({
              page: 1,
              pageSize: filters.pageSize ?? 12,
              sort: "-createdAt",
            })
          }
        >
          {labels.clearFilters}
        </Button>
      </div>

      <details className="mt-4 rounded-2xl border border-border bg-surface-muted p-3">
        <summary className="cursor-pointer text-sm font-semibold">{local.advanced}</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label={local.skillMode}
            value={filters.skillMode ?? "or"}
            onChange={(value) =>
              onChange({
                ...filters,
                page: 1,
                skillMode: value as "and" | "or",
              })
            }
            options={[
              ["or", local.anySkill],
              ["and", local.allSkills],
            ]}
          />
          <FilterSelect
            label={local.level}
            value={filters.positionLevel ?? ""}
            onChange={(value) =>
              onChange({
                ...filters,
                page: 1,
                positionLevel: (value || undefined) as PositionLevel | undefined,
              })
            }
            options={[
              ["", labels.all],
              ...levels.map(
                (value) => [value, positionLevelLabel(locale, value)] as [string, string]
              ),
            ]}
          />
          <FilterSelect
            label={local.format}
            value={filters.format ?? ""}
            onChange={(value) =>
              onChange({
                ...filters,
                page: 1,
                format: (value || undefined) as ProjectFormat | undefined,
              })
            }
            options={[
              ["", labels.all],
              ...formats.map(
                (value) => [value, projectFormatLabel(locale, value)] as [string, string]
              ),
            ]}
          />
          <FilterSelect
            label={local.stage}
            value={filters.stage ?? ""}
            onChange={(value) =>
              onChange({
                ...filters,
                page: 1,
                stage: (value || undefined) as ProjectStage | undefined,
              })
            }
            options={[
              ["", labels.all],
              ...stages.map(
                (value) => [value, projectStageLabel(locale, value)] as [string, string]
              ),
            ]}
          />
          <FilterSelect
            label={local.health}
            value={filters.healthStatus ?? ""}
            onChange={(value) =>
              onChange({
                ...filters,
                page: 1,
                healthStatus: (value || undefined) as ProjectHealth | undefined,
              })
            }
            options={[
              ["", labels.all],
              ...healthStates.map(
                (value) => [value, projectHealthLabel(locale, value)] as [string, string]
              ),
            ]}
          />
          <NumberFilter
            label={local.maxHours}
            value={filters.maxHoursPerWeek}
            min={1}
            max={80}
            onChange={(value) => onChange({ ...filters, page: 1, maxHoursPerWeek: value })}
          />
          <NumberFilter
            label={local.activeDays}
            value={filters.activeWithinDays}
            min={1}
            max={365}
            onChange={(value) => onChange({ ...filters, page: 1, activeWithinDays: value })}
          />
          <NumberFilter
            label={local.overlap}
            value={filters.minimumOverlapHours}
            min={1}
            max={12}
            onChange={(value) =>
              onChange({
                ...filters,
                page: 1,
                minimumOverlapHours: value,
                utcOffsetMinutes: value === undefined ? undefined : -new Date().getTimezoneOffset(),
              })
            }
          />
          <label className="grid gap-1 text-xs font-semibold">
            {local.language}
            <Input
              value={filters.language ?? ""}
              maxLength={16}
              placeholder={locale}
              onChange={(event) =>
                onChange({
                  ...filters,
                  page: 1,
                  language: event.target.value.trim().toLowerCase() || undefined,
                })
              }
            />
          </label>
        </div>
      </details>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}>) {
  return (
    <label className="grid gap-1 text-xs font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-input bg-surface px-3 text-sm font-normal"
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberFilter({
  label,
  value,
  min,
  max,
  onChange,
}: Readonly<{
  label: string;
  value?: number;
  min: number;
  max: number;
  onChange: (value: number | undefined) => void;
}>) {
  return (
    <label className="grid gap-1 text-xs font-semibold">
      {label}
      <Input
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)}
      />
    </label>
  );
}
