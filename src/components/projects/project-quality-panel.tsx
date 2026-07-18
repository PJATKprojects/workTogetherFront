import type { SiteMessages } from "@/messages/types";
import type { ProjectQualitySuggestion } from "@/types";

export function ProjectQualityPanel({
  score,
  suggestions,
  labels,
}: Readonly<{
  score: number;
  suggestions: ProjectQualitySuggestion[];
  labels: SiteMessages["projects"]["quality"];
}>) {
  const summary = score >= 80 ? labels.strong : score >= 55 ? labels.improving : labels.needsBasics;
  const barColor = score >= 80 ? "bg-success" : score >= 55 ? "bg-warning" : "bg-primary";

  return (
    <section
      aria-labelledby="project-quality-title"
      className="rounded-2xl border border-border bg-surface-muted/65 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="project-quality-title" className="text-base font-semibold">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
        <p className="rounded-full bg-surface px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
          <span className="sr-only">{labels.scoreLabel}: </span>
          {score}/100
        </p>
      </div>
      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label={labels.scoreLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{labels.guidance}</p>
      {suggestions.length ? (
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="rounded-xl border border-border bg-surface px-3 py-2 leading-5"
            >
              {labels.suggestions[suggestion]}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm font-medium text-success">{labels.allSet}</p>
      )}
    </section>
  );
}
