"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProjectDraftPreview } from "@/components/projects/project-draft-preview";
import { ProjectQualityPanel } from "@/components/projects/project-quality-panel";
import { ProjectTemplatePicker } from "@/components/projects/project-template-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TechnologyPicker } from "@/components/ui/technology-picker";
import { Textarea } from "@/components/ui/textarea";
import { useRolesQuery, useTechnologiesQuery } from "@/hooks/use-lookups-query";
import { useAuth } from "@/hooks/use-auth";
import { useProjectMutations } from "@/hooks/use-project-mutations";
import { localText, type Locale } from "@/i18n/locales";
import { localizeRole } from "@/i18n/lookups";
import { withLocale } from "@/i18n/paths";
import {
  positionLevelLabel,
  projectCopy,
  projectFormatLabel,
  projectHealthLabel,
  projectStageLabel,
} from "@/i18n/project-copy";
import { getApiError } from "@/lib/api-error";
import { readLocalDraft, removeLocalDraft, writeLocalDraft } from "@/lib/local-draft";
import { calculateProjectQuality, type ProjectTemplatePreset } from "@/lib/project-quality";
import type { SiteMessages } from "@/messages/types";
import type {
  CreatePositionDto,
  PositionLevel,
  ProjectDetail,
  ProjectFormat,
  ProjectHealth,
  ProjectStage,
} from "@/types";

type DraftPosition = CreatePositionDto & { key: number };
type WizardStep = "idea" | "stage" | "roles" | "expectations" | "preview";
type ProjectLocalDraft = {
  clientRequestId: string;
  stepIndex: number;
  problem: string;
  expectedOutcome: string;
  stage: ProjectStage;
  format: ProjectFormat;
  duration: string;
  hoursPerWeek: string;
  timeZone: string;
  teamLanguages: string;
  projectLink: string;
  positions: DraftPosition[];
};

const createSteps: WizardStep[] = ["idea", "stage", "roles", "expectations", "preview"];
const editSteps: WizardStep[] = ["idea", "stage", "expectations", "preview"];
const stages: ProjectStage[] = ["idea", "prototype", "mvp", "growth"];
const formats: ProjectFormat[] = ["remote", "local", "hybrid"];
const levels: PositionLevel[] = ["any", "beginner", "intermediate", "advanced"];
const healthStates: ProjectHealth[] = ["active", "slow", "paused", "completed", "abandoned"];
const projectDraftVersion = 1;
const projectDraftMaxAge = 30 * 24 * 60 * 60 * 1000;

function blankPosition(key = 1): DraftPosition {
  return {
    key,
    roleId: 0,
    tasks: "",
    mustHaveTechnologyIds: [],
    niceToHaveTechnologyIds: [],
    level: "any",
  };
}

export function ProjectForm({
  locale,
  messages,
  project,
}: Readonly<{ locale: Locale; messages: SiteMessages; project?: ProjectDetail }>) {
  const exact = projectCopy(locale);
  const labels = messages.projects;
  const router = useRouter();
  const { user } = useAuth();
  const roles = useRolesQuery();
  const technologies = useTechnologiesQuery();
  const mutations = useProjectMutations(project?.id);
  const steps = project ? editSteps : createSteps;

  const [stepIndex, setStepIndex] = useState(0);
  const [problem, setProblem] = useState(project?.problem ?? "");
  const projectName = project?.projectName || deriveProjectTitle(problem);
  const [expectedOutcome, setExpectedOutcome] = useState(project?.expectedOutcome ?? "");
  const [stage, setStage] = useState<ProjectStage>(project?.stage ?? "idea");
  const [format, setFormat] = useState<ProjectFormat>(project?.format ?? "remote");
  const [duration, setDuration] = useState(project?.duration ?? "flexible");
  const [hoursPerWeek, setHoursPerWeek] = useState(project?.hoursPerWeek?.toString() ?? "");
  const [timeZone, setTimeZone] = useState(
    project?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [teamLanguages, setTeamLanguages] = useState(
    project?.teamLanguages.join(", ") ?? (locale === "uk" ? "uk" : locale === "pl" ? "pl" : "en")
  );
  const [projectLink, setProjectLink] = useState(project?.projectLink ?? "");
  const [healthStatus, setHealthStatus] = useState<ProjectHealth>(
    project?.healthStatus ?? "active"
  );
  const [positions, setPositions] = useState<DraftPosition[]>(() =>
    project?.positions.length
      ? project.positions.map((position) => ({
          key: position.id,
          roleId: position.role.id,
          tasks: position.tasks,
          mustHaveTechnologyIds: position.mustHave.map((item) => item.id),
          niceToHaveTechnologyIds: position.niceToHave.map((item) => item.id),
          level: position.level,
        }))
      : [blankPosition()]
  );
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [templateMessage, setTemplateMessage] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [clientRequestId, setClientRequestId] = useState(() => crypto.randomUUID());
  const hydratedDraftKey = useRef<string | null>(null);
  const draftKey = !project && user ? `wt:draft:project:new:user:${user.id}` : null;

  useEffect(() => {
    if (!draftKey || hydratedDraftKey.current === draftKey) return;
    const draft = readLocalDraft<unknown>(draftKey, projectDraftVersion, projectDraftMaxAge);
    if (!isProjectLocalDraft(draft)) {
      hydratedDraftKey.current = draftKey;
      return;
    }

    // Defer both the marker and state update together. React Strict Mode cancels
    // the first effect pass in development; marking the key before the deferred
    // work would make the second pass skip restoration and lose the draft.
    const timer = window.setTimeout(() => {
      if (hydratedDraftKey.current === draftKey) return;
      hydratedDraftKey.current = draftKey;
      setClientRequestId(draft.clientRequestId);
      setStepIndex(Math.min(createSteps.length - 1, Math.max(0, draft.stepIndex)));
      setProblem(draft.problem);
      setExpectedOutcome(draft.expectedOutcome);
      setStage(draft.stage);
      setFormat(draft.format);
      setDuration(draft.duration);
      setHoursPerWeek(draft.hoursPerWeek);
      setTimeZone(draft.timeZone);
      setTeamLanguages(draft.teamLanguages);
      setProjectLink(draft.projectLink);
      setPositions(draft.positions);
      setDraftStatus(
        localText(
          locale,
          "Your saved draft was restored.",
          "Ваш збережений чернетковий варіант відновлено.",
          "Przywrócono zapisany szkic."
        )
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draftKey, locale]);

  useEffect(() => {
    if (!draftKey || hydratedDraftKey.current !== draftKey || !clientRequestId) {
      return;
    }
    const value: ProjectLocalDraft = {
      clientRequestId,
      stepIndex,
      problem,
      expectedOutcome,
      stage,
      format,
      duration,
      hoursPerWeek,
      timeZone,
      teamLanguages,
      projectLink,
      positions,
    };
    const persist = () => {
      const hasMeaningfulInput =
        problem.trim().length > 0 ||
        expectedOutcome.trim().length > 0 ||
        projectLink.trim().length > 0 ||
        hoursPerWeek.trim().length > 0 ||
        stepIndex > 0 ||
        positions.some(
          (position) =>
            position.roleId > 0 ||
            position.tasks.trim().length > 0 ||
            position.mustHaveTechnologyIds.length > 0 ||
            position.niceToHaveTechnologyIds.length > 0
        );
      if (!hasMeaningfulInput) {
        removeLocalDraft(draftKey);
        return;
      }
      writeLocalDraft(draftKey, projectDraftVersion, value);
    };
    const timer = window.setTimeout(persist, 400);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", persist);
    };
  }, [
    clientRequestId,
    draftKey,
    duration,
    expectedOutcome,
    format,
    hoursPerWeek,
    positions,
    problem,
    projectLink,
    stage,
    stepIndex,
    teamLanguages,
    timeZone,
  ]);

  const normalizedLanguages = useMemo(
    () =>
      Array.from(
        new Set(
          teamLanguages
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean)
        )
      ).slice(0, 10),
    [teamLanguages]
  );

  const quality = useMemo(
    () =>
      calculateProjectQuality({
        problem,
        expectedOutcome,
        stage,
        format,
        duration,
        timeZone,
        teamLanguages: normalizedLanguages,
        positions,
      }),
    [duration, expectedOutcome, format, normalizedLanguages, positions, problem, stage, timeZone]
  );

  const updatePosition = (key: number, patch: Partial<DraftPosition>) => {
    setPositions((current) =>
      current.map((position) => (position.key === key ? { ...position, ...patch } : position))
    );
  };

  const applyTemplate = (template: ProjectTemplatePreset) => {
    setProblem(template.problem);
    setExpectedOutcome(template.expectedOutcome);
    setStage(template.stage);
    setFormat(template.format);
    setDuration(template.duration);
    setHoursPerWeek(template.hoursPerWeek ? String(template.hoursPerWeek) : "");
    setHealthStatus("active");
    setPositions((current) => [
      {
        ...(current[0] ?? blankPosition()),
        tasks: template.positionTasks,
        level: template.level,
      },
    ]);
    setTemplateMessage(labels.templates.applied);
  };

  const validateStepFields = (step: WizardStep): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (step === "idea") {
      if (!problem.trim() || problem.trim().length > 5000) errors.problem = exact.required;
    }
    if (step === "stage") {
      const parsedHours = hoursPerWeek ? Number(hoursPerWeek) : null;
      if (!duration.trim() || duration.trim().length > 80) errors.duration = exact.required;
      if (!timeZone.trim()) errors.timeZone = exact.required;
      if (!normalizedLanguages.length) errors.teamLanguages = exact.required;
      if (
        parsedHours !== null &&
        (!Number.isInteger(parsedHours) || parsedHours < 1 || parsedHours > 80)
      ) {
        errors.hoursPerWeek = exact.invalidHours;
      }
      if (projectLink.trim() && !/^https?:\/\/[^\s]+$/i.test(projectLink.trim())) {
        errors.projectLink = exact.invalidLink;
      }
    }
    if (step === "roles") {
      for (const position of positions) {
        if (position.roleId <= 0) errors[`role-${position.key}`] = exact.required;
      }
    }
    if (step === "expectations") {
      if (!expectedOutcome.trim() || expectedOutcome.trim().length > 5000)
        errors.expectedOutcome = exact.required;
      if (!project) {
        for (const position of positions) {
          if (!position.tasks.trim() || position.tasks.trim().length > 3000)
            errors[`tasks-${position.key}`] = exact.required;
          if (!position.mustHaveTechnologyIds.length)
            errors[`must-${position.key}`] = exact.atLeastOneSkill;
        }
      }
    }
    return errors;
  };

  const goNext = () => {
    setMessage("");
    const errors = validateStepFields(steps[stepIndex]);
    if (Object.keys(errors).length) {
      showFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});

    for (const step of steps) {
      const errors = validateStepFields(step);
      if (Object.keys(errors).length) {
        setStepIndex(steps.indexOf(step));
        showFieldErrors(errors);
        return;
      }
    }

    const write = {
      problem: problem.trim(),
      expectedOutcome: expectedOutcome.trim(),
      stage,
      format,
      duration: duration.trim(),
      hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
      timeZone: timeZone.trim(),
      teamLanguages: normalizedLanguages,
      projectLink: projectLink.trim() || null,
    };

    try {
      if (project) {
        await mutations.update.mutateAsync({ ...write, healthStatus });
        setMessage(labels.updateSuccess);
      } else {
        const created = await mutations.create.mutateAsync({
          ...write,
          clientRequestId,
          positions: positions.map((position) => ({
            roleId: position.roleId,
            tasks: position.tasks.trim(),
            mustHaveTechnologyIds: position.mustHaveTechnologyIds,
            niceToHaveTechnologyIds: position.niceToHaveTechnologyIds.filter(
              (id) => !position.mustHaveTechnologyIds.includes(id)
            ),
            level: position.level,
          })),
        });
        if (draftKey) removeLocalDraft(draftKey);
        router.push(withLocale(locale, `/projects/${created.id}`));
      }
    } catch (error) {
      const apiError = getApiError(error, messages.errors.generic);
      if (apiError.errors) {
        const serverErrors = Object.fromEntries(
          Object.entries(apiError.errors).map(([key, values]) => [
            key.replace(/^./, (character) => character.toLowerCase()),
            values[0] ?? apiError.message,
          ])
        );
        showFieldErrors(serverErrors);
      }
      setMessage(apiError.message);
    }
  };

  const showFieldErrors = (errors: Record<string, string>) => {
    setFieldErrors(errors);
    setMessage(
      localText(
        locale,
        "Review the highlighted fields.",
        "Перевірте виділені поля.",
        "Sprawdź wyróżnione pola."
      )
    );
    const first = Object.keys(errors)[0];
    window.requestAnimationFrame(() => {
      document.getElementById("project-form-error-summary")?.focus();
      window.requestAnimationFrame(() =>
        document.getElementById(first)?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        })
      );
    });
  };

  const clearFieldError = (key: string) =>
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });

  const currentStep = steps[stepIndex];
  const pending = mutations.create.isPending || mutations.update.isPending;
  const pickerLabels = {
    placeholder: labels.selectTechnology,
    searchPlaceholder: messages.profile.technologiesSearch,
    addNew: messages.profile.technologiesAdd,
    adding: messages.profile.technologiesAdding,
    genericError: messages.errors.generic,
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-surface/80 p-5 sm:p-8">
      <p className="text-sm text-muted-foreground">
        {project ? exact.editIntro : exact.wizardIntro}
      </p>
      {draftStatus ? (
        <p role="status" className="mt-3 text-sm font-medium text-success">
          {draftStatus}
        </p>
      ) : null}

      <ol
        aria-label={project ? labels.editTitle : labels.newTitle}
        className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={index === stepIndex ? "step" : undefined}
            className={`rounded-xl border px-3 py-2 text-sm ${
              index === stepIndex
                ? "border-primary bg-primary-soft font-semibold text-primary-soft-foreground"
                : index < stepIndex
                  ? "border-success/40 bg-success/10"
                  : "border-border text-muted-foreground"
            }`}
          >
            <span className="block text-xs">
              {exact.step} {index + 1}
            </span>
            {stepLabel(step, exact)}
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {Object.keys(fieldErrors).length ? (
          <div
            id="project-form-error-summary"
            role="alert"
            tabIndex={-1}
            className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive outline-none focus:ring-4 focus:ring-destructive/20"
          >
            <p className="font-semibold">
              {localText(
                locale,
                "Please fix these fields:",
                "Виправте ці поля:",
                "Popraw te pola:"
              )}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {Object.entries(fieldErrors).map(([key, value]) => (
                <li key={key}>
                  <a className="underline" href={`#${key}`}>
                    {value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {currentStep === "idea" ? (
          <div className="grid gap-5">
            {!project ? (
              <>
                <ProjectTemplatePicker labels={labels.templates} onApply={applyTemplate} />
                {templateMessage ? (
                  <p role="status" aria-live="polite" className="text-sm font-medium text-success">
                    {templateMessage}
                  </p>
                ) : null}
              </>
            ) : null}
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.problem}
              <Textarea
                id="problem"
                value={problem}
                maxLength={5000}
                onChange={(event) => {
                  setProblem(event.target.value);
                  clearFieldError("problem");
                }}
                aria-invalid={Boolean(fieldErrors.problem) || undefined}
                aria-describedby={fieldErrors.problem ? "problem-error" : undefined}
                placeholder={exact.problemPlaceholder}
                className="min-h-32"
                required
              />
              <FieldError id="problem-error" message={fieldErrors.problem} />
            </label>
          </div>
        ) : null}

        {currentStep === "stage" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.stage}
              <Select
                value={stage}
                onChange={(event) => setStage(event.target.value as ProjectStage)}
              >
                {stages.map((value) => (
                  <option key={value} value={value}>
                    {projectStageLabel(locale, value)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.format}
              <Select
                value={format}
                onChange={(event) => setFormat(event.target.value as ProjectFormat)}
              >
                {formats.map((value) => (
                  <option key={value} value={value}>
                    {projectFormatLabel(locale, value)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.duration}
              <Input
                id="duration"
                value={duration}
                maxLength={80}
                onChange={(event) => {
                  setDuration(event.target.value);
                  clearFieldError("duration");
                }}
                aria-invalid={Boolean(fieldErrors.duration) || undefined}
                aria-describedby={fieldErrors.duration ? "duration-error" : undefined}
                placeholder={exact.durationPlaceholder}
                required
              />
              <FieldError id="duration-error" message={fieldErrors.duration} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.hoursPerWeek}
              <Input
                id="hoursPerWeek"
                type="number"
                min={1}
                max={80}
                value={hoursPerWeek}
                onChange={(event) => {
                  setHoursPerWeek(event.target.value);
                  clearFieldError("hoursPerWeek");
                }}
                aria-invalid={Boolean(fieldErrors.hoursPerWeek) || undefined}
                aria-describedby={fieldErrors.hoursPerWeek ? "hoursPerWeek-error" : undefined}
              />
              <FieldError id="hoursPerWeek-error" message={fieldErrors.hoursPerWeek} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.timeZone}
              <Input
                id="timeZone"
                value={timeZone}
                maxLength={64}
                onChange={(event) => {
                  setTimeZone(event.target.value);
                  clearFieldError("timeZone");
                }}
                aria-invalid={Boolean(fieldErrors.timeZone) || undefined}
                aria-describedby={fieldErrors.timeZone ? "timeZone-error" : undefined}
                required
              />
              <FieldError id="timeZone-error" message={fieldErrors.timeZone} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.teamLanguages}
              <Input
                id="teamLanguages"
                value={teamLanguages}
                onChange={(event) => {
                  setTeamLanguages(event.target.value);
                  clearFieldError("teamLanguages");
                }}
                aria-invalid={Boolean(fieldErrors.teamLanguages) || undefined}
                aria-describedby={`team-languages-hint${
                  fieldErrors.teamLanguages ? " teamLanguages-error" : ""
                }`}
                required
              />
              <span id="team-languages-hint" className="text-xs font-normal text-muted-foreground">
                {exact.teamLanguagesHint}
              </span>
              <FieldError id="teamLanguages-error" message={fieldErrors.teamLanguages} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
              {exact.projectLink}
              <Input
                id="projectLink"
                type="url"
                value={projectLink}
                maxLength={2048}
                onChange={(event) => {
                  setProjectLink(event.target.value);
                  clearFieldError("projectLink");
                }}
                placeholder="https://"
                aria-invalid={Boolean(fieldErrors.projectLink) || undefined}
                aria-describedby={`project-link-hint${
                  fieldErrors.projectLink ? " projectLink-error" : ""
                }`}
              />
              <span id="project-link-hint" className="text-xs font-normal text-muted-foreground">
                {exact.projectLinkHint}
              </span>
              <FieldError id="projectLink-error" message={fieldErrors.projectLink} />
            </label>
            {project ? (
              <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                {exact.health}
                <Select
                  value={healthStatus}
                  onChange={(event) => setHealthStatus(event.target.value as ProjectHealth)}
                >
                  {healthStates.map((value) => (
                    <option key={value} value={value}>
                      {projectHealthLabel(locale, value)}
                    </option>
                  ))}
                </Select>
              </label>
            ) : null}
          </div>
        ) : null}

        {currentStep === "roles" ? (
          <fieldset>
            <legend className="text-lg font-semibold">{exact.rolesStep}</legend>
            <div className="mt-4 grid gap-3">
              {positions.map((position, index) => (
                <div
                  key={position.key}
                  className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-end"
                >
                  <label className="grid flex-1 gap-1.5 text-sm font-medium">
                    {exact.role} {index + 1}
                    <Select
                      id={`role-${position.key}`}
                      value={position.roleId || ""}
                      onChange={(event) => {
                        updatePosition(position.key, {
                          roleId: Number(event.target.value),
                        });
                        clearFieldError(`role-${position.key}`);
                      }}
                      aria-invalid={Boolean(fieldErrors[`role-${position.key}`]) || undefined}
                      aria-describedby={
                        fieldErrors[`role-${position.key}`]
                          ? `role-${position.key}-error`
                          : undefined
                      }
                    >
                      <option value="">{exact.selectRole}</option>
                      {roles.data?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {localizeRole(role, locale)}
                        </option>
                      ))}
                    </Select>
                    <FieldError
                      id={`role-${position.key}-error`}
                      message={fieldErrors[`role-${position.key}`]}
                    />
                  </label>
                  {positions.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setPositions((current) =>
                          current.filter((item) => item.key !== position.key)
                        )
                      }
                    >
                      {exact.removeRole}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() =>
                setPositions((current) => [
                  ...current,
                  blankPosition(Math.max(0, ...current.map((item) => item.key)) + 1),
                ])
              }
            >
              {exact.addRole}
            </Button>
          </fieldset>
        ) : null}

        {currentStep === "expectations" ? (
          <div className="grid gap-5">
            <label className="grid gap-1.5 text-sm font-medium">
              {exact.expectedOutcome}
              <Textarea
                id="expectedOutcome"
                value={expectedOutcome}
                maxLength={5000}
                onChange={(event) => {
                  setExpectedOutcome(event.target.value);
                  clearFieldError("expectedOutcome");
                }}
                aria-invalid={Boolean(fieldErrors.expectedOutcome) || undefined}
                aria-describedby={fieldErrors.expectedOutcome ? "expectedOutcome-error" : undefined}
                placeholder={exact.expectedOutcomePlaceholder}
                className="min-h-32"
                required
              />
              <FieldError id="expectedOutcome-error" message={fieldErrors.expectedOutcome} />
            </label>
            {!project
              ? positions.map((position, index) => {
                  const role = roles.data?.find((item) => item.id === position.roleId);
                  return (
                    <fieldset key={position.key} className="rounded-2xl border border-border p-4">
                      <legend className="px-1 text-base font-semibold">
                        {role ? localizeRole(role, locale) : `${exact.role} ${index + 1}`}
                      </legend>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
                          {exact.tasks}
                          <Textarea
                            id={`tasks-${position.key}`}
                            value={position.tasks}
                            maxLength={3000}
                            onChange={(event) => {
                              updatePosition(position.key, {
                                tasks: event.target.value,
                              });
                              clearFieldError(`tasks-${position.key}`);
                            }}
                            aria-invalid={
                              Boolean(fieldErrors[`tasks-${position.key}`]) || undefined
                            }
                            aria-describedby={
                              fieldErrors[`tasks-${position.key}`]
                                ? `tasks-${position.key}-error`
                                : undefined
                            }
                            placeholder={exact.tasksPlaceholder}
                            required
                          />
                          <FieldError
                            id={`tasks-${position.key}-error`}
                            message={fieldErrors[`tasks-${position.key}`]}
                          />
                        </label>
                        <div className="grid gap-1.5 text-sm font-medium">
                          <span>{exact.mustHave}</span>
                          <TechnologyPicker
                            id={`must-${position.key}`}
                            selected={position.mustHaveTechnologyIds}
                            onChange={(ids) => {
                              updatePosition(position.key, {
                                mustHaveTechnologyIds: ids,
                                niceToHaveTechnologyIds: position.niceToHaveTechnologyIds.filter(
                                  (id) => !ids.includes(id)
                                ),
                              });
                              clearFieldError(`must-${position.key}`);
                            }}
                            ariaInvalid={Boolean(fieldErrors[`must-${position.key}`])}
                            ariaDescribedBy={
                              fieldErrors[`must-${position.key}`]
                                ? `must-${position.key}-error`
                                : undefined
                            }
                            labels={pickerLabels}
                          />
                          <FieldError
                            id={`must-${position.key}-error`}
                            message={fieldErrors[`must-${position.key}`]}
                          />
                        </div>
                        <div className="grid gap-1.5 text-sm font-medium">
                          <span>{exact.niceToHave}</span>
                          <TechnologyPicker
                            selected={position.niceToHaveTechnologyIds}
                            onChange={(ids) =>
                              updatePosition(position.key, {
                                niceToHaveTechnologyIds: ids.filter(
                                  (id) => !position.mustHaveTechnologyIds.includes(id)
                                ),
                              })
                            }
                            labels={pickerLabels}
                          />
                        </div>
                        <label className="grid gap-1.5 text-sm font-medium">
                          {exact.level}
                          <Select
                            value={position.level}
                            onChange={(event) =>
                              updatePosition(position.key, {
                                level: event.target.value as PositionLevel,
                              })
                            }
                          >
                            {levels.map((value) => (
                              <option key={value} value={value}>
                                {positionLevelLabel(locale, value)}
                              </option>
                            ))}
                          </Select>
                        </label>
                      </div>
                    </fieldset>
                  );
                })
              : null}
          </div>
        ) : null}

        {currentStep === "preview" ? (
          <div className="grid gap-5">
            <ProjectQualityPanel
              score={quality.score}
              suggestions={quality.suggestions}
              labels={labels.quality}
            />
            <ProjectDraftPreview
              locale={locale}
              labels={labels}
              projectName={projectName}
              problem={problem}
              expectedOutcome={expectedOutcome}
              stage={stage}
              format={format}
              duration={duration}
              hoursPerWeek={hoursPerWeek ? Number(hoursPerWeek) : null}
              timeZone={timeZone}
              teamLanguages={normalizedLanguages}
              projectLink={projectLink}
              healthStatus={healthStatus}
              positions={positions}
              roles={roles.data ?? []}
              technologies={technologies.data ?? []}
            />
          </div>
        ) : null}

        {currentStep !== "preview" ? (
          <div className="mt-6">
            <ProjectQualityPanel
              score={quality.score}
              suggestions={quality.suggestions}
              labels={labels.quality}
            />
          </div>
        ) : null}
      </div>

      {message ? (
        <p
          role={message === labels.updateSuccess ? "status" : "alert"}
          aria-live="polite"
          className={`mt-5 text-sm ${
            message === labels.updateSuccess ? "text-success" : "text-destructive"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setMessage("");
              setFieldErrors({});
              setStepIndex((current) => Math.max(0, current - 1));
            }}
          >
            {exact.previous}
          </Button>
        ) : null}

        {stepIndex < steps.length - 1 ? (
          <Button
            key="project-form-next"
            type="button"
            onClick={(event) => {
              // WebKit can otherwise apply the click's default action after
              // this node morphs into the submit button on the preview step.
              event.preventDefault();
              goNext();
            }}
          >
            {exact.next}
          </Button>
        ) : (
          <Button key="project-form-submit" type="submit" disabled={pending}>
            {pending ? messages.common.saving : project ? messages.common.save : exact.publish}
          </Button>
        )}

        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {messages.common.cancel}
        </Button>
        {draftKey ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const confirmed = window.confirm(
                localText(
                  locale,
                  "Discard this draft and start again?",
                  "Видалити цю чернетку й почати спочатку?",
                  "Usunąć ten szkic i zacząć od nowa?"
                )
              );
              if (!confirmed) return;
              removeLocalDraft(draftKey);
              window.location.reload();
            }}
          >
            {localText(locale, "Discard draft", "Видалити чернетку", "Usuń szkic")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function stepLabel(step: WizardStep, copy: ReturnType<typeof projectCopy>) {
  switch (step) {
    case "idea":
      return copy.ideaStep;
    case "stage":
      return copy.stageStep;
    case "roles":
      return copy.rolesStep;
    case "expectations":
      return copy.expectationsStep;
    default:
      return copy.previewStep;
  }
}

function deriveProjectTitle(problem: string) {
  const normalized = problem.replace(/\s+/gu, " ").trim();
  if (normalized.length <= 120) return normalized;
  const shortened = normalized.slice(0, 120);
  const lastSpace = shortened.lastIndexOf(" ");
  return (lastSpace > 60 ? shortened.slice(0, lastSpace) : shortened).trimEnd();
}

function isProjectLocalDraft(value: unknown): value is ProjectLocalDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<ProjectLocalDraft>;
  const validStage = stages.includes(draft.stage as ProjectStage);
  const validFormat = formats.includes(draft.format as ProjectFormat);
  const validPositions =
    Array.isArray(draft.positions) &&
    draft.positions.length > 0 &&
    draft.positions.length <= 20 &&
    draft.positions.every(
      (position) =>
        typeof position?.key === "number" &&
        typeof position.roleId === "number" &&
        typeof position.tasks === "string" &&
        Array.isArray(position.mustHaveTechnologyIds) &&
        position.mustHaveTechnologyIds.every(Number.isInteger) &&
        Array.isArray(position.niceToHaveTechnologyIds) &&
        position.niceToHaveTechnologyIds.every(Number.isInteger) &&
        levels.includes(position.level)
    );
  return (
    typeof draft.clientRequestId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      draft.clientRequestId
    ) &&
    typeof draft.stepIndex === "number" &&
    typeof draft.problem === "string" &&
    draft.problem.length <= 5000 &&
    typeof draft.expectedOutcome === "string" &&
    draft.expectedOutcome.length <= 5000 &&
    validStage &&
    validFormat &&
    typeof draft.duration === "string" &&
    draft.duration.length <= 80 &&
    typeof draft.hoursPerWeek === "string" &&
    typeof draft.timeZone === "string" &&
    draft.timeZone.length <= 64 &&
    typeof draft.teamLanguages === "string" &&
    draft.teamLanguages.length <= 256 &&
    typeof draft.projectLink === "string" &&
    draft.projectLink.length <= 2048 &&
    validPositions
  );
}

function FieldError({ id, message }: Readonly<{ id: string; message?: string }>) {
  return message ? (
    <span id={id} className="text-xs font-normal text-destructive">
      {message}
    </span>
  ) : null;
}
