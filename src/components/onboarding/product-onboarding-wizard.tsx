"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { localizeRole } from "@/i18n/lookups";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { authService } from "@/services/authService";
import { lookupService } from "@/services/lookupService";
import {
  onboardingService,
  type DocumentImportPreview,
  type GithubImportPreview,
  type OnboardingIntent,
  type OnboardingSkillInput,
  type SkillLevel,
  type WorkFormat,
} from "@/services/onboardingService";
import { matchingService } from "@/services/matchingService";

type MatchCard =
  | { kind: "project"; id: number; title: string; score: number; detail: string }
  | { kind: "person"; id: number; title: string; score: number; detail: string };

const languageOptions = ["en", "uk", "pl", "de", "es", "fr"] as const;

export function ProductOnboardingWizard({ locale }: Readonly<{ locale: Locale }>) {
  const text = copy(locale);
  const { refreshSession } = useAuth();
  const roles = useQuery({ queryKey: ["roles"], queryFn: lookupService.getRoles });
  const technologies = useQuery({
    queryKey: ["technologies"],
    queryFn: lookupService.getTechnologies,
  });

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<OnboardingIntent | "">("");
  const [primaryRoleId, setPrimaryRoleId] = useState(0);
  const [skills, setSkills] = useState<OnboardingSkillInput[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [timeZone, setTimeZone] = useState("UTC");
  const [utcOffsetMinutes, setUtcOffsetMinutes] = useState(0);
  const [languages, setLanguages] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [format, setFormat] = useState<WorkFormat>("remote");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [githubConsent, setGithubConsent] = useState(false);
  const [githubPreview, setGithubPreview] = useState<GithubImportPreview | null>(null);
  const [includeGithub, setIncludeGithub] = useState(false);
  const [documentSource, setDocumentSource] = useState<"cv" | "linkedin">("cv");
  const [documentText, setDocumentText] = useState("");
  const [documentConsent, setDocumentConsent] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<DocumentImportPreview | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<MatchCard[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZone(resolved || "UTC");
      setUtcOffsetMinutes(-new Date().getTimezoneOffset());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedSkillIds = useMemo(
    () => new Set(skills.map((skill) => skill.technologyId)),
    [skills]
  );
  const filteredTechnologies = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();
    if (!query) return [];
    return (
      technologies.data
        ?.filter(
          (technology) =>
            !selectedSkillIds.has(technology.id) && technology.name.toLowerCase().includes(query)
        )
        .slice(0, 8) ?? []
    );
  }, [selectedSkillIds, skillSearch, technologies.data]);

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setError("");
    try {
      await action();
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, text.genericError));
    } finally {
      setBusy("");
    }
  };

  const validateStep = () => {
    if (step === 0 && !intent) return text.intentRequired;
    if (step === 1 && (!primaryRoleId || skills.length === 0)) {
      return text.roleSkillsRequired;
    }
    if (
      step === 2 &&
      (!timeZone.trim() || languages.length === 0 || hoursPerWeek < 1 || !startDate)
    ) {
      return text.availabilityRequired;
    }
    if (step === 3 && !goal.trim()) return text.goalRequired;
    return "";
  };

  const next = () => {
    const issue = validateStep();
    if (issue) {
      setError(issue);
      return;
    }
    setError("");
    setStep((current) => Math.min(4, current + 1));
  };

  const addSkill = (technologyId: number) => {
    setSkills((current) => [...current, { technologyId, level: "beginner" }]);
    setSkillSearch("");
  };

  const updateSkillLevel = (technologyId: number, level: SkillLevel) => {
    setSkills((current) =>
      current.map((skill) => (skill.technologyId === technologyId ? { ...skill, level } : skill))
    );
  };

  const previewGithubImport = () =>
    run("github", async () => {
      const preview = await onboardingService.previewGithub(githubUsername.trim(), githubConsent);
      setGithubPreview(preview);
      setIncludeGithub(false);
    });

  const previewDocumentImport = () =>
    run("document", async () => {
      setDocumentPreview(
        await onboardingService.previewDocument(documentSource, documentText, documentConsent)
      );
    });

  const applyDocumentPreview = () => {
    if (!documentPreview) return;
    if (documentPreview.suggestedRoleId) {
      setPrimaryRoleId(documentPreview.suggestedRoleId);
    }
    if (documentPreview.suggestedSkills.length > 0) {
      setSkills((current) => {
        const merged = new Map(current.map((skill) => [skill.technologyId, skill]));
        for (const skill of documentPreview.suggestedSkills) {
          merged.set(skill.technologyId, skill);
        }
        return [...merged.values()];
      });
    }
    if (documentPreview.suggestedLanguages.length > 0) {
      setLanguages((current) => [...new Set([...current, ...documentPreview.suggestedLanguages])]);
    }
    if (documentPreview.suggestedGoal) setGoal(documentPreview.suggestedGoal);
    setDocumentPreview(null);
    setDocumentText("");
  };

  const submit = () =>
    run("submit", async () => {
      if (!intent || !primaryRoleId) return;
      await onboardingService.complete({
        intent,
        primaryRoleId,
        skills,
        timeZone: timeZone.trim(),
        utcOffsetMinutes,
        languages,
        hoursPerWeek,
        format,
        goal: goal.trim(),
        startDate,
        reviewedGithubImport: includeGithub && githubPreview ? githubPreview : undefined,
      });
      await refreshSession();
      setMatches(await loadThreeMatches(intent));
    });

  const loadThreeMatches = async (selectedIntent: OnboardingIntent): Promise<MatchCard[]> => {
    if (selectedIntent === "join") {
      const projects = await matchingService.projects(3);
      return projects.slice(0, 3).map((item) => ({
        kind: "project" as const,
        id: item.project.id,
        title: item.project.projectName,
        score: item.score,
        detail: item.reasons[0]?.explanation ?? text.projectMatch,
      }));
    }
    if (selectedIntent === "find_people") {
      const people = await matchingService.complementaryPeople(3);
      return people.slice(0, 3).map((item) => ({
        kind: "person" as const,
        id: item.user.id,
        title: item.user.userName,
        score: item.score,
        detail: item.complementarySkills.slice(0, 3).join(", ") || text.personMatch,
      }));
    }
    const [projects, people] = await Promise.all([
      matchingService.projects(2),
      matchingService.complementaryPeople(1),
    ]);
    return [
      ...projects.slice(0, 2).map((item) => ({
        kind: "project" as const,
        id: item.project.id,
        title: item.project.projectName,
        score: item.score,
        detail: item.reasons[0]?.explanation ?? text.projectMatch,
      })),
      ...people.slice(0, 1).map((item) => ({
        kind: "person" as const,
        id: item.user.id,
        title: item.user.userName,
        score: item.score,
        detail: item.complementarySkills.slice(0, 3).join(", ") || text.personMatch,
      })),
    ].slice(0, 3);
  };

  if (matches) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-success">{text.complete}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{text.matchesTitle}</h1>
        <p className="mt-2 text-muted-foreground">{text.matchesBody}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {matches.map((match) => (
            <Link
              key={`${match.kind}-${match.id}`}
              href={withLocale(
                locale,
                match.kind === "project" ? `/projects/${match.id}` : `/users/${match.id}`
              )}
              className="rounded-2xl border border-border bg-surface-muted p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-text">
                {match.kind === "project" ? text.project : text.person} · {Math.round(match.score)}%
              </span>
              <h2 className="mt-2 font-semibold">{match.title}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{match.detail}</p>
            </Link>
          ))}
        </div>
        {matches.length === 0 ? (
          <p className="mt-6 rounded-xl bg-surface-muted p-4 text-sm text-muted-foreground">
            {text.noMatches}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={withLocale(locale, "/matches")}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            {text.openMatches}
          </Link>
          {(intent === "find_people" || intent === "both") && (
            <Link
              href={withLocale(locale, "/projects/new")}
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold"
            >
              {text.createProject}
            </Link>
          )}
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / 5) * 100;
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-text">
            {text.time}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{text.title}</h1>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">{step + 1}/5</span>
      </div>
      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={step + 1}
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-[width] motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-7 min-h-[22rem]">
        {step === 0 ? <IntentStep locale={locale} value={intent} onChange={setIntent} /> : null}
        {step === 1 ? (
          <section>
            <h2 className="text-xl font-semibold">{text.roleSkills}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text.roleSkillsHint}</p>
            <label className="mt-5 block text-sm font-semibold">
              {text.primaryRole}
              <select
                value={primaryRoleId || ""}
                onChange={(event) => setPrimaryRoleId(Number(event.target.value))}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-surface px-3"
              >
                <option value="">{text.chooseRole}</option>
                {roles.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {localizeRole(role, locale)}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-5 block text-sm font-semibold">
              {text.skills}
              <input
                value={skillSearch}
                onChange={(event) => setSkillSearch(event.target.value)}
                placeholder={text.skillSearch}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-surface px-3"
              />
            </label>
            {filteredTechnologies.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {filteredTechnologies.map((technology) => (
                  <button
                    type="button"
                    key={technology.id}
                    onClick={() => addSkill(technology.id)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/40"
                  >
                    + {technology.name}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-4 space-y-2">
              {skills.map((skill) => {
                const technology = technologies.data?.find(
                  (item) => item.id === skill.technologyId
                );
                return (
                  <div
                    key={skill.technologyId}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-muted p-3"
                  >
                    <span className="mr-auto text-sm font-semibold">
                      {technology?.name ?? `#${skill.technologyId}`}
                    </span>
                    <select
                      value={skill.level}
                      aria-label={`${technology?.name ?? text.skills}: ${text.level}`}
                      onChange={(event) =>
                        updateSkillLevel(skill.technologyId, event.target.value as SkillLevel)
                      }
                      className="h-9 rounded-lg border border-input bg-surface px-2 text-xs"
                    >
                      <option value="beginner">{text.beginner}</option>
                      <option value="intermediate">{text.intermediate}</option>
                      <option value="advanced">{text.advanced}</option>
                    </select>
                    <button
                      type="button"
                      aria-label={text.removeSkill}
                      onClick={() =>
                        setSkills((current) =>
                          current.filter((item) => item.technologyId !== skill.technologyId)
                        )
                      }
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
        {step === 2 ? (
          <AvailabilityStep
            locale={locale}
            timeZone={timeZone}
            setTimeZone={setTimeZone}
            languages={languages}
            setLanguages={setLanguages}
            hoursPerWeek={hoursPerWeek}
            setHoursPerWeek={setHoursPerWeek}
            format={format}
            setFormat={setFormat}
            startDate={startDate}
            setStartDate={setStartDate}
          />
        ) : null}
        {step === 3 ? (
          <section>
            <h2 className="text-xl font-semibold">{text.goalImports}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text.importsOptional}</p>
            <label className="mt-5 block text-sm font-semibold">
              {text.goal}
              <textarea
                value={goal}
                maxLength={200}
                onChange={(event) => setGoal(event.target.value)}
                placeholder={text.goalPlaceholder}
                className="mt-2 min-h-24 w-full rounded-xl border border-input bg-surface p-3 text-sm"
              />
            </label>

            <details className="mt-5 rounded-xl border border-border p-4">
              <summary className="cursor-pointer font-semibold">{text.githubImport}</summary>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {text.githubConsentHint}
              </p>
              <input
                value={githubUsername}
                onChange={(event) => {
                  setGithubUsername(event.target.value);
                  setGithubPreview(null);
                }}
                placeholder="github-username"
                className="mt-3 h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm"
              />
              <label className="mt-3 flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={githubConsent}
                  onChange={(event) => setGithubConsent(event.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                {text.githubConsent}
              </label>
              <button
                type="button"
                onClick={() => void previewGithubImport()}
                disabled={Boolean(busy) || !githubConsent || !githubUsername.trim()}
                className="mt-3 rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {text.previewImport}
              </button>
              {githubPreview ? (
                <div className="mt-3 rounded-lg bg-surface-muted p-3 text-xs">
                  <p className="font-semibold">@{githubPreview.username}</p>
                  <p className="mt-1 text-muted-foreground">
                    {text.contributions.replace("{count}", String(githubPreview.contributionCount))}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {githubPreview.languages.join(", ") || text.none}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {githubPreview.pinnedRepositories.map((repository) => (
                      <li key={repository.url}>{repository.name}</li>
                    ))}
                  </ul>
                  <label className="mt-3 flex items-center gap-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={includeGithub}
                      onChange={(event) => setIncludeGithub(event.target.checked)}
                      className="size-4 accent-primary"
                    />
                    {text.saveReviewedGithub}
                  </label>
                </div>
              ) : null}
            </details>

            <details className="mt-3 rounded-xl border border-border p-4">
              <summary className="cursor-pointer font-semibold">{text.documentImport}</summary>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{text.documentHint}</p>
              <select
                value={documentSource}
                onChange={(event) => setDocumentSource(event.target.value as "cv" | "linkedin")}
                className="mt-3 h-10 rounded-lg border border-input bg-surface px-3 text-sm"
              >
                <option value="cv">CV</option>
                <option value="linkedin">LinkedIn</option>
              </select>
              <textarea
                value={documentText}
                maxLength={50_000}
                onChange={(event) => {
                  setDocumentText(event.target.value);
                  setDocumentPreview(null);
                }}
                placeholder={text.pasteText}
                className="mt-3 min-h-28 w-full rounded-lg border border-input bg-surface p-3 text-sm"
              />
              <label className="mt-3 flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={documentConsent}
                  onChange={(event) => setDocumentConsent(event.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                {text.documentConsent}
              </label>
              <button
                type="button"
                disabled={Boolean(busy) || !documentConsent || !documentText.trim()}
                onClick={() => void previewDocumentImport()}
                className="mt-3 rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {text.previewImport}
              </button>
              {documentPreview ? (
                <div className="mt-3 rounded-lg bg-surface-muted p-3 text-xs">
                  <p className="font-semibold">{text.extractedPreview}</p>
                  <p className="mt-1">
                    {text.role}:{" "}
                    {roles.data?.find((role) => role.id === documentPreview.suggestedRoleId)
                      ? localizeRole(
                          roles.data.find((role) => role.id === documentPreview.suggestedRoleId)!,
                          locale
                        )
                      : text.none}
                  </p>
                  <p className="mt-1">
                    {text.skills}: {documentPreview.suggestedSkills.length}
                  </p>
                  <p className="mt-1">
                    {text.languages}: {documentPreview.suggestedLanguages.join(", ") || text.none}
                  </p>
                  <button
                    type="button"
                    onClick={applyDocumentPreview}
                    className="mt-3 rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground"
                  >
                    {text.applySuggestions}
                  </button>
                </div>
              ) : null}
            </details>
          </section>
        ) : null}
        {step === 4 ? (
          <ReviewStep
            locale={locale}
            intent={intent as OnboardingIntent}
            roleName={
              roles.data?.find((role) => role.id === primaryRoleId)
                ? localizeRole(roles.data.find((role) => role.id === primaryRoleId)!, locale)
                : ""
            }
            skillNames={skills.map(
              (skill) =>
                technologies.data?.find((technology) => technology.id === skill.technologyId)
                  ?.name ?? `#${skill.technologyId}`
            )}
            timeZone={timeZone}
            languages={languages}
            hoursPerWeek={hoursPerWeek}
            format={format}
            startDate={startDate}
            goal={goal}
            github={includeGithub ? githubPreview?.username : undefined}
          />
        ) : null}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || Boolean(busy)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          {text.back}
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {text.next}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={Boolean(busy)}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy === "submit" ? text.saving : text.finish}
          </button>
        )}
      </div>
    </div>
  );
}

function IntentStep({
  locale,
  value,
  onChange,
}: Readonly<{
  locale: Locale;
  value: OnboardingIntent | "";
  onChange: (value: OnboardingIntent) => void;
}>) {
  const text = copy(locale);
  const options: Array<{
    value: OnboardingIntent;
    title: string;
    detail: string;
  }> = [
    { value: "join", title: text.join, detail: text.joinHint },
    {
      value: "find_people",
      title: text.findPeople,
      detail: text.findPeopleHint,
    },
    { value: "both", title: text.both, detail: text.bothHint },
  ];
  return (
    <fieldset>
      <legend className="text-xl font-semibold">{text.intentTitle}</legend>
      <p className="mt-1 text-sm text-muted-foreground">{text.intentHint}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-2xl border p-4 transition ${
              value === option.value
                ? "border-primary bg-primary/8"
                : "border-border hover:border-primary/35"
            }`}
          >
            <input
              type="radio"
              name="intent"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="font-semibold">{option.title}</span>
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              {option.detail}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function AvailabilityStep({
  locale,
  timeZone,
  setTimeZone,
  languages,
  setLanguages,
  hoursPerWeek,
  setHoursPerWeek,
  format,
  setFormat,
  startDate,
  setStartDate,
}: Readonly<{
  locale: Locale;
  timeZone: string;
  setTimeZone: (value: string) => void;
  languages: string[];
  setLanguages: (value: string[]) => void;
  hoursPerWeek: number;
  setHoursPerWeek: (value: number) => void;
  format: WorkFormat;
  setFormat: (value: WorkFormat) => void;
  startDate: string;
  setStartDate: (value: string) => void;
}>) {
  const text = copy(locale);
  const timeZones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : ["UTC", "Europe/Warsaw", "Europe/Kyiv", "Europe/London"];
  return (
    <section>
      <h2 className="text-xl font-semibold">{text.availability}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{text.availabilityHint}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          {text.timeZone}
          <input
            list="time-zones"
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-input bg-surface px-3"
          />
          <datalist id="time-zones">
            {timeZones.map((zone) => (
              <option value={zone} key={zone} />
            ))}
          </datalist>
        </label>
        <label className="text-sm font-semibold">
          {text.hours}
          <input
            type="number"
            min={1}
            max={80}
            value={hoursPerWeek}
            onChange={(event) => setHoursPerWeek(Number(event.target.value))}
            className="mt-2 h-11 w-full rounded-xl border border-input bg-surface px-3"
          />
        </label>
        <label className="text-sm font-semibold">
          {text.startDate}
          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-input bg-surface px-3"
          />
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">{text.format}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["remote", "local", "hybrid"] as const).map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold ${
                  format === value
                    ? "border-primary bg-primary/8 text-primary-text"
                    : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={value}
                  checked={format === value}
                  onChange={() => setFormat(value)}
                  className="sr-only"
                />
                {text[value]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">{text.languages}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {languageOptions.map((language) => {
            const selected = languages.includes(language);
            return (
              <label
                key={language}
                className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold ${
                  selected ? "border-primary bg-primary/8 text-primary-text" : "border-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    setLanguages(
                      selected
                        ? languages.filter((value) => value !== language)
                        : [...languages, language]
                    )
                  }
                  className="sr-only"
                />
                {languageLabel(language, locale)}
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

function ReviewStep({
  locale,
  intent,
  roleName,
  skillNames,
  timeZone,
  languages,
  hoursPerWeek,
  format,
  startDate,
  goal,
  github,
}: Readonly<{
  locale: Locale;
  intent: OnboardingIntent;
  roleName: string;
  skillNames: string[];
  timeZone: string;
  languages: string[];
  hoursPerWeek: number;
  format: WorkFormat;
  startDate: string;
  goal: string;
  github?: string;
}>) {
  const text = copy(locale);
  const rows = [
    [text.intent, text[intent]],
    [text.role, roleName],
    [text.skills, skillNames.join(", ")],
    [text.timeZone, timeZone],
    [text.languages, languages.map((code) => languageLabel(code, locale)).join(", ")],
    [text.hours, String(hoursPerWeek)],
    [text.format, text[format]],
    [text.startDate, startDate],
    [text.goal, goal],
    ...(github ? [["GitHub", `@${github}`]] : []),
  ];
  return (
    <section>
      <h2 className="text-xl font-semibold">{text.review}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{text.reviewHint}</p>
      <dl className="mt-5 divide-y divide-border rounded-2xl border border-border px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
            <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function languageLabel(code: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    en: { en: "English", uk: "Англійська", pl: "Angielski" },
    uk: { en: "Ukrainian", uk: "Українська", pl: "Ukraiński" },
    pl: { en: "Polish", uk: "Польська", pl: "Polski" },
    de: { en: "German", uk: "Німецька", pl: "Niemiecki" },
    es: { en: "Spanish", uk: "Іспанська", pl: "Hiszpański" },
    fr: { en: "French", uk: "Французька", pl: "Francuski" },
  };
  return labels[code]?.[locale] ?? code;
}

function copy(locale: Locale) {
  const values = {
    en: onboardingEnglish,
    uk: onboardingUkrainian,
    pl: onboardingPolish,
  };
  return values[locale];
}

const onboardingEnglish = {
  time: "3–5 minute setup",
  title: "Let’s find your best next step",
  intentTitle: "What do you want to do?",
  intentHint: "This controls what we show immediately after setup.",
  join: "Join a project",
  joinHint: "Find a team with a clear role for you.",
  findPeople: "Find people",
  findPeopleHint: "Build a team around your own idea.",
  both: "Both",
  bothHint: "Explore projects and complementary people.",
  roleSkills: "Your role and skills",
  roleSkillsHint: "Choose one primary role and add skills with honest levels.",
  primaryRole: "Primary role",
  chooseRole: "Choose a role",
  skills: "Skills",
  skillSearch: "Search a skill",
  level: "Level",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  removeSkill: "Remove skill",
  availability: "Availability",
  availabilityHint: "Only the fields needed to find realistic overlap.",
  timeZone: "Timezone",
  hours: "Hours per week",
  startDate: "Start date",
  format: "Format",
  remote: "Remote",
  local: "Local",
  hybrid: "Hybrid",
  languages: "Working languages",
  goalImports: "Your goal and optional imports",
  importsOptional: "Imports are optional and nothing is saved before you review it.",
  goal: "Goal",
  goalPlaceholder: "What would you like to achieve through this collaboration?",
  githubImport: "Import GitHub evidence (optional)",
  githubConsentHint: "We request only your public profile evidence after explicit consent.",
  githubConsent: "I consent to fetching this public GitHub profile for a preview.",
  previewImport: "Preview extracted data",
  contributions: "{count} contributions in the last year",
  saveReviewedGithub: "Include this reviewed preview in my profile",
  documentImport: "Preview LinkedIn/CV text (optional)",
  documentHint: "Paste text. We show extracted fields before anything is applied.",
  pasteText: "Paste LinkedIn or CV text",
  documentConsent: "I consent to parsing this text for a local preview.",
  extractedPreview: "Extracted fields",
  applySuggestions: "Apply these suggestions to the form",
  none: "None found",
  review: "Review before saving",
  reviewHint: "Go back to change anything. These are the only onboarding fields saved.",
  intent: "Intent",
  role: "Role",
  back: "Back",
  next: "Continue",
  finish: "Save and show matches",
  saving: "Saving…",
  intentRequired: "Choose what you want to do.",
  roleSkillsRequired: "Choose a role and add at least one skill.",
  availabilityRequired: "Complete timezone, language, hours, format, and start date.",
  goalRequired: "Describe your collaboration goal.",
  genericError: "Could not complete onboarding. Check the fields and retry.",
  complete: "Setup complete",
  matchesTitle: "Three relevant starting points",
  matchesBody: "No empty profile: start with these explainable matches.",
  project: "Project",
  person: "Person",
  projectMatch: "Relevant to your selected skills and availability",
  personMatch: "Adds complementary skills",
  noMatches:
    "There are no suitable active matches yet. Your profile is ready and new matches will appear here.",
  openMatches: "Explore all matches",
  createProject: "Create a project",
  find_people: "Find people",
};

const onboardingUkrainian = {
  ...onboardingEnglish,
  time: "Налаштування за 3–5 хвилин",
  title: "Знайдімо найкращий наступний крок",
  intentTitle: "Що ви хочете зробити?",
  intentHint: "Від цього залежить, що ми покажемо одразу після налаштування.",
  join: "Приєднатися до проєкту",
  joinHint: "Знайти команду з чіткою роллю для вас.",
  findPeople: "Знайти людей",
  findPeopleHint: "Зібрати команду навколо своєї ідеї.",
  both: "І те, й інше",
  bothHint: "Дивитися проєкти й людей із доповнювальними навичками.",
  roleSkills: "Ваша роль і навички",
  roleSkillsHint: "Оберіть основну роль і чесно вкажіть рівень навичок.",
  primaryRole: "Основна роль",
  chooseRole: "Оберіть роль",
  skills: "Навички",
  skillSearch: "Знайти навичку",
  level: "Рівень",
  beginner: "Початковий",
  intermediate: "Середній",
  advanced: "Просунутий",
  removeSkill: "Видалити навичку",
  availability: "Доступність",
  availabilityHint: "Лише дані, потрібні для реалістичного перетину.",
  timeZone: "Часовий пояс",
  hours: "Годин на тиждень",
  startDate: "Дата початку",
  format: "Формат",
  remote: "Віддалено",
  local: "Локально",
  hybrid: "Гібридно",
  languages: "Робочі мови",
  goalImports: "Ваша мета й необов’язковий імпорт",
  importsOptional: "Імпорт необов’язковий. Нічого не зберігається до вашої перевірки.",
  goal: "Мета",
  goalPlaceholder: "Чого ви хочете досягти завдяки цій співпраці?",
  githubImport: "Імпорт доказів із GitHub (необов’язково)",
  githubConsentHint: "Після явної згоди ми запитаємо лише публічні дані профілю.",
  githubConsent:
    "Я погоджуюся отримати публічні дані цього GitHub-профілю для попереднього перегляду.",
  previewImport: "Переглянути витягнуті дані",
  contributions: "{count} внесків за останній рік",
  saveReviewedGithub: "Додати цей перевірений перегляд до профілю",
  documentImport: "Перегляд тексту LinkedIn/CV (необов’язково)",
  documentHint: "Вставте текст. Ми покажемо витягнуті поля до застосування.",
  pasteText: "Вставте текст LinkedIn або CV",
  documentConsent: "Я погоджуюся проаналізувати цей текст для локального перегляду.",
  extractedPreview: "Витягнуті поля",
  applySuggestions: "Застосувати ці пропозиції до форми",
  none: "Нічого не знайдено",
  review: "Перевірте перед збереженням",
  reviewHint: "Поверніться, щоб щось змінити. Зберігаються лише ці поля.",
  intent: "Намір",
  role: "Роль",
  back: "Назад",
  next: "Продовжити",
  finish: "Зберегти й показати збіги",
  saving: "Збереження…",
  intentRequired: "Оберіть, що ви хочете зробити.",
  roleSkillsRequired: "Оберіть роль і додайте хоча б одну навичку.",
  availabilityRequired: "Заповніть часовий пояс, мову, години, формат і дату початку.",
  goalRequired: "Опишіть мету співпраці.",
  genericError: "Не вдалося завершити онбординг. Перевірте поля й повторіть.",
  complete: "Налаштування завершено",
  matchesTitle: "Три релевантні варіанти для старту",
  matchesBody: "Без порожнього профілю: почніть із пояснюваних збігів.",
  project: "Проєкт",
  person: "Людина",
  projectMatch: "Відповідає вашим навичкам і доступності",
  personMatch: "Доповнює ваші навички",
  noMatches:
    "Поки немає відповідних активних збігів. Профіль готовий, нові варіанти з’являться тут.",
  openMatches: "Переглянути всі збіги",
  createProject: "Створити проєкт",
  find_people: "Знайти людей",
};

const onboardingPolish = {
  ...onboardingEnglish,
  time: "Konfiguracja w 3–5 minut",
  title: "Znajdźmy najlepszy kolejny krok",
  intentTitle: "Co chcesz zrobić?",
  intentHint: "Od tego zależy, co pokażemy od razu po konfiguracji.",
  join: "Dołączyć do projektu",
  joinHint: "Znajdź zespół z jasno określoną rolą.",
  findPeople: "Znaleźć ludzi",
  findPeopleHint: "Zbuduj zespół wokół własnego pomysłu.",
  both: "Jedno i drugie",
  bothHint: "Przeglądaj projekty oraz osoby z uzupełniającymi umiejętnościami.",
  roleSkills: "Twoja rola i umiejętności",
  roleSkillsHint: "Wybierz główną rolę i uczciwie określ poziom umiejętności.",
  primaryRole: "Główna rola",
  chooseRole: "Wybierz rolę",
  skills: "Umiejętności",
  skillSearch: "Szukaj umiejętności",
  level: "Poziom",
  beginner: "Początkujący",
  intermediate: "Średniozaawansowany",
  advanced: "Zaawansowany",
  removeSkill: "Usuń umiejętność",
  availability: "Dostępność",
  availabilityHint: "Tylko dane potrzebne do znalezienia realistycznego dopasowania.",
  timeZone: "Strefa czasowa",
  hours: "Godziny tygodniowo",
  startDate: "Data rozpoczęcia",
  format: "Format",
  remote: "Zdalnie",
  local: "Lokalnie",
  hybrid: "Hybrydowo",
  languages: "Języki zespołu",
  goalImports: "Twój cel i opcjonalny import",
  importsOptional: "Import jest opcjonalny. Nic nie zapisujemy przed Twoją akceptacją.",
  goal: "Cel",
  goalPlaceholder: "Co chcesz osiągnąć dzięki tej współpracy?",
  githubImport: "Import dowodów z GitHub (opcjonalnie)",
  githubConsentHint: "Po wyraźnej zgodzie pobieramy tylko publiczne dane profilu.",
  githubConsent: "Zgadzam się pobrać publiczne dane tego profilu GitHub do podglądu.",
  previewImport: "Pokaż wyodrębnione dane",
  contributions: "{count} kontrybucji w ostatnim roku",
  saveReviewedGithub: "Dodaj ten zaakceptowany podgląd do profilu",
  documentImport: "Podgląd tekstu LinkedIn/CV (opcjonalnie)",
  documentHint: "Wklej tekst. Pokażemy wyodrębnione pola przed zastosowaniem.",
  pasteText: "Wklej tekst LinkedIn lub CV",
  documentConsent: "Zgadzam się przeanalizować ten tekst do lokalnego podglądu.",
  extractedPreview: "Wyodrębnione pola",
  applySuggestions: "Zastosuj te propozycje w formularzu",
  none: "Nic nie znaleziono",
  review: "Sprawdź przed zapisaniem",
  reviewHint: "Wróć, aby coś zmienić. Zapisujemy tylko te pola.",
  intent: "Zamiar",
  role: "Rola",
  back: "Wróć",
  next: "Dalej",
  finish: "Zapisz i pokaż dopasowania",
  saving: "Zapisywanie…",
  intentRequired: "Wybierz, co chcesz zrobić.",
  roleSkillsRequired: "Wybierz rolę i dodaj co najmniej jedną umiejętność.",
  availabilityRequired: "Uzupełnij strefę, język, godziny, format i datę rozpoczęcia.",
  goalRequired: "Opisz cel współpracy.",
  genericError: "Nie udało się ukończyć onboardingu. Sprawdź pola i spróbuj ponownie.",
  complete: "Konfiguracja zakończona",
  matchesTitle: "Trzy trafne punkty startowe",
  matchesBody: "Bez pustego profilu: zacznij od wyjaśnialnych dopasowań.",
  project: "Projekt",
  person: "Osoba",
  projectMatch: "Pasuje do Twoich umiejętności i dostępności",
  personMatch: "Uzupełnia Twoje umiejętności",
  noMatches:
    "Nie ma jeszcze odpowiednich aktywnych dopasowań. Profil jest gotowy, a nowe propozycje pojawią się tutaj.",
  openMatches: "Zobacz wszystkie dopasowania",
  createProject: "Utwórz projekt",
  find_people: "Znaleźć ludzi",
};
