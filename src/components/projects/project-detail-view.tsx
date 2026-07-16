"use client";

import Link from "next/link";

import { ChatLauncher } from "@/components/chat/chat-launcher";
import { RichTextContent } from "@/components/editor/rich-text-content";
import { Badge, statusTone } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useProjectQuery } from "@/hooks/use-projects-query";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError, getApiStatus } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import type { SiteMessages } from "@/messages/types";

import { PositionCard } from "./position-card";
import { ProjectOwnerControls } from "./project-owner-controls";

export function ProjectDetailView({
  projectId,
  locale,
  messages,
}: Readonly<{ projectId: number; locale: Locale; messages: SiteMessages }>) {
  const query = useProjectQuery(projectId);
  const labels = messages.projects;

  if (query.isLoading) return <LoadingSkeleton count={2} />;
  if (query.isError) {
    return (
      <ErrorState
        message={
          getApiStatus(query.error) === 404
            ? messages.errors.notFound
            : getApiError(query.error, messages.errors.generic).message
        }
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!query.data) return null;
  const project = query.data;

  return (
    <article>
      <div className="rounded-3xl border border-border bg-surface/80 p-6 sm:p-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <Badge tone={statusTone(project.status.statusName)}>{project.status.statusName}</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {project.projectName}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {labels.by} {project.owner.userName} · {labels.created}{" "}
              {formatDate(project.createdAt, locale)}
            </p>
          </div>
          {project.isOwner ? (
            <div className="grid justify-items-end gap-2">
              <div className="flex flex-wrap justify-end gap-2">
                <Link
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  href={withLocale(locale, `/projects/${project.id}/edit`)}
                >
                  {labels.editProject}
                </Link>
                <Link
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary-hover"
                  href={withLocale(locale, `/projects/${project.id}/applications`)}
                >
                  {labels.reviewApplications}
                </Link>
              </div>
              <ProjectOwnerControls project={project} locale={locale} messages={messages} />
            </div>
          ) : (
            <ChatLauncher
              recipientUserId={project.owner.id}
              recipientName={project.owner.userName}
              contextType="project"
              contextId={project.id}
              locale={locale}
              labels={messages.chat}
              variant="primary"
            />
          )}
        </div>
        {project.isHidden || project.isRecruitmentClosed ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.isHidden ? <Badge tone="neutral">{labels.hiddenProject}</Badge> : null}
            {project.isRecruitmentClosed ? (
              <Badge tone="neutral">{labels.recruitmentClosed}</Badge>
            ) : null}
          </div>
        ) : null}
        <p className="mt-8 whitespace-pre-wrap text-base leading-7 text-foreground/80">
          {project.description}
        </p>
        {project.fullDescription ? (
          <>
            <hr className="mt-8 border-border" />
            <RichTextContent html={project.fullDescription} className="mt-8" />
          </>
        ) : null}
      </div>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">{labels.positions}</h2>
        <div className="mt-4 grid gap-4">
          {project.positions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              projectId={project.id}
              locale={locale}
              labels={labels}
              errors={messages.errors}
              recruitmentClosed={project.isRecruitmentClosed}
              ownerActions={project.isOwner ? <span /> : undefined}
            />
          ))}
        </div>
      </section>
    </article>
  );
}
