import { Badge } from "@/components/ui/badge";
import { localizeRole } from "@/i18n/lookups";
import { positionLevelLabel, projectCopy } from "@/i18n/project-copy";
import type { Locale } from "@/i18n/locales";
import type { SiteMessages } from "@/messages/types";
import type { ProjectPosition } from "@/types";

import { ApplyButton } from "./apply-button";

export function PositionCard({
  position,
  projectId,
  locale,
  labels,
  errors,
  ownerActions,
  recruitmentClosed = false,
}: Readonly<{
  position: ProjectPosition;
  projectId: number;
  locale: Locale;
  labels: SiteMessages["projects"];
  errors: SiteMessages["errors"];
  ownerActions?: React.ReactNode;
  recruitmentClosed?: boolean;
}>) {
  const exact = projectCopy(locale);
  const closed = position.isFilled || recruitmentClosed;

  return (
    <article className="rounded-2xl border border-border bg-surface/80 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{localizeRole(position.role, locale)}</h3>
            <Badge tone={closed ? "neutral" : "green"}>
              {closed ? labels.closedStatus : labels.openStatus}
            </Badge>
            <Badge tone="blue">{positionLevelLabel(locale, position.level)}</Badge>
            {position.freshnessReviewRequiredAt ? (
              <Badge tone="yellow">
                {locale === "uk"
                  ? "Роль потребує перевірки"
                  : locale === "pl"
                    ? "Rola wymaga przeglądu"
                    : "Role needs review"}
              </Badge>
            ) : null}
          </div>

          <section className="mt-4" aria-label={exact.tasks}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {exact.tasks}
            </h4>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
              {position.tasks}
            </p>
          </section>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SkillList
              title={exact.mustHaveShort}
              technologies={position.mustHave}
              emptyLabel="—"
            />
            <SkillList
              title={exact.niceToHaveShort}
              technologies={position.niceToHave}
              emptyLabel={exact.optional}
            />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {position.applicationsCount} {labels.applicationsCount}
          </p>
        </div>

        {ownerActions ??
          (!closed ? (
            <ApplyButton
              projectId={projectId}
              positionId={position.id}
              locale={locale}
              labels={labels}
              errors={errors}
              alreadyApplied={position.hasApplied}
            />
          ) : null)}
      </div>
    </article>
  );
}

function SkillList({
  title,
  technologies,
  emptyLabel,
}: Readonly<{
  title: string;
  technologies: ProjectPosition["mustHave"];
  emptyLabel: string;
}>) {
  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="mt-2 flex flex-wrap gap-2">
        {technologies.length ? (
          technologies.map((technology) => (
            <span
              key={technology.id}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {technology.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">{emptyLabel}</span>
        )}
      </div>
    </section>
  );
}
