"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  buildProjectTemplates,
  type ProjectTemplateKey,
  type ProjectTemplatePreset,
} from "@/lib/project-quality";
import type { SiteMessages } from "@/messages/types";

export function ProjectTemplatePicker({
  labels,
  onApply,
}: Readonly<{
  labels: SiteMessages["projects"]["templates"];
  onApply: (template: ProjectTemplatePreset) => void;
}>) {
  const templates = useMemo(() => buildProjectTemplates(labels.items), [labels.items]);
  const [selected, setSelected] = useState<ProjectTemplateKey>("studyProject");
  const current = templates.find((template) => template.key === selected) ?? templates[0];

  return (
    <fieldset className="rounded-2xl border border-border bg-surface-muted/45 p-4 sm:p-5">
      <legend className="px-1 text-base font-semibold">{labels.title}</legend>
      <p className="mt-1 text-sm text-muted-foreground">{labels.subtitle}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const active = selected === template.key;
          return (
            <button
              key={template.key}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(template.key)}
              className={`focus-ring cursor-pointer rounded-xl border p-3 text-left transition-[border-color,background-color] duration-150 ${
                active
                  ? "border-primary bg-primary-soft text-primary-soft-foreground"
                  : "border-border bg-surface hover:border-primary/50"
              }`}
            >
              <span className="block text-sm font-semibold">{template.name}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {template.description}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{labels.overwriteHint}</p>
      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        onClick={() => current && onApply(current)}
      >
        {labels.apply}
      </Button>
    </fieldset>
  );
}
