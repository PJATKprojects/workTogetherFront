"use client";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRolesQuery, useTechnologiesQuery } from "@/hooks/use-lookups-query";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { CreatePositionDto, ProjectPosition, UpdatePositionDto } from "@/types";

export function PositionForm({
  labels,
  common,
  errors,
  initial,
  onSubmit,
  onCancel,
}: Readonly<{
  labels: SiteMessages["projects"];
  common: SiteMessages["common"];
  errors: SiteMessages["errors"];
  initial?: ProjectPosition;
  onSubmit: (data: CreatePositionDto | UpdatePositionDto) => Promise<unknown>;
  onCancel?: () => void;
}>) {
  const roles = useRolesQuery();
  const technologies = useTechnologiesQuery();
  const [roleId, setRoleId] = useState(initial?.role.id ?? 0);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");
  const [technologyIds, setTechnologyIds] = useState(
    initial?.technologies.map((item) => item.id) ?? []
  );
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const schema = z.object({
    roleId: initial ? z.number() : z.number().positive(labels.validationRole),
    description: z.string().max(2000, labels.validationRequirements),
    requirements: z.string().max(2000, labels.validationRequirements),
    technologyIds: z.array(z.number()).min(1, labels.validationTechnology),
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const result = schema.safeParse({ roleId, description, requirements, technologyIds });
    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? errors.generic);
      return;
    }
    setPending(true);
    try {
      const payload = initial
        ? {
            description: description.trim() || null,
            requirements: requirements.trim() || null,
            technologyIds,
          }
        : {
            roleId,
            description: description.trim() || null,
            requirements: requirements.trim() || null,
            technologyIds,
          };
      await onSubmit(payload);
      if (!initial) {
        setRoleId(0);
        setDescription("");
        setRequirements("");
        setTechnologyIds([]);
      }
    } catch (error) {
      setMessage(getApiError(error, errors.generic).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-surface-muted/70 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {!initial ? (
          <label className="grid gap-1.5 text-sm font-medium">
            {labels.role}
            <Select
              value={roleId || ""}
              onChange={(event) => setRoleId(Number(event.target.value))}
            >
              <option value="">{labels.selectRole}</option>
              {roles.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </label>
        ) : (
          <div>
            <p className="text-sm font-medium">{labels.role}</p>
            <p className="mt-2 text-sm text-muted-foreground">{initial.role.name}</p>
          </div>
        )}
        <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
          {labels.positionDescription}
          <Textarea
            value={description}
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={labels.positionDescriptionPlaceholder}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
          {labels.requirements}
          <Textarea
            value={requirements}
            maxLength={2000}
            onChange={(event) => setRequirements(event.target.value)}
            placeholder={labels.requirementsPlaceholder}
          />
        </label>
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{labels.technologies}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {technologies.data?.map((technology) => (
              <label
                key={technology.id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${technologyIds.includes(technology.id) ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:border-primary/50"}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={technologyIds.includes(technology.id)}
                  onChange={() =>
                    setTechnologyIds((current) =>
                      current.includes(technology.id)
                        ? current.filter((id) => id !== technology.id)
                        : [...current, technology.id]
                    )
                  }
                />
                {technology.name}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {message ? <p className="mt-3 text-sm text-destructive">{message}</p> : null}
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
