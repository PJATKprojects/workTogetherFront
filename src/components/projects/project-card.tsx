import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import {
  projectCopy,
  projectFormatLabel,
  projectHealthLabel,
  projectStageLabel,
} from "@/i18n/project-copy";
import { formatDate } from "@/lib/format";
import { projectHealthTone } from "@/lib/project-quality";
import type { SiteMessages } from "@/messages/types";
import type { ProjectListItem } from "@/types";
import { proCopy } from "@/i18n/pro-copy";

export function ProjectCard({
  project,
  locale,
  labels,
  ownerView = false,
  ownerControls,
}: Readonly<{
  project: ProjectListItem;
  locale: Locale;
  labels: SiteMessages["projects"];
  ownerView?: boolean;
  ownerControls?: React.ReactNode;
}>) {
  const exact = projectCopy(locale);
  const planText = proCopy(locale);

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-border bg-surface/85 p-5 shadow-[0_18px_45px_-32px_rgb(15_23_42/0.45)] transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_25px_55px_-30px_rgb(37_99_235/0.35)] motion-reduce:transform-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone={projectHealthTone(project.healthStatus)}>
            {projectHealthLabel(locale, project.healthStatus)}
          </Badge>
          <Badge tone="neutral">{projectStageLabel(locale, project.stage)}</Badge>
          <Badge tone="neutral">{projectFormatLabel(locale, project.format)}</Badge>
          {ownerView && project.archivedAt ? <Badge tone="neutral">Archived</Badge> : null}
          {ownerView && project.isHidden ? (
            <Badge tone="neutral">{labels.hiddenProject}</Badge>
          ) : project.isRecruitmentClosed ? (
            <Badge tone="neutral">{labels.recruitmentClosed}</Badge>
          ) : null}
          {ownerView && project.planRestrictionCode === "free_active_project_limit" ? (
            <Badge tone="yellow">{planText.limitedProjectTitle}</Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {ownerView && project.pendingApplicationsCount > 0 ? (
            <span className="flex min-w-6 items-center justify-center rounded-full bg-destructive px-2 py-1 text-[10px] font-bold text-primary-foreground">
              {project.pendingApplicationsCount}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            <span className="sr-only">{labels.health.lastActivity}: </span>
            {formatDate(project.lastActivityAt, locale)}
          </span>
        </div>
      </div>

      <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary-text">
        {project.projectName}
      </h2>

      {ownerView && project.planRestrictionCode === "free_active_project_limit" ? (
        <div className="mt-3 rounded-xl border border-warning/35 bg-warning-soft p-3 text-xs leading-5 text-warning-soft-foreground">
          <p>{planText.limitedProjectBody}</p>
          <Link
            href={withLocale(locale, "/pro")}
            className="mt-2 inline-flex font-semibold underline underline-offset-2"
          >
            {planText.upgrade}
          </Link>
        </div>
      ) : null}

      <section className="mt-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {exact.problem}
        </h3>
        <p className="mt-1 line-clamp-3 text-sm leading-6 text-foreground/85">{project.problem}</p>
      </section>

      <section className="mt-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {exact.expectedOutcome}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {project.expectedOutcome}
        </p>
      </section>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-surface-muted p-3 text-xs">
        <div>
          <dt className="text-muted-foreground">{exact.duration}</dt>
          <dd className="mt-1 font-medium">{project.duration}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{exact.hoursPerWeek}</dt>
          <dd className="mt-1 font-medium">{project.hoursPerWeek ?? exact.optional}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{exact.timeZone}</dt>
          <dd className="mt-1 font-medium">{project.timeZone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{exact.teamLanguages}</dt>
          <dd className="mt-1 font-medium">{project.teamLanguages.join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <div className="text-xs text-muted-foreground">
          <p>
            {project.openPositionsCount} {labels.openPositions}
          </p>
          <p className="mt-1">
            {labels.by} {project.owner.userName}
          </p>
          {ownerView ? (
            <>
              <p className="mt-1 font-semibold text-foreground/80">
                {project.applicationsCount} {labels.applicationsCount}
              </p>
              <p className="mt-1">
                {labels.health.qualityOwnerLabel}: {project.qualityScore ?? 0}/100
              </p>
            </>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {ownerView && project.applicationsCount > 0 ? (
            <Link
              href={withLocale(locale, `/projects/${project.id}/applications`)}
              className="focus-ring relative rounded-xl border border-border px-3.5 py-2 text-xs font-semibold transition hover:bg-muted"
            >
              {labels.reviewApplications}
            </Link>
          ) : null}
          <Link
            href={withLocale(locale, `/projects/${project.id}`)}
            className="focus-ring rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition duration-200 group-hover:bg-primary-hover"
          >
            {labels.details}
          </Link>
        </div>
      </div>

      {ownerControls ? (
        <div className="mt-4 border-t border-border pt-4">{ownerControls}</div>
      ) : null}
    </article>
  );
}
