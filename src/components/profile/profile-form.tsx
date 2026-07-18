"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { TechnologyPicker } from "@/components/ui/technology-picker";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useProfileMutation } from "@/hooks/use-profile-mutation";
import { useTechnologiesQuery } from "@/hooks/use-lookups-query";
import { localText } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import { SOCIAL_NETWORKS, socialLabel } from "@/lib/socials";
import { fileService } from "@/services/fileService";
import type { SiteMessages } from "@/messages/types";
import type { PrivateUser, SocialLink } from "@/types";

import { LookingForTeamToggle } from "./looking-for-team-toggle";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const profileFieldNames = [
  "userName",
  "userDescription",
  "githubProfile",
  "linkedInProfile",
  "cv",
] as const;
type ProfileField = (typeof profileFieldNames)[number];

export function ProfileForm({
  profile,
  messages,
}: Readonly<{ profile: PrivateUser; messages: SiteMessages }>) {
  const technologies = useTechnologiesQuery();
  const mutation = useProfileMutation();
  const router = useRouter();
  const initialTechnologyIds = useMemo(
    () =>
      technologies.data
        ?.filter((item) => profile.technologies.includes(item.name))
        .map((item) => item.id) ?? [],
    [profile.technologies, technologies.data]
  );
  const [userName, setUserName] = useState(profile.userName);
  const [userDescription, setUserDescription] = useState(profile.userDescription ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [githubProfile, setGithubProfile] = useState(profile.githubProfile ?? "");
  const [linkedInProfile, setLinkedInProfile] = useState(profile.linkedInProfile ?? "");
  const [cv, setCv] = useState(profile.cv ?? "");
  const [isLookingForTeam, setIsLookingForTeam] = useState(profile.isLookingForTeam);
  const [technologyIds, setTechnologyIds] = useState<number[] | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(profile.socialLinks ?? []);
  const [socialType, setSocialType] = useState(SOCIAL_NETWORKS[0].id);
  const [socialHandle, setSocialHandle] = useState("");
  const [timeZone, setTimeZone] = useState(
    profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [availableFrom, setAvailableFrom] = useState(minutesToTime(profile.availableFromMinutes));
  const [availableTo, setAvailableTo] = useState(minutesToTime(profile.availableToMinutes));
  const [hoursPerWeek, setHoursPerWeek] = useState(profile.hoursPerWeek?.toString() ?? "");
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel);
  const [languages, setLanguages] = useState(profile.languages.join(", "));
  const [collaborationGoal, setCollaborationGoal] = useState(profile.collaborationGoal);
  const [riskPreference, setRiskPreference] = useState(profile.riskPreference);
  const [workPace, setWorkPace] = useState(profile.workPace);
  const [communicationStyle, setCommunicationStyle] = useState(profile.communicationStyle);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(profile.accessibilityNeeds);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const selectedTechnologyIds = technologyIds ?? initialTechnologyIds;

  const addSocialLink = () => {
    const handle = socialHandle.trim().replace(/^@/, "");
    if (!handle || /\s/.test(handle) || handle.length > 64) return;
    setSocialLinks((current) => [
      // One entry per network — replacing feels natural when editing.
      ...current.filter((link) => link.type !== socialType),
      { type: socialType, handle },
    ]);
    setSocialHandle("");
  };

  // Links are OPTIONAL — empty strings clear them (the API accepts "" since v1.3).
  const requiredName = localText(
    profile.locale,
    "Enter a nickname.",
    "Введіть нікнейм.",
    "Wpisz pseudonim."
  );
  const validUrl = localText(
    profile.locale,
    "Enter a complete URL beginning with https://.",
    "Введіть повну URL-адресу, що починається з https://.",
    "Wpisz pełny adres URL zaczynający się od https://."
  );
  const schema = z.object({
    userName: z.string().min(1, requiredName).max(80, requiredName),
    userDescription: z.string().max(1000, messages.errors.generic),
    avatarUrl: z.string().max(2048),
    githubProfile: z.string().url(validUrl).max(2048, validUrl).or(z.literal("")),
    linkedInProfile: z.string().url(validUrl).max(2048, validUrl).or(z.literal("")),
    cv: z.string().url(validUrl).max(2048, validUrl).or(z.literal("")),
    isLookingForTeam: z.boolean(),
    technologyIds: z.array(z.number()),
  });

  const uploadAvatar = async (file: File) => {
    if (file.size > MAX_AVATAR_BYTES) {
      setMessage(messages.profile.avatarTooLarge);
      return;
    }
    setMessage("");
    setAvatarUploading(true);
    try {
      const result = await fileService.upload(file);
      setAvatarUrl(result.url);
    } catch (error) {
      setMessage(getApiError(error, messages.errors.generic).message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});
    const payload = {
      userName: userName.trim(),
      userDescription,
      avatarUrl,
      githubProfile: githubProfile.trim(),
      linkedInProfile: linkedInProfile.trim(),
      cv: cv.trim(),
      isLookingForTeam,
      technologyIds: selectedTechnologyIds,
      socialLinks,
      locale: profile.locale,
      timeZone: timeZone.trim() || "UTC",
      utcOffsetMinutes: -new Date().getTimezoneOffset(),
      availableFromMinutes: timeToMinutes(availableFrom),
      availableToMinutes: timeToMinutes(availableTo),
      hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
      experienceLevel,
      languages: languages
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
      collaborationGoal: collaborationGoal.trim(),
      riskPreference: riskPreference.trim(),
      workPace: workPace.trim(),
      communicationStyle: communicationStyle.trim(),
      accessibilityNeeds: accessibilityNeeds.trim(),
    };
    const result = schema.safeParse({ ...payload, socialLinks: undefined });
    if (!result.success) {
      const nextErrors: Partial<Record<ProfileField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          typeof field === "string" &&
          profileFieldNames.includes(field as ProfileField) &&
          !nextErrors[field as ProfileField]
        ) {
          nextErrors[field as ProfileField] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        window.requestAnimationFrame(() =>
          document.getElementById("profile-error-summary")?.focus()
        );
      } else {
        setMessage(result.error.issues[0]?.message ?? messages.errors.generic);
      }
      return;
    }
    try {
      await mutation.mutateAsync(payload);
      setMessage(messages.profile.updateSuccess);
    } catch (error) {
      setMessage(getApiError(error, messages.errors.generic).message);
    }
  };

  const fields = [
    ["githubProfile", messages.profile.github, githubProfile, setGithubProfile, 2048],
    ["linkedInProfile", messages.profile.linkedin, linkedInProfile, setLinkedInProfile, 2048],
    ["cv", messages.profile.cv, cv, setCv, 2048],
  ] as const;
  const fieldLabels: Record<ProfileField, string> = {
    userName: messages.profile.username,
    userDescription: messages.profile.description,
    githubProfile: messages.profile.github,
    linkedInProfile: messages.profile.linkedin,
    cv: messages.profile.cv,
  };
  const invalidFields = profileFieldNames.filter((field) => fieldErrors[field]);

  return (
    <form
      noValidate
      onSubmit={submit}
      className="rounded-3xl border border-border bg-surface/80 p-5 sm:p-8"
    >
      {invalidFields.length ? (
        <div
          id="profile-error-summary"
          role="alert"
          tabIndex={-1}
          className="focus-ring mb-5 rounded-2xl border border-destructive/35 bg-destructive/10 p-4"
        >
          <h2 className="font-semibold text-destructive">
            {localText(
              profile.locale,
              "Check the highlighted fields.",
              "Перевірте виділені поля.",
              "Sprawdź zaznaczone pola."
            )}
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive">
            {invalidFields.map((field) => (
              <li key={field}>
                <a className="underline underline-offset-2" href={`#profile-${field}`}>
                  {fieldLabels[field]}: {fieldErrors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Avatar */}
        <div className="sm:col-span-2">
          <p className="text-sm font-medium">{messages.profile.avatar}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <UserAvatar
              name={userName || profile.userName}
              avatarUrl={avatarUrl}
              className="size-20 rounded-3xl text-3xl"
            />
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarUploading
                    ? messages.profile.avatarUploading
                    : messages.profile.avatarUpload}
                </Button>
                {avatarUrl ? (
                  <Button type="button" variant="ghost" onClick={() => setAvatarUrl("")}>
                    {messages.profile.avatarRemove}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{messages.profile.avatarHint}</p>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadAvatar(file);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        <label className="grid gap-1.5 text-sm font-medium">
          {messages.profile.username}
          <Input
            id="profile-userName"
            type="text"
            value={userName}
            maxLength={80}
            onChange={(event) => {
              setUserName(event.target.value);
              setFieldErrors((current) => ({ ...current, userName: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.userName) || undefined}
            aria-describedby={fieldErrors.userName ? "profile-userName-error" : undefined}
          />
          {fieldErrors.userName ? (
            <span id="profile-userName-error" className="text-sm text-destructive">
              {fieldErrors.userName}
            </span>
          ) : null}
        </label>
        {fields.map(([field, label, value, setter, maxLength]) => (
          <label key={label} className="grid gap-1.5 text-sm font-medium">
            <span>
              {label}{" "}
              <span className="font-normal text-muted-foreground">
                ({messages.profile.optional})
              </span>
            </span>
            <Input
              id={`profile-${field}`}
              type="url"
              value={value}
              maxLength={maxLength}
              placeholder="https://"
              onChange={(event) => {
                setter(event.target.value);
                setFieldErrors((current) => ({ ...current, [field]: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors[field]) || undefined}
              aria-describedby={fieldErrors[field] ? `profile-${field}-error` : undefined}
            />
            {fieldErrors[field] ? (
              <span id={`profile-${field}-error`} className="text-sm text-destructive">
                {fieldErrors[field]}
              </span>
            ) : null}
          </label>
        ))}
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
          {messages.profile.description}
          <Textarea
            id="profile-userDescription"
            value={userDescription}
            maxLength={1000}
            placeholder={messages.profile.descriptionPlaceholder}
            onChange={(event) => {
              setUserDescription(event.target.value);
              setFieldErrors((current) => ({ ...current, userDescription: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.userDescription) || undefined}
            aria-describedby={
              fieldErrors.userDescription ? "profile-userDescription-error" : undefined
            }
            className="min-h-32"
          />
          {fieldErrors.userDescription ? (
            <span id="profile-userDescription-error" className="text-sm text-destructive">
              {fieldErrors.userDescription}
            </span>
          ) : null}
        </label>
        <div className="grid gap-1.5 text-sm font-medium sm:col-span-2">
          <span>{messages.profile.technologies}</span>
          <TechnologyPicker
            selected={selectedTechnologyIds}
            onChange={setTechnologyIds}
            labels={{
              placeholder: messages.profile.technologiesSelect,
              searchPlaceholder: messages.profile.technologiesSearch,
              addNew: messages.profile.technologiesAdd,
              adding: messages.profile.technologiesAdding,
              genericError: messages.errors.generic,
            }}
          />
        </div>
        <fieldset className="rounded-2xl border border-border p-4 sm:col-span-2">
          <legend className="px-1 text-base font-semibold">
            {localText(
              profile.locale,
              "Availability and collaboration fit",
              "Доступність і стиль співпраці",
              "Dostępność i styl współpracy"
            )}
          </legend>
          <p className="mt-1 text-xs text-muted-foreground">
            {localText(
              profile.locale,
              "These facts create transparent match explanations. Accessibility needs stay private.",
              "Ці дані дають прозорі пояснення match score. Accessibility needs залишаються приватними.",
              "Te dane tworzą przejrzyste wyjaśnienia dopasowania. Potrzeby dostępności pozostają prywatne."
            )}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Timezone", "Часовий пояс", "Strefa czasowa")}
              <Input
                value={timeZone}
                maxLength={64}
                onChange={(event) => setTimeZone(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(
                profile.locale,
                "Hours per week",
                "Годин на тиждень",
                "Godziny tygodniowo"
              )}
              <Input
                type="number"
                min={1}
                max={80}
                value={hoursPerWeek}
                onChange={(event) => setHoursPerWeek(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Available from", "Доступний(-а) з", "Dostępność od")}
              <Input
                type="time"
                value={availableFrom}
                onChange={(event) => setAvailableFrom(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Available to", "Доступний(-а) до", "Dostępność do")}
              <Input
                type="time"
                value={availableTo}
                onChange={(event) => setAvailableTo(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Experience level", "Рівень", "Poziom doświadczenia")}
              <select
                value={experienceLevel}
                onChange={(event) =>
                  setExperienceLevel(event.target.value as PrivateUser["experienceLevel"])
                }
                className="h-10 rounded-xl border border-input bg-surface px-3"
              >
                <option value="beginner">
                  {localText(profile.locale, "Beginner", "Початковий", "Początkujący")}
                </option>
                <option value="intermediate">
                  {localText(profile.locale, "Intermediate", "Середній", "Średniozaawansowany")}
                </option>
                <option value="advanced">
                  {localText(profile.locale, "Advanced", "Просунутий", "Zaawansowany")}
                </option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Languages", "Мови", "Języki")}
              <Input
                value={languages}
                onChange={(event) => setLanguages(event.target.value)}
                placeholder={localText(profile.locale, "en, uk", "uk, en", "pl, en")}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Goal", "Мета", "Cel")}
              <Input
                value={collaborationGoal}
                onChange={(event) => setCollaborationGoal(event.target.value)}
                placeholder={localText(
                  profile.locale,
                  "learn, launch, business",
                  "навчання, запуск, бізнес",
                  "nauka, start, biznes"
                )}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Pace", "Темп", "Tempo")}
              <Input
                value={workPace}
                onChange={(event) => setWorkPace(event.target.value)}
                placeholder={localText(
                  profile.locale,
                  "steady, sprint",
                  "стабільно, спринт",
                  "stabilnie, sprint"
                )}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(
                profile.locale,
                "Risk preference",
                "Ставлення до ризику",
                "Podejście do ryzyka"
              )}
              <Input
                value={riskPreference}
                onChange={(event) => setRiskPreference(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              {localText(profile.locale, "Communication", "Комунікація", "Komunikacja")}
              <Input
                value={communicationStyle}
                onChange={(event) => setCommunicationStyle(event.target.value)}
                placeholder={localText(
                  profile.locale,
                  "async, calls, mixed",
                  "асинхронно, дзвінки, змішано",
                  "asynchronicznie, rozmowy, mieszane"
                )}
              />
            </label>
            <label className="grid gap-1.5 text-sm sm:col-span-2">
              {localText(
                profile.locale,
                "Accessibility needs (private)",
                "Потреби доступності (приватно)",
                "Potrzeby dostępności (prywatne)"
              )}
              <Textarea
                value={accessibilityNeeds}
                maxLength={1000}
                onChange={(event) => setAccessibilityNeeds(event.target.value)}
              />
            </label>
          </div>
        </fieldset>
        {/* Social handles: pick a network, type the username, add. */}
        <div className="grid gap-1.5 text-sm font-medium sm:col-span-2">
          <span>
            {messages.profile.socialLinks}{" "}
            <span className="font-normal text-muted-foreground">({messages.profile.optional})</span>
          </span>
          <div className="grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
            <DropdownSelect
              value={socialType}
              onChange={setSocialType}
              ariaLabel={messages.profile.socialLinks}
              options={SOCIAL_NETWORKS.map((network) => ({
                value: network.id,
                label: network.label,
              }))}
            />
            <Input
              type="text"
              value={socialHandle}
              maxLength={64}
              placeholder={messages.profile.socialHandlePlaceholder}
              onChange={(event) => setSocialHandle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSocialLink();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={!socialHandle.trim()}
              onClick={addSocialLink}
            >
              {messages.profile.socialAdd}
            </Button>
          </div>
          {socialLinks.length ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {socialLinks.map((link) => (
                <span
                  key={link.type}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 py-1 pl-3 pr-1.5 text-xs font-medium text-foreground/85"
                >
                  <span className="font-semibold text-secondary">{socialLabel(link.type)}</span>@
                  {link.handle}
                  <button
                    type="button"
                    aria-label={`× ${socialLabel(link.type)}`}
                    onClick={() =>
                      setSocialLinks((current) => current.filter((x) => x.type !== link.type))
                    }
                    className="flex size-4.5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-secondary/25"
                  >
                    <svg
                      className="size-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <LookingForTeamToggle
            checked={isLookingForTeam}
            onChange={setIsLookingForTeam}
            label={messages.profile.looking}
          />
        </div>
      </div>
      {message ? (
        <p
          role={message === messages.profile.updateSuccess ? "status" : "alert"}
          className={`mt-4 text-sm ${message === messages.profile.updateSuccess ? "text-success" : "text-destructive"}`}
        >
          {message}
        </p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={mutation.isPending || avatarUploading}>
          {mutation.isPending ? messages.common.saving : messages.common.save}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {messages.common.cancel}
        </Button>
      </div>
    </form>
  );
}

function minutesToTime(value: number | null) {
  if (value === null) return "";
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function timeToMinutes(value: string) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
