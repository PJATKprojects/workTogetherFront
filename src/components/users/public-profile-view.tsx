"use client";

import Link from "next/link";
import { useState } from "react";

import { ChatLauncher } from "@/components/chat/chat-launcher";
import { PersonalNoteEditor } from "@/components/chat/personal-note-editor";
import { UserSafetyActions } from "@/components/moderation/user-safety-actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUserQuery } from "@/hooks/use-user-query";
import type { Locale } from "@/i18n/locales";
import { localText } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError, getApiStatus } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { socialLabel, socialUrl } from "@/lib/socials";
import type { SiteMessages } from "@/messages/types";
import type { SocialLink } from "@/types";

/**
 * Public profile — what project owners open from an application to evaluate a
 * candidate: bio, technologies, and outbound links. Email/CV are intentionally
 * absent (the API never exposes them publicly).
 */
export function PublicProfileView({
  userId,
  locale,
  messages,
}: Readonly<{ userId: number; locale: Locale; messages: SiteMessages }>) {
  const t = messages.publicProfile;
  const query = useUserQuery(userId);

  if (query.isLoading) return <LoadingSkeleton />;

  if (query.isError || !query.data) {
    if (getApiStatus(query.error) === 404) {
      return (
        <EmptyState
          title={t.notFoundTitle}
          body={t.notFoundBody}
          action={
            <Link
              href={withLocale(locale, "/students")}
              className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary-hover"
            >
              {t.backToStudents}
            </Link>
          }
        />
      );
    }
    return (
      <ErrorState
        message={getApiError(query.error, messages.errors.generic).message}
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const user = query.data;
  const links = [
    user.githubProfile ? { label: t.github, href: user.githubProfile } : null,
    user.linkedInProfile ? { label: t.linkedin, href: user.linkedInProfile } : null,
  ].filter((link): link is { label: string; href: string } => link !== null);

  return (
    <article className="glass-card overflow-hidden rounded-3xl">
      <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={user.userName}
            avatarUrl={user.avatarUrl}
            className="size-16 rounded-2xl text-2xl"
          />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              {user.userName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.memberSince} {formatDate(user.createdAt, locale)}
            </p>
            {(user.verificationBadges ?? []).length ? (
              <ul
                aria-label={localText(
                  locale,
                  "Independent verifications",
                  "Незалежні підтвердження",
                  "Niezależne weryfikacje"
                )}
                className="mt-3 flex flex-wrap gap-2"
              >
                {(user.verificationBadges ?? []).map((verification) => (
                  <li key={`${verification.type}-${verification.label}`}>
                    <Badge tone={verificationTone(verification.type)}>
                      {verificationLabel(locale, verification.type, verification.label)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {user.isLookingForTeam ? <Badge tone="green">{t.lookingForTeam}</Badge> : null}
          <ChatLauncher
            recipientUserId={user.id}
            recipientName={user.userName}
            contextType="user"
            locale={locale}
            labels={messages.chat}
            variant="primary"
          />
          <UserSafetyActions userId={user.id} locale={locale} />
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <p className="whitespace-pre-line text-[15px] leading-7 text-muted-foreground">
            {user.userDescription || t.noBio}
          </p>

          {user.technologies.length ? (
            <div className="mt-7">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t.technologiesTitle}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary-soft-foreground"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-7">
            <PersonalNoteEditor targetUserId={user.id} labels={messages.chat} />
          </div>
        </div>

        {links.length || user.socialLinks.length ? (
          <aside>
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t.linksTitle}
            </h2>
            <div className="mt-3 grid gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition duration-200 hover:-translate-y-px hover:border-primary/40"
                >
                  <span className="truncate">{link.label}</span>
                  <span aria-hidden className="text-muted-foreground">
                    ↗
                  </span>
                </a>
              ))}
              {user.socialLinks.map((social) => (
                <SocialLinkCard key={social.type} social={social} copiedLabel={t.copied} />
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </article>
  );
}

function verificationLabel(locale: Locale, type: string, fallback: string) {
  if (type === "email")
    return localText(locale, "Email verified", "Email підтверджено", "E-mail zweryfikowany");
  if (type === "github")
    return localText(locale, "GitHub linked", "GitHub підключено", "GitHub połączony");
  if (type === "completed_collaboration")
    return localText(
      locale,
      "Completed collaboration",
      "Завершена співпраця",
      "Ukończona współpraca"
    );
  return fallback;
}

function verificationTone(type: string): "blue" | "green" | "yellow" | "neutral" {
  if (type === "email") return "blue";
  if (type === "github") return "yellow";
  if (type === "completed_collaboration") return "green";
  return "neutral";
}

/**
 * One social handle: networks with a public URL open in a new tab; copy-only
 * networks (Discord) copy the handle to the clipboard instead.
 */
function SocialLinkCard({
  social,
  copiedLabel,
}: Readonly<{ social: SocialLink; copiedLabel: string }>) {
  const [copied, setCopied] = useState(false);
  const href = socialUrl(social);
  const cls =
    "focus-ring flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition duration-200 hover:-translate-y-px hover:border-secondary/50";
  const body = (
    <>
      <span className="min-w-0 truncate">
        {socialLabel(social.type)}
        <span className="ml-1.5 font-normal text-muted-foreground">@{social.handle}</span>
      </span>
      <span aria-hidden className="shrink-0 text-muted-foreground">
        {href ? "↗" : copied ? "✓" : "⧉"}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {body}
      </a>
    );
  }

  return (
    <button
      type="button"
      title={copied ? copiedLabel : `@${social.handle}`}
      onClick={() => {
        void navigator.clipboard?.writeText(social.handle).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      className={`${cls} cursor-pointer text-left`}
    >
      {body}
    </button>
  );
}
