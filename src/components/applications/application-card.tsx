"use client";

import Link from "next/link";
import { useState } from "react";

import { ChatLauncher } from "@/components/chat/chat-launcher";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useApplicationMutations } from "@/hooks/use-application-mutations";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatDate } from "@/lib/format";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { ApplicationDto } from "@/types";

import { ApplicationStatusBadge } from "./application-status-badge";
import { ReviewActions } from "./review-actions";

export function ApplicationCard({
  application,
  locale,
  messages,
  ownerView = false,
}: Readonly<{
  application: ApplicationDto;
  locale: Locale;
  messages: SiteMessages;
  ownerView?: boolean;
}>) {
  const { withdraw } = useApplicationMutations(application.position.project.id);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [error, setError] = useState("");
  const pending = application.status.name.toLowerCase() === "pending";

  return (
    <article className="rounded-2xl border border-border bg-surface/80 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <ApplicationStatusBadge status={application.status.name} labels={messages.applications} />
          <h3 className="mt-3 text-lg font-semibold">
            {ownerView ? (
              // Owners jump straight into the applicant's public profile.
              <Link
                href={withLocale(locale, `/users/${application.applicant.id}`)}
                className="focus-ring inline-flex items-center gap-2.5 rounded-md transition-colors hover:text-primary-text hover:underline"
              >
                <UserAvatar
                  name={application.applicant.userName}
                  avatarUrl={application.applicant.avatarUrl}
                  className="size-9 rounded-xl text-sm"
                />
                {application.applicant.userName}
              </Link>
            ) : (
              application.position.project.projectName
            )}
          </h3>
          <dl className="mt-3 grid gap-1 text-sm text-muted-foreground">
            <div>
              <dt className="inline font-medium">{messages.applications.position}: </dt>
              <dd className="inline">{application.position.role.name}</dd>
            </div>
            <div>
              <dt className="inline font-medium">{messages.applications.appliedAt}: </dt>
              <dd className="inline">{formatDate(application.appliedAt, locale)}</dd>
            </div>
            {application.attachmentUrl ? (
              <div className="min-w-0">
                <dt className="inline font-medium">{messages.applications.attachment}: </dt>
                <dd className="inline">
                  <a
                    href={application.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-primary-text hover:underline"
                  >
                    {application.attachmentUrl}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {application.message ? (
            <figure className="mt-3 max-w-xl rounded-xl border-l-[3px] border-primary bg-primary-soft/60 px-4 py-3">
              <figcaption className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {messages.applications.message}
              </figcaption>
              <blockquote className="mt-1.5 whitespace-pre-line text-sm leading-6 text-foreground/90">
                {application.message}
              </blockquote>
            </figure>
          ) : null}
          {ownerView ? (
            <Link
              href={withLocale(locale, `/users/${application.applicant.id}`)}
              className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition duration-200 hover:border-input hover:bg-muted"
            >
              {messages.applications.viewProfile}
              <span aria-hidden>→</span>
            </Link>
          ) : null}
          {ownerView && application.applicant.technologies.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {application.applicant.technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {technology}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ChatLauncher
            recipientUserId={
              ownerView ? application.applicant.id : application.position.project.ownerId
            }
            recipientName={
              ownerView ? application.applicant.userName : application.position.project.ownerName
            }
            contextType="application"
            contextId={application.id}
            locale={locale}
            labels={messages.chat}
            compact
          />
          {ownerView && pending ? (
            <ReviewActions
              applicationId={application.id}
              projectId={application.position.project.id}
              messages={messages}
            />
          ) : !ownerView && pending ? (
            <Button type="button" variant="danger" onClick={() => setConfirmWithdraw(true)}>
              {messages.applications.withdraw}
            </Button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <ConfirmDialog
        open={confirmWithdraw}
        title={messages.applications.withdraw}
        confirmLabel={messages.applications.withdraw}
        cancelLabel={messages.common.cancel}
        danger
        pending={withdraw.isPending}
        onCancel={() => setConfirmWithdraw(false)}
        onConfirm={() => {
          setError("");
          void withdraw
            .mutateAsync(application.id)
            .then(() => setConfirmWithdraw(false))
            .catch((reason) => setError(getApiError(reason, messages.errors.generic).message));
        }}
      />
    </article>
  );
}
