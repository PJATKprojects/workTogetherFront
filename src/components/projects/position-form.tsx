"use client";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TechnologyPicker } from "@/components/ui/technology-picker";
import { Textarea } from "@/components/ui/textarea";
import { useRolesQuery } from "@/hooks/use-lookups-query";
import type { Locale } from "@/i18n/locales";
import { localizeRole } from "@/i18n/lookups";
import { positionLevelLabel, projectCopy } from "@/i18n/project-copy";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { CreatePositionDto, PositionLevel, ProjectPosition, UpdatePositionDto } from "@/types";

const levels: PositionLevel[] = ["any", "beginner", "intermediate", "advanced"];
type PositionField = "roleId" | "tasks" | "mustHaveTechnologyIds";

export function PositionForm({
  locale,
  labels,
  common,
  errors,
  initial,
  onSubmit,
  onCancel,
}: Readonly<{
  locale: Locale;
  labels: SiteMessages["projects"];
  common: SiteMessages["common"];
  errors: SiteMessages["errors"];
  initial?: ProjectPosition;
  onSubmit: (data: CreatePositionDto | UpdatePositionDto) => Promise<unknown>;
  onCancel?: () => void;
}>) {
  const exact = projectCopy(locale);
  const roles = useRolesQuery();
  const [roleId, setRoleId] = useState(initial?.role.id ?? 0);
  const [tasks, setTasks] = useState(initial?.tasks ?? "");
  const [mustHaveTechnologyIds, setMustHaveTechnologyIds] = useState(
    initial?.mustHave.map((item) => item.id) ?? []
  );
  const [niceToHaveTechnologyIds, setNiceToHaveTechnologyIds] = useState(
    initial?.niceToHave.map((item) => item.id) ?? []
  );
  const [level, setLevel] = useState<PositionLevel>(initial?.level ?? "any");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PositionField, string>>>({});
  const [pending, setPending] = useState(false);

  const schema = z.object({
    roleId: initial ? z.number() : z.number().positive(labels.validationRole),
    tasks: z.string().trim().min(1, exact.required).max(3000, exact.required),
    mustHaveTechnologyIds: z.array(z.number()).min(1, exact.atLeastOneSkill),
    niceToHaveTechnologyIds: z.array(z.number()),
    level: z.enum(["beginner", "intermediate", "advanced", "any"]),
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});
    const result = schema.safeParse({
      roleId,
      tasks,
      mustHaveTechnologyIds,
      niceToHaveTechnologyIds,
      level,
    });
    if (!result.success) {
      const nextErrors: Partial<Record<PositionField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as PositionField | undefined;
        if (
          field &&
          ["roleId", "tasks", "mustHaveTechnologyIds"].includes(field) &&
          !nextErrors[field]
        ) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0] as PositionField | undefined;
      if (firstField) {
        window.requestAnimationFrame(() =>
          document.getElementById(`position-${firstField}`)?.focus()
        );
      }
      return;
    }

    setPending(true);
    try {
      const commonPayload = {
        tasks: tasks.trim(),
        mustHaveTechnologyIds,
        niceToHaveTechnologyIds: niceToHaveTechnologyIds.filter(
          (id) => !mustHaveTechnologyIds.includes(id)
        ),
        level,
      };
      await onSubmit(initial ? commonPayload : { ...commonPayload, roleId });
      if (!initial) {
        setRoleId(0);
        setTasks("");
        setMustHaveTechnologyIds([]);
        setNiceToHaveTechnologyIds([]);
        setLevel("any");
      }
    } catch (error) {
      setMessage(getApiError(error, errors.generic).message);
    } finally {
      setPending(false);
    }
  };

  const pickerLabels = {
    placeholder: labels.selectTechnology,
    searchPlaceholder: labels.searchPlaceholder,
    addNew: "{name}",
    adding: common.saving,
    genericError: errors.generic,
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-surface-muted/70 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {!initial ? (
          <label htmlFor="position-roleId" className="grid gap-1.5 text-sm font-medium">
            {exact.role}
            <Select
              id="position-roleId"
              value={roleId || ""}
              onChange={(event) => {
                setRoleId(Number(event.target.value));
                setFieldErrors((current) => ({ ...current, roleId: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.roleId) || undefined}
              aria-describedby={fieldErrors.roleId ? "position-roleId-error" : undefined}
            >
              <option value="">{exact.selectRole}</option>
              {roles.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {localizeRole(role, locale)}
                </option>
              ))}
            </Select>
            {fieldErrors.roleId ? (
              <span id="position-roleId-error" className="text-sm text-destructive">
                {fieldErrors.roleId}
              </span>
            ) : null}
          </label>
        ) : (
          <div>
            <p className="text-sm font-medium">{exact.role}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {localizeRole(initial.role, locale)}
            </p>
          </div>
        )}

        <label htmlFor="position-level" className="grid gap-1.5 text-sm font-medium">
          {exact.level}
          <Select
            id="position-level"
            value={level}
            onChange={(event) => setLevel(event.target.value as PositionLevel)}
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {positionLevelLabel(locale, item)}
              </option>
            ))}
          </Select>
        </label>

        <label htmlFor="position-tasks" className="grid gap-1.5 text-sm font-medium md:col-span-2">
          {exact.tasks}
          <Textarea
            id="position-tasks"
            value={tasks}
            maxLength={3000}
            onChange={(event) => {
              setTasks(event.target.value);
              setFieldErrors((current) => ({ ...current, tasks: undefined }));
            }}
            placeholder={exact.tasksPlaceholder}
            aria-invalid={Boolean(fieldErrors.tasks) || undefined}
            aria-describedby={fieldErrors.tasks ? "position-tasks-error" : undefined}
          />
          {fieldErrors.tasks ? (
            <span id="position-tasks-error" className="text-sm text-destructive">
              {fieldErrors.tasks}
            </span>
          ) : null}
        </label>

        <div className="grid gap-1.5 text-sm font-medium">
          <label htmlFor="position-mustHaveTechnologyIds">{exact.mustHave}</label>
          <TechnologyPicker
            id="position-mustHaveTechnologyIds"
            selected={mustHaveTechnologyIds}
            onChange={(ids) => {
              setMustHaveTechnologyIds(ids);
              setNiceToHaveTechnologyIds((current) => current.filter((id) => !ids.includes(id)));
              setFieldErrors((current) => ({
                ...current,
                mustHaveTechnologyIds: undefined,
              }));
            }}
            labels={pickerLabels}
            ariaInvalid={Boolean(fieldErrors.mustHaveTechnologyIds)}
            ariaDescribedBy={
              fieldErrors.mustHaveTechnologyIds ? "position-mustHaveTechnologyIds-error" : undefined
            }
          />
          {fieldErrors.mustHaveTechnologyIds ? (
            <span id="position-mustHaveTechnologyIds-error" className="text-sm text-destructive">
              {fieldErrors.mustHaveTechnologyIds}
            </span>
          ) : null}
        </div>

        <div className="grid gap-1.5 text-sm font-medium">
          <label htmlFor="position-niceToHaveTechnologyIds">{exact.niceToHave}</label>
          <TechnologyPicker
            id="position-niceToHaveTechnologyIds"
            selected={niceToHaveTechnologyIds}
            onChange={(ids) =>
              setNiceToHaveTechnologyIds(ids.filter((id) => !mustHaveTechnologyIds.includes(id)))
            }
            labels={pickerLabels}
          />
        </div>
      </div>

      {message ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? common.saving : common.save}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {common.cancel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
