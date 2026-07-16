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
import { getApiError } from "@/lib/api-error";
import { SOCIAL_NETWORKS, socialLabel } from "@/lib/socials";
import { fileService } from "@/services/fileService";
import type { SiteMessages } from "@/messages/types";
import type { PrivateUser, SocialLink } from "@/types";

import { LookingForTeamToggle } from "./looking-for-team-toggle";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

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
  const [message, setMessage] = useState("");
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
  const schema = z.object({
    userName: z.string().min(1).max(80),
    userDescription: z.string().max(1000),
    avatarUrl: z.string().max(2048),
    githubProfile: z.string().url().max(2048).or(z.literal("")),
    linkedInProfile: z.string().url().max(2048).or(z.literal("")),
    cv: z.string().url().max(2048).or(z.literal("")),
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
    };
    const result = schema.safeParse({ ...payload, socialLinks: undefined });
    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? messages.errors.generic);
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
    [messages.profile.github, githubProfile, setGithubProfile, 2048],
    [messages.profile.linkedin, linkedInProfile, setLinkedInProfile, 2048],
    [messages.profile.cv, cv, setCv, 2048],
  ] as const;

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-surface/80 p-5 sm:p-8">
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
            type="text"
            value={userName}
            maxLength={80}
            onChange={(event) => setUserName(event.target.value)}
          />
        </label>
        {fields.map(([label, value, setter, maxLength]) => (
          <label key={label} className="grid gap-1.5 text-sm font-medium">
            <span>
              {label}{" "}
              <span className="font-normal text-muted-foreground">
                ({messages.profile.optional})
              </span>
            </span>
            <Input
              type="url"
              value={value}
              maxLength={maxLength}
              placeholder="https://"
              onChange={(event) => setter(event.target.value)}
            />
          </label>
        ))}
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
          {messages.profile.description}
          <Textarea
            value={userDescription}
            maxLength={1000}
            placeholder={messages.profile.descriptionPlaceholder}
            onChange={(event) => setUserDescription(event.target.value)}
            className="min-h-32"
          />
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
