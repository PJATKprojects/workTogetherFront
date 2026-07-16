"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TechnologyPicker } from "@/components/ui/technology-picker";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStatusesQuery, useRolesQuery } from "@/hooks/use-lookups-query";
import { useProjectMutations } from "@/hooks/use-project-mutations";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { CreatePositionDto, ProjectDetail } from "@/types";

type DraftPosition = CreatePositionDto & { key: number };

// TipTap is heavy — load it only when the form actually renders (client-side).
const RichTextEditor = dynamic(
  () => import("@/components/editor/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-56 animate-pulse rounded-2xl border border-input bg-muted/50" />
    ),
  }
);

export function ProjectForm({
  locale,
  messages,
  project,
}: Readonly<{ locale: Locale; messages: SiteMessages; project?: ProjectDetail }>) {
  const labels = messages.projects;
  const router = useRouter();
  const roles = useRolesQuery();
  const statuses = useProjectStatusesQuery();
  const mutations = useProjectMutations(project?.id);
  const [projectName, setProjectName] = useState(project?.projectName ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [fullDescription, setFullDescription] = useState(project?.fullDescription ?? "");
  const [statusId, setStatusId] = useState(project?.status.id ?? 1);
  const [positions, setPositions] = useState<DraftPosition[]>([
    { key: 1, roleId: 0, description: "", requirements: "", technologyIds: [] },
  ]);
  const [message, setMessage] = useState("");

  const createSchema = z.object({
    projectName: z.string().min(1, labels.validationName).max(120, labels.validationName),
    description: z
      .string()
      .min(1, labels.validationDescription)
      .max(5000, labels.validationDescription),
    positions: z
      .array(
        z.object({
          key: z.number(),
          roleId: z.number().positive(labels.validationRole),
          description: z.string().max(2000, labels.validationRequirements).nullable().optional(),
          requirements: z.string().max(2000, labels.validationRequirements).nullable().optional(),
          technologyIds: z.array(z.number()).min(1, labels.validationTechnology),
        })
      )
      .min(1, labels.validationPosition),
  });
  const updateSchema = z.object({
    projectName: z.string().min(1, labels.validationName).max(120, labels.validationName),
    description: z
      .string()
      .min(1, labels.validationDescription)
      .max(5000, labels.validationDescription),
    statusId: z.number().positive(),
  });

  const updatePosition = (key: number, patch: Partial<DraftPosition>) => {
    setPositions((current) =>
      current.map((position) => (position.key === key ? { ...position, ...patch } : position))
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const normalizedProjectName = projectName.trim();
    const normalizedDescription = description.trim();
    const result = project
      ? updateSchema.safeParse({
          projectName: normalizedProjectName,
          description: normalizedDescription,
          statusId,
        })
      : createSchema.safeParse({
          projectName: normalizedProjectName,
          description: normalizedDescription,
          positions,
        });
    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? messages.errors.generic);
      return;
    }
    try {
      if (project) {
        await mutations.update.mutateAsync({
          projectName: normalizedProjectName,
          description: normalizedDescription,
          fullDescription: fullDescription || null,
          statusId,
        });
        setMessage(labels.updateSuccess);
      } else {
        const created = await mutations.create.mutateAsync({
          projectName: normalizedProjectName,
          description: normalizedDescription,
          fullDescription: fullDescription || null,
          positions: positions.map(({ roleId, description, requirements, technologyIds }) => ({
            roleId,
            description: description?.trim() || null,
            requirements: requirements?.trim() || null,
            technologyIds,
          })),
        });
        router.push(withLocale(locale, `/projects/${created.id}`));
      }
    } catch (error) {
      setMessage(getApiError(error, messages.errors.generic).message);
    }
  };

  const pending = mutations.create.isPending || mutations.update.isPending;

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-surface/80 p-5 sm:p-8">
      <div className="grid gap-5">
        <label className="grid gap-1.5 text-sm font-medium">
          {labels.projectName}
          <Input
            value={projectName}
            maxLength={120}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder={labels.projectNamePlaceholder}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {labels.description}
          <Textarea
            value={description}
            maxLength={5000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={labels.descriptionPlaceholder}
            className="min-h-40"
          />
        </label>
        <div className="grid gap-1.5 text-sm font-medium">
          <span>
            {labels.fullDescription}{" "}
            <span className="font-normal text-muted-foreground">
              ({labels.fullDescriptionHint})
            </span>
          </span>
          <RichTextEditor
            value={fullDescription}
            onChange={setFullDescription}
            placeholder={labels.fullDescriptionPlaceholder}
            labels={labels.editor}
          />
        </div>
        {project ? (
          <label className="grid gap-1.5 text-sm font-medium sm:max-w-xs">
            {labels.status}
            <Select value={statusId} onChange={(event) => setStatusId(Number(event.target.value))}>
              {statuses.data?.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.statusName}
                </option>
              ))}
            </Select>
          </label>
        ) : (
          <fieldset>
            <legend className="text-base font-semibold">{labels.positions}</legend>
            <div className="mt-3 grid gap-4">
              {positions.map((position, index) => (
                <div key={position.key} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">
                      {labels.position} {index + 1}
                    </h3>
                    {positions.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setPositions((current) =>
                            current.filter((item) => item.key !== position.key)
                          )
                        }
                      >
                        {labels.removePosition}
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1.5 text-sm">
                      {labels.role}
                      <Select
                        value={position.roleId || ""}
                        onChange={(event) =>
                          updatePosition(position.key, { roleId: Number(event.target.value) })
                        }
                      >
                        <option value="">{labels.selectRole}</option>
                        {roles.data?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="grid gap-1.5 text-sm md:col-span-2">
                      {labels.positionDescription}
                      <Textarea
                        value={position.description ?? ""}
                        maxLength={2000}
                        onChange={(event) =>
                          updatePosition(position.key, { description: event.target.value })
                        }
                        placeholder={labels.positionDescriptionPlaceholder}
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm md:col-span-2">
                      {labels.requirements}
                      <Textarea
                        value={position.requirements ?? ""}
                        maxLength={2000}
                        onChange={(event) =>
                          updatePosition(position.key, { requirements: event.target.value })
                        }
                        placeholder={labels.requirementsPlaceholder}
                      />
                    </label>
                    <div className="grid gap-1.5 text-sm md:col-span-2">
                      <span>{labels.technologies}</span>
                      <TechnologyPicker
                        selected={position.technologyIds}
                        onChange={(ids) => updatePosition(position.key, { technologyIds: ids })}
                        labels={{
                          placeholder: messages.profile.technologiesSelect,
                          searchPlaceholder: messages.profile.technologiesSearch,
                          addNew: messages.profile.technologiesAdd,
                          adding: messages.profile.technologiesAdding,
                          genericError: messages.errors.generic,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() =>
                setPositions((current) => [
                  ...current,
                  {
                    key: Math.max(0, ...current.map((item) => item.key)) + 1,
                    roleId: 0,
                    description: "",
                    requirements: "",
                    technologyIds: [],
                  },
                ])
              }
            >
              {labels.addPosition}
            </Button>
          </fieldset>
        )}
      </div>
      {message ? (
        <p
          className={`mt-4 text-sm ${message === labels.updateSuccess ? "text-success" : "text-destructive"}`}
        >
          {message}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? messages.common.saving : project ? messages.common.save : labels.createProject}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {messages.common.cancel}
        </Button>
      </div>
    </form>
  );
}
