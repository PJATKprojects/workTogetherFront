"use client";

import Link from "next/link";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useApplicationsBadge } from "@/hooks/use-applications-badge";
import { useProfileQuery } from "@/hooks/use-profile-query";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";

export function ProfileContent({
  locale,
  messages,
}: Readonly<{ locale: Locale; messages: SiteMessages }>) {
  const query = useProfileQuery();
  const pendingApplications = useApplicationsBadge(true);
  const labels = messages.profile;

  if (query.isLoading)
    return (
      <div className="mt-6">
        <LoadingSkeleton count={1} />
      </div>
    );
  if (query.isError)
    return (
      <div className="mt-6">
        <ErrorState
          message={labels.loadError}
          retryLabel={messages.common.retry}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  if (!query.data) return <p className="mt-3 text-muted-foreground">{labels.noData}</p>;
  const profile = query.data;

  const fields = [
    [labels.username, profile.userName],
    [labels.email, profile.userEmail],
    [labels.emailStatus, profile.isConfirmed ? labels.confirmed : labels.notConfirmed],
    [labels.teamStatus, profile.isLookingForTeam ? labels.looking : labels.notLooking],
    [labels.github, profile.githubProfile || messages.common.notSpecified],
    [labels.linkedin, profile.linkedInProfile || messages.common.notSpecified],
    [
      labels.technologies,
      profile.technologies.length ? profile.technologies.join(", ") : messages.common.notSpecified,
    ],
  ];

  return (
    <>
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface/80 p-4">
        <UserAvatar
          name={profile.userName}
          avatarUrl={profile.avatarUrl}
          className="size-16 rounded-2xl text-2xl"
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{profile.userName}</p>
          {profile.userDescription ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {profile.userDescription}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <ProfileField key={label} label={label} value={value} />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={withLocale(locale, "/profile/edit")}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary-hover"
        >
          {labels.edit}
        </Link>
        <Link
          href={withLocale(locale, "/applications")}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          {messages.nav.myApplications}
        </Link>
        <Link
          href={withLocale(locale, "/projects/my")}
          className="relative rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          {labels.myProjects}
          {pendingApplications > 0 ? (
            <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {pendingApplications > 99 ? "99+" : pendingApplications}
            </span>
          ) : null}
        </Link>
        <Link
          href={withLocale(locale, "/messages")}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          {messages.nav.messages}
        </Link>
      </div>
    </>
  );
}

function ProfileField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm text-foreground">{value}</p>
    </div>
  );
}
