"use client";

import { useState } from "react";

import { OwnerGuard } from "@/components/guards/owner-guard";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useProjectMutations } from "@/hooks/use-project-mutations";
import { useProjectQuery } from "@/hooks/use-projects-query";
import type { Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { CreatePositionDto, ProjectPosition, UpdatePositionDto } from "@/types";

import { PositionCard } from "./position-card";
import { PositionForm } from "./position-form";
import { ProjectForm } from "./project-form";

export function ProjectEditView({
  projectId,
  locale,
  messages,
}: Readonly<{ projectId: number; locale: Locale; messages: SiteMessages }>) {
  const query = useProjectQuery(projectId);
  const mutations = useProjectMutations(projectId);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState("");

  if (query.isLoading) return <LoadingSkeleton count={2} />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message={getApiError(query.error, messages.errors.generic).message}
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );

  const project = query.data;
  const addPosition = async (data: CreatePositionDto | UpdatePositionDto) => {
    await mutations.addPosition.mutateAsync(data as CreatePositionDto);
    setNotice(messages.projects.positionAdded);
    setShowAdd(false);
  };

  return (
    <OwnerGuard isOwner={project.isOwner} deniedLabel={messages.errors.accessDenied}>
      <ProjectForm project={project} locale={locale} messages={messages} />
      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">{messages.projects.positions}</h2>
          <Button type="button" variant="secondary" onClick={() => setShowAdd((value) => !value)}>
            {messages.projects.addPosition}
          </Button>
        </div>
        {notice ? <p className="mt-3 text-sm text-success">{notice}</p> : null}
        {showAdd ? (
          <div className="mt-4">
            <PositionForm
              locale={locale}
              labels={messages.projects}
              common={messages.common}
              errors={messages.errors}
              onSubmit={addPosition}
              onCancel={() => setShowAdd(false)}
            />
          </div>
        ) : null}
        <div className="mt-4 grid gap-4">
          {project.positions.map((position) => (
            <EditablePosition
              key={position.id}
              position={position}
              projectId={project.id}
              locale={locale}
              messages={messages}
              onNotice={setNotice}
            />
          ))}
        </div>
      </section>
    </OwnerGuard>
  );
}

function EditablePosition({
  position,
  projectId,
  locale,
  messages,
  onNotice,
}: Readonly<{
  position: ProjectPosition;
  projectId: number;
  locale: Locale;
  messages: SiteMessages;
  onNotice: (message: string) => void;
}>) {
  const mutations = useProjectMutations(projectId);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = async (data: CreatePositionDto | UpdatePositionDto) => {
    await mutations.updatePosition.mutateAsync({
      positionId: position.id,
      data: data as UpdatePositionDto,
    });
    onNotice(messages.projects.positionUpdated);
    setEditing(false);
  };
  const closeOrReopen = async () => {
    try {
      if (position.isFilled) await mutations.reopenPosition.mutateAsync(position.id);
      else await mutations.closePosition.mutateAsync(position.id);
    } catch (error) {
      onNotice(getApiError(error, messages.errors.generic).message);
    }
  };

  return (
    <div>
      <PositionCard
        position={position}
        projectId={projectId}
        locale={locale}
        labels={messages.projects}
        errors={messages.errors}
        ownerActions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing((value) => !value)}>
              {messages.common.edit}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={mutations.closePosition.isPending || mutations.reopenPosition.isPending}
              onClick={() => void closeOrReopen()}
            >
              {position.isFilled
                ? messages.projects.reopenPosition
                : messages.projects.closePosition}
            </Button>
            <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
              {messages.common.delete}
            </Button>
          </div>
        }
      />
      {editing ? (
        <div className="mt-3">
          <PositionForm
            locale={locale}
            initial={position}
            labels={messages.projects}
            common={messages.common}
            errors={messages.errors}
            onSubmit={update}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmDelete}
        title={messages.projects.confirmDeletePosition}
        confirmLabel={messages.common.delete}
        cancelLabel={messages.common.cancel}
        danger
        pending={mutations.deletePosition.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          void mutations.deletePosition
            .mutateAsync(position.id)
            .then(() => {
              onNotice(messages.projects.positionDeleted);
              setConfirmDelete(false);
            })
            .catch((error) => onNotice(getApiError(error, messages.errors.generic).message))
        }
      />
    </div>
  );
}
