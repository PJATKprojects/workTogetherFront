import { Badge } from "@/components/ui/badge";
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
  return (
    <article className="rounded-2xl border border-border bg-surface/80 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{position.role.name}</h3>
            <Badge tone={position.isFilled || recruitmentClosed ? "neutral" : "green"}>
              {position.isFilled || recruitmentClosed ? labels.closedStatus : labels.openStatus}
            </Badge>
          </div>
          {position.description ? (
            <p className="mt-3 text-sm leading-6 text-foreground/90">{position.description}</p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {position.requirements || labels.requirementsPlaceholder}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {position.technologies.map((technology) => (
              <span
                key={technology.id}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {technology.name}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {position.applicationsCount} {labels.applicationsCount}
          </p>
        </div>
        {ownerActions ??
          (!position.isFilled && !recruitmentClosed ? (
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
