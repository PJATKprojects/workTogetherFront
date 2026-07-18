"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";

import { ChatLauncher } from "@/components/chat/chat-launcher";
import { ReportDialog } from "@/components/moderation/report-dialog";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useProjectQuery } from "@/hooks/use-projects-query";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import {
  projectCopy,
  projectFormatLabel,
  projectHealthLabel,
  projectStageLabel,
} from "@/i18n/project-copy";
import { getApiError, getApiStatus } from "@/lib/api-error";
import { formatDate, formatDateTime } from "@/lib/format";
import { projectHealthTone } from "@/lib/project-quality";
import { queryKeys } from "@/lib/query/keys";
import type { SiteMessages } from "@/messages/types";

import { PositionCard } from "./position-card";
import { ProjectOwnerControls } from "./project-owner-controls";
import { ProjectQualityPanel } from "./project-quality-panel";
import { ProjectDraftReviewPanel } from "./project-draft-review-panel";

const detailCopy = {
  en: {
    team: "Team workspace",
    teamAndApplications: "Team and applications",
    members: "members",
    applications: "applications",
    averageResponse: "Average response",
    noResponseData: "No data yet",
    externalLink: "Open repository or demo",
  },
  uk: {
    team: "Командний простір",
    teamAndApplications: "Команда та заявки",
    members: "учасників",
    applications: "заявок",
    averageResponse: "Середня відповідь",
    noResponseData: "Даних ще немає",
    externalLink: "Відкрити репозиторій або demo",
  },
  pl: {
    team: "Przestrzeń zespołu",
    teamAndApplications: "Zespół i zgłoszenia",
    members: "osób",
    applications: "zgłoszeń",
    averageResponse: "Średni czas odpowiedzi",
    noResponseData: "Brak danych",
    externalLink: "Otwórz repozytorium lub demo",
  },
} as const;

export function ProjectDetailView({
  projectId,
  locale,
  messages,
}: Readonly<{ projectId: number; locale: Locale; messages: SiteMessages }>) {
  const query = useProjectQuery(projectId);
  const queryClient = useQueryClient();
  const labels = messages.projects;
  const exact = projectCopy(locale);
  const local = detailCopy[locale];

  useEffect(() => {
    if (!query.data) return;
    void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
  }, [query.data, queryClient]);

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
            <div className="flex flex-wrap gap-2">
              <Badge tone={projectHealthTone(project.healthStatus)}>
                {projectHealthLabel(locale, project.healthStatus)}
              </Badge>
              <Badge tone="neutral">{projectStageLabel(locale, project.stage)}</Badge>
              <Badge tone="neutral">{projectFormatLabel(locale, project.format)}</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {project.projectName}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {labels.by} {project.owner.userName} · {labels.created}{" "}
              {formatDate(project.createdAt, locale)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {labels.health.lastActivity}: {formatDate(project.lastActivityAt, locale)}
            </p>
          </div>

          {project.isOwner ? (
            <div className="grid justify-items-end gap-2">
              <div className="flex flex-wrap justify-end gap-2">
                <Link
                  className="focus-ring rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  href={withLocale(locale, `/projects/${project.id}/edit`)}
                >
                  {labels.editProject}
                </Link>
                <Link
                  className="focus-ring rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  href={withLocale(locale, `/projects/${project.id}/team`)}
                >
                  {local.team}
                </Link>
                <Link
                  className="focus-ring rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary-hover"
                  href={withLocale(locale, `/projects/${project.id}/applications`)}
                >
                  {labels.reviewApplications}
                </Link>
              </div>
              <ProjectOwnerControls project={project} locale={locale} messages={messages} />
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              {project.isMember ? (
                <Link
                  className="focus-ring rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  href={withLocale(locale, `/projects/${project.id}/team`)}
                >
                  {local.team}
                </Link>
              ) : null}
              <ChatLauncher
                recipientUserId={project.owner.id}
                recipientName={project.owner.userName}
                contextType="project"
                contextId={project.id}
                locale={locale}
                labels={messages.chat}
                variant="primary"
              />
              <ReportDialog targetType="project" targetId={project.id} locale={locale} />
            </div>
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

        {project.isOwner && project.freshnessReviewRequiredAt ? (
          <div
            role="status"
            className="mt-5 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm leading-6 text-warning-soft-foreground"
          >
            <p className="font-semibold">{exact.freshnessTitle}</p>
            <p className="mt-1">{exact.freshnessBody}</p>
          </div>
        ) : null}

        {!project.isOwner && (project.changesSinceLastVisit ?? []).length ? (
          <section
            aria-labelledby="project-changes-title"
            className="mt-5 rounded-2xl border border-info/30 bg-info-soft p-5 text-info-soft-foreground"
          >
            <h2 id="project-changes-title" className="font-semibold">
              {localText(
                locale,
                "What changed since your last visit",
                "Що змінилося з вашого останнього візиту",
                "Co zmieniło się od ostatniej wizyty"
              )}
            </h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {(project.changesSinceLastVisit ?? []).map((change, index) => (
                <li
                  key={`${change.createdAt}-${change.field}-${index}`}
                  className="rounded-xl bg-surface/70 p-3"
                >
                  <span className="font-semibold">
                    {projectChangeLabel(locale, change.type, change.field)}
                  </span>
                  {change.oldValue !== change.newValue && (change.oldValue || change.newValue) ? (
                    <span className="ml-2 text-muted-foreground">
                      {change.oldValue || "—"} → {change.newValue || "—"}
                    </span>
                  ) : null}
                  <time
                    dateTime={change.createdAt}
                    className="ml-2 whitespace-nowrap text-xs text-muted-foreground"
                  >
                    {formatDateTime(change.createdAt, locale)}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {project.isOwner ? (
          <div className="mt-6 grid gap-4">
            <ProjectQualityPanel
              score={project.qualityScore ?? 0}
              suggestions={project.qualitySuggestions}
              labels={labels.quality}
            />
            <ProjectDraftReviewPanel projectId={project.id} locale={locale} />
          </div>
        ) : null}

        <div className="mt-8 grid gap-6">
          <ProjectText label={exact.problem} value={project.problem} />
          <ProjectText label={exact.expectedOutcome} value={project.expectedOutcome} />
        </div>

        <dl className="mt-8 grid gap-3 rounded-2xl border border-border bg-surface-muted p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <ProjectFact label={exact.duration} value={project.duration} />
          <ProjectFact
            label={exact.hoursPerWeek}
            value={project.hoursPerWeek ? String(project.hoursPerWeek) : exact.optional}
          />
          <ProjectFact label={exact.timeZone} value={project.timeZone} />
          <ProjectFact label={exact.teamLanguages} value={project.teamLanguages.join(", ")} />
          <ProjectFact
            label={local.teamAndApplications}
            value={`${project.teamMemberCount} ${local.members} · ${project.applicationsCount} ${local.applications}`}
          />
          <ProjectFact
            label={local.averageResponse}
            value={
              project.averageResponseHours === null
                ? local.noResponseData
                : `${project.averageResponseHours} h`
            }
          />
        </dl>

        {project.projectLink ? (
          <a
            href={project.projectLink}
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-5 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold text-primary-text transition hover:bg-muted"
          >
            {local.externalLink}
          </a>
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

function ProjectText({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h2>
      <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-foreground/85">{value}</p>
    </section>
  );
}

function ProjectFact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function projectChangeLabel(locale: Locale, type: string, field: string) {
  if (type === "team") {
    return localText(
      locale,
      "Team composition changed",
      "Склад команди змінився",
      "Zmienił się skład zespołu"
    );
  }
  if (type === "compensation") {
    return localText(
      locale,
      "Compensation changed",
      "Умови винагороди змінилися",
      "Zmieniły się warunki wynagrodzenia"
    );
  }
  if (type === "role") {
    return localText(
      locale,
      "An open role changed",
      "Відкрита роль змінилася",
      "Zmieniła się otwarta rola"
    );
  }
  const labels: Record<string, [string, string, string]> = {
    projectName: ["Project name changed", "Назва проєкту змінилася", "Zmieniła się nazwa projektu"],
    stage: ["Stage changed", "Стадія змінилася", "Zmienił się etap"],
    format: ["Format changed", "Формат змінився", "Zmienił się format"],
    duration: ["Duration changed", "Тривалість змінилася", "Zmienił się czas trwania"],
    hoursPerWeek: [
      "Weekly hours changed",
      "Години на тиждень змінилися",
      "Zmieniła się liczba godzin",
    ],
    timeZone: ["Timezone changed", "Часовий пояс змінився", "Zmieniła się strefa czasowa"],
    teamLanguages: [
      "Team languages changed",
      "Мови команди змінилися",
      "Zmieniły się języki zespołu",
    ],
    healthStatus: ["Project health changed", "Стан проєкту змінився", "Zmienił się stan projektu"],
    recruitment: [
      "Recruitment status changed",
      "Статус набору змінився",
      "Zmienił się status rekrutacji",
    ],
    visibility: ["Visibility changed", "Видимість змінилася", "Zmieniła się widoczność"],
    archive: ["Archive status changed", "Статус архіву змінився", "Zmienił się status archiwum"],
  };
  const label = labels[field];
  return label
    ? localText(locale, label[0], label[1], label[2])
    : localText(
        locale,
        "Project terms changed",
        "Умови проєкту змінилися",
        "Zmieniły się warunki projektu"
      );
}
