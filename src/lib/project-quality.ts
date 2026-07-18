import type {
  PositionLevel,
  ProjectFormat,
  ProjectHealth,
  ProjectQualitySuggestion,
  ProjectStage,
} from "@/types";

export const projectTemplateKeys = [
  "studyProject",
  "openSource",
  "hackathon",
  "startupValidation",
  "research",
  "volunteer",
] as const;

export type ProjectTemplateKey = (typeof projectTemplateKeys)[number];

export type ProjectTemplateCopy = Readonly<{
  name: string;
  description: string;
  problem: string;
  expectedOutcome: string;
  duration: string;
  positionTasks: string;
}>;

export type ProjectTemplatePreset = ProjectTemplateCopy &
  Readonly<{
    key: ProjectTemplateKey;
    stage: ProjectStage;
    format: ProjectFormat;
    hoursPerWeek: number | null;
    level: PositionLevel;
  }>;

export function buildProjectTemplates(
  copy: Record<ProjectTemplateKey, ProjectTemplateCopy>
): ProjectTemplatePreset[] {
  const presets: Record<
    ProjectTemplateKey,
    Omit<ProjectTemplatePreset, keyof ProjectTemplateCopy | "key">
  > = {
    studyProject: {
      stage: "idea",
      format: "remote",
      hoursPerWeek: 4,
      level: "beginner",
    },
    openSource: {
      stage: "mvp",
      format: "remote",
      hoursPerWeek: 4,
      level: "any",
    },
    hackathon: {
      stage: "idea",
      format: "remote",
      hoursPerWeek: 12,
      level: "any",
    },
    startupValidation: {
      stage: "prototype",
      format: "remote",
      hoursPerWeek: 8,
      level: "intermediate",
    },
    research: {
      stage: "idea",
      format: "remote",
      hoursPerWeek: 5,
      level: "intermediate",
    },
    volunteer: {
      stage: "prototype",
      format: "remote",
      hoursPerWeek: 5,
      level: "any",
    },
  };
  return projectTemplateKeys.map((key) => ({
    key,
    ...copy[key],
    ...presets[key],
  }));
}

export type ProjectQualityDraft = Readonly<{
  problem: string;
  expectedOutcome: string;
  stage: ProjectStage;
  format: ProjectFormat;
  duration: string;
  timeZone: string;
  teamLanguages: readonly string[];
  positions: ReadonlyArray<
    Readonly<{
      roleId: number;
      tasks: string;
      mustHaveTechnologyIds: readonly number[];
      level: PositionLevel;
    }>
  >;
}>;

export type ProjectQualityResult = Readonly<{
  score: number;
  suggestions: ProjectQualitySuggestion[];
}>;

/**
 * Mirrors ProjectQualityEvaluator on the API. Optional hours, link, and
 * nice-to-have skills never lower the score; short writing is not punished.
 */
export function calculateProjectQuality(draft: ProjectQualityDraft): ProjectQualityResult {
  let score = 0;
  const suggestions: ProjectQualitySuggestion[] = [];
  const positions = draft.positions;

  if (draft.problem.trim()) score += 20;
  else suggestions.push("problem");

  if (draft.expectedOutcome.trim()) score += 15;
  else suggestions.push("expectedOutcome");

  if (draft.stage && draft.format && draft.duration.trim()) score += 15;
  else suggestions.push("logistics");

  if (draft.timeZone.trim()) score += 5;
  else suggestions.push("timezone");

  if (draft.teamLanguages.some((language) => language.trim())) score += 10;
  else suggestions.push("languages");

  if (positions.length > 0 && positions.every((position) => position.roleId > 0)) {
    score += 10;
  } else {
    suggestions.push("positions");
  }

  if (positions.length > 0 && positions.every((position) => position.tasks.trim())) {
    score += 10;
  } else {
    suggestions.push("tasks");
  }

  if (
    positions.length > 0 &&
    positions.every((position) => position.mustHaveTechnologyIds.length > 0)
  ) {
    score += 10;
  } else {
    suggestions.push("mustHave");
  }

  if (
    positions.length > 0 &&
    positions.every((position) =>
      ["beginner", "intermediate", "advanced", "any"].includes(position.level)
    )
  ) {
    score += 5;
  } else {
    suggestions.push("level");
  }

  return { score: Math.min(100, Math.max(0, score)), suggestions };
}

export function projectHealthTone(
  health: ProjectHealth
): "green" | "blue" | "yellow" | "red" | "neutral" {
  switch (health) {
    case "active":
      return "green";
    case "slow":
      return "yellow";
    case "completed":
      return "blue";
    case "abandoned":
      return "red";
    default:
      return "neutral";
  }
}
