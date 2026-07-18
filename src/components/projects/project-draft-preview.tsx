import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/locales";
import { localizeRole } from "@/i18n/lookups";
import {
  positionLevelLabel,
  projectCopy,
  projectFormatLabel,
  projectHealthLabel,
  projectStageLabel,
} from "@/i18n/project-copy";
import { projectHealthTone } from "@/lib/project-quality";
import type { SiteMessages } from "@/messages/types";
import type {
  PositionLevel,
  ProjectFormat,
  ProjectHealth,
  ProjectStage,
  Role,
  Technology,
} from "@/types";

type PreviewPosition = Readonly<{
  key: number;
  roleId: number;
  tasks: string;
  mustHaveTechnologyIds: readonly number[];
  niceToHaveTechnologyIds: readonly number[];
  level: PositionLevel;
}>;

export function ProjectDraftPreview({
  locale,
  labels,
  projectName,
  problem,
  expectedOutcome,
  stage,
  format,
  duration,
  hoursPerWeek,
  timeZone,
  teamLanguages,
  projectLink,
  healthStatus,
  positions,
  roles,
  technologies,
}: Readonly<{
  locale: Locale;
  labels: SiteMessages["projects"];
  projectName: string;
  problem: string;
  expectedOutcome: string;
  stage: ProjectStage;
  format: ProjectFormat;
  duration: string;
  hoursPerWeek: number | null;
  timeZone: string;
  teamLanguages: readonly string[];
  projectLink: string;
  healthStatus: ProjectHealth;
  positions: readonly PreviewPosition[];
  roles: readonly Role[];
  technologies: readonly Technology[];
}>) {
  const exact = projectCopy(locale);
  const roleById = new Map(roles.map((role) => [role.id, role]));
  const technologyById = new Map(
    technologies.map((technology) => [technology.id, technology.name])
  );

  return (
    <section
      aria-labelledby="project-preview-title"
      className="rounded-3xl border border-primary/30 bg-primary-soft/35 p-4 sm:p-6"
    >
      <h2 id="project-preview-title" className="text-lg font-semibold">
        {labels.preview.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{exact.previewIntro}</p>

      <article className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-md)]">
        <div className="flex flex-wrap gap-2">
          <Badge tone={projectHealthTone(healthStatus)}>
            {projectHealthLabel(locale, healthStatus)}
          </Badge>
          <Badge tone="neutral">{projectStageLabel(locale, stage)}</Badge>
          <Badge tone="neutral">{projectFormatLabel(locale, format)}</Badge>
        </div>

        <h3 className="mt-4 text-xl font-semibold">
          {projectName.trim() || labels.preview.emptyName}
        </h3>

        <div className="mt-4 grid gap-4">
          <PreviewText
            label={exact.problem}
            value={problem}
            empty={labels.preview.emptyDescription}
          />
          <PreviewText
            label={exact.expectedOutcome}
            value={expectedOutcome}
            empty={labels.preview.emptyDescription}
          />
        </div>

        <dl className="mt-5 grid gap-3 rounded-xl bg-surface-muted p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <PreviewFact label={exact.duration} value={duration || "—"} />
          <PreviewFact
            label={exact.hoursPerWeek}
            value={hoursPerWeek ? String(hoursPerWeek) : exact.optional}
          />
          <PreviewFact label={exact.timeZone} value={timeZone || "—"} />
          <PreviewFact
            label={exact.teamLanguages}
            value={teamLanguages.length ? teamLanguages.join(", ") : "—"}
          />
        </dl>

        {projectLink.trim() ? (
          <p className="mt-4 break-all text-sm">
            <span className="font-semibold">{exact.link}: </span>
            {projectLink}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3">
          {positions.length ? (
            positions.map((position, index) => {
              const role = roleById.get(position.roleId);
              return (
                <section key={position.key} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">
                      {role
                        ? localizeRole(role, locale)
                        : `${labels.preview.openRole} ${positions.length > 1 ? index + 1 : ""}`}
                    </h4>
                    <Badge tone="blue">{positionLevelLabel(locale, position.level)}</Badge>
                  </div>
                  <PreviewText label={exact.tasks} value={position.tasks} empty="—" />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <PreviewSkills
                      label={exact.mustHaveShort}
                      ids={position.mustHaveTechnologyIds}
                      technologyById={technologyById}
                    />
                    <PreviewSkills
                      label={exact.niceToHaveShort}
                      ids={position.niceToHaveTechnologyIds}
                      technologyById={technologyById}
                    />
                  </div>
                </section>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">{exact.noRoles}</p>
          )}
        </div>
      </article>
    </section>
  );
}

function PreviewText({
  label,
  value,
  empty,
}: Readonly<{ label: string; value: string; empty: string }>) {
  return (
    <section className="mt-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h4>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
        {value.trim() || empty}
      </p>
    </section>
  );
}

function PreviewFact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function PreviewSkills({
  label,
  ids,
  technologyById,
}: Readonly<{
  label: string;
  ids: readonly number[];
  technologyById: ReadonlyMap<number, string>;
}>) {
  return (
    <section>
      <h5 className="text-xs font-semibold text-muted-foreground">{label}</h5>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {ids.length ? (
          ids.map((id) => (
            <li
              key={id}
              className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-foreground"
            >
              {technologyById.get(id) ?? `#${id}`}
            </li>
          ))
        ) : (
          <li className="text-xs text-muted-foreground">—</li>
        )}
      </ul>
    </section>
  );
}
