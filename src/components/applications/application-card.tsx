"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ChatLauncher } from "@/components/chat/chat-launcher";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useApplicationMutations } from "@/hooks/use-application-mutations";
import { localizeRole, localizeStatus } from "@/i18n/lookups";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatDate } from "@/lib/format";
import { getApiError, getPlanLimitCode } from "@/lib/api-error";
import { proCopy } from "@/i18n/pro-copy";
import type { SiteMessages } from "@/messages/types";
import type { ApplicationDto, UpdateApplicationDraftDto } from "@/types";

import { ApplicationStatusBadge } from "./application-status-badge";
import { ReviewActions } from "./review-actions";

export function ApplicationCard({
  application,
  locale,
  messages,
  ownerView = false,
  alternatePositions,
}: Readonly<{
  application: ApplicationDto;
  locale: Locale;
  messages: SiteMessages;
  ownerView?: boolean;
  alternatePositions?: Array<{ id: number; name: string }>;
}>) {
  const { withdraw, submitDraft, updateDraft, expire } = useApplicationMutations(
    application.position.project.id
  );
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [editingDraft, setEditingDraft] = useState(false);
  const [error, setError] = useState("");
  const [planLimited, setPlanLimited] = useState(false);
  const pending = [1, 5, 6, 7, 8].includes(application.status.id);
  const [canExpire, setCanExpire] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCanExpire(
        pending &&
          new Date(application.appliedAt).getTime() <= Date.now() - 14 * 24 * 60 * 60 * 1000
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [application.appliedAt, pending]);

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
              <dd className="inline">{localizeRole(application.position.role, locale)}</dd>
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
          {application.whyProject || application.firstWeekPlan || application.availability ? (
            <dl className="mt-3 grid gap-2 rounded-xl bg-surface-muted p-3 text-sm">
              {application.whyProject ? (
                <div>
                  <dt className="font-semibold">
                    {localText(
                      locale,
                      "Why this project",
                      "Чому цей проєкт",
                      "Dlaczego ten projekt"
                    )}
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-muted-foreground">
                    {application.whyProject}
                  </dd>
                </div>
              ) : null}
              {application.firstWeekPlan ? (
                <div>
                  <dt className="font-semibold">
                    {localText(locale, "First week", "Перший тиждень", "Pierwszy tydzień")}
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-muted-foreground">
                    {application.firstWeekPlan}
                  </dd>
                </div>
              ) : null}
              {application.availability ? (
                <div>
                  <dt className="font-semibold">
                    {localText(locale, "Availability", "Доступність", "Dostępność")}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{application.availability}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {application.timeline.length ? (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-semibold">
                {localText(locale, "Status timeline", "Історія статусів", "Historia statusów")}
              </summary>
              <ol className="mt-2 space-y-2 border-l border-border pl-4">
                {application.timeline.map((item) => (
                  <li key={item.id}>
                    <span className="font-medium">
                      {localizeStatus({ name: item.toStatusName }, locale)}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDate(item.createdAt, locale)}
                    </span>
                    {item.reasonCategory ? (
                      <p className="text-xs text-muted-foreground">{item.reasonCategory}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
          {application.proposedProjectPositionId ? (
            <p className="mt-3 rounded-xl border border-primary/30 bg-primary-soft p-3 text-sm">
              <strong>
                {localText(
                  locale,
                  "Alternate position offered:",
                  "Запропонована інша позиція:",
                  "Zaproponowano inną rolę:"
                )}
              </strong>{" "}
              #{application.proposedProjectPositionId}
            </p>
          ) : null}
          {!ownerView && application.status.id === 2 ? (
            <div className="mt-4 rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success-soft-foreground">
              <p className="font-semibold">
                {localText(
                  locale,
                  "You’re accepted — next steps",
                  "Вас прийнято — наступні кроки",
                  "Przyjęto Cię — kolejne kroki"
                )}
              </p>
              <ul className="mt-2 list-disc pl-5">
                <li>
                  {localText(
                    locale,
                    "Open the team chat",
                    "Відкрийте командний чат",
                    "Otwórz czat zespołu"
                  )}
                </li>
                <li>
                  {localText(
                    locale,
                    "Agree on the team charter",
                    "Узгодьте team charter",
                    "Uzgodnijcie kartę zespołu"
                  )}
                </li>
                <li>
                  {localText(
                    locale,
                    "Plan a 2–4 week trial deliverable",
                    "Заплануйте deliverable на 2–4 тижні",
                    "Zaplanuj rezultat próbny na 2–4 tygodnie"
                  )}
                </li>
              </ul>
              <Link
                href={withLocale(locale, `/projects/${application.position.project.id}/team`)}
                className="mt-3 inline-flex font-semibold underline"
              >
                {localText(
                  locale,
                  "Open team workspace",
                  "Відкрити командний простір",
                  "Otwórz przestrzeń zespołu"
                )}
              </Link>
            </div>
          ) : null}
          {!ownerView && application.status.id === 3 ? (
            <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              {localText(
                locale,
                "This decision only concerns this role. Browse similar open projects when you’re ready.",
                "Це рішення стосується лише цієї ролі. Перегляньте схожі відкриті проєкти.",
                "Ta decyzja dotyczy tylko tej roli. Gdy będziesz gotowy(-a), zobacz podobne otwarte projekty."
              )}{" "}
              <Link
                href={withLocale(locale, "/projects")}
                className="font-semibold text-primary-text underline"
              >
                {localText(locale, "See alternatives", "Альтернативи", "Zobacz alternatywy")}
              </Link>
            </p>
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
          {application.status.id !== 4 ? (
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
          ) : null}
          {ownerView && pending ? (
            <ReviewActions
              applicationId={application.id}
              projectId={application.position.project.id}
              messages={messages}
              locale={locale}
              currentStatusId={application.status.id}
              alternatePositions={alternatePositions}
            />
          ) : !ownerView && application.status.id === 4 ? (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={updateDraft.isPending}
                onClick={() => setEditingDraft((value) => !value)}
              >
                {localText(locale, "Edit draft", "Редагувати чернетку", "Edytuj wersję roboczą")}
              </Button>
              <Button
                type="button"
                disabled={submitDraft.isPending}
                onClick={() => {
                  setError("");
                  setPlanLimited(false);
                  void submitDraft.mutateAsync(application.id).catch((reason) => {
                    setPlanLimited(Boolean(getPlanLimitCode(reason)));
                    setError(getApiError(reason, messages.errors.generic).message);
                  });
                }}
              >
                {localText(locale, "Submit draft", "Надіслати чернетку", "Wyślij wersję roboczą")}
              </Button>
              <Button type="button" variant="danger" onClick={() => setConfirmWithdraw(true)}>
                {messages.applications.withdraw}
              </Button>
            </>
          ) : !ownerView && pending ? (
            <>
              {canExpire ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={expire.isPending}
                  onClick={() => void expire.mutateAsync(application.id)}
                >
                  {localText(
                    locale,
                    "Close as expired",
                    "Закрити як expired",
                    "Zamknij jako wygasłe"
                  )}
                </Button>
              ) : null}
              <Button type="button" variant="danger" onClick={() => setConfirmWithdraw(true)}>
                {messages.applications.withdraw}
              </Button>
            </>
          ) : null}
        </div>
      </div>
      {editingDraft ? (
        <DraftEditor
          application={application}
          locale={locale}
          pending={updateDraft.isPending}
          onCancel={() => setEditingDraft(false)}
          onSave={async (value) => {
            setError("");
            try {
              await updateDraft.mutateAsync({ id: application.id, value });
              setEditingDraft(false);
            } catch (reason) {
              setError(getApiError(reason, messages.errors.generic).message);
            }
          }}
        />
      ) : null}
      {error ? (
        <div className="mt-3 text-sm text-destructive">
          <p>{error}</p>
          {planLimited ? (
            <Link
              href={withLocale(locale, "/pro")}
              className="mt-1 inline-flex font-semibold underline underline-offset-2"
            >
              {proCopy(locale).upgrade}
            </Link>
          ) : null}
        </div>
      ) : null}
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

function DraftEditor({
  application,
  locale,
  pending,
  onSave,
  onCancel,
}: Readonly<{
  application: ApplicationDto;
  locale: Locale;
  pending: boolean;
  onSave: (value: UpdateApplicationDraftDto) => Promise<void>;
  onCancel: () => void;
}>) {
  const [attachmentUrl, setAttachmentUrl] = useState(application.attachmentUrl);
  const [message, setMessage] = useState(application.message ?? "");
  const [whyProject, setWhyProject] = useState(application.whyProject);
  const [firstWeekPlan, setFirstWeekPlan] = useState(application.firstWeekPlan);
  const [availability, setAvailability] = useState(application.availability);

  return (
    <form
      className="mt-5 grid gap-3 rounded-2xl border border-border bg-surface-muted p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave({
          attachmentUrl: attachmentUrl.trim(),
          message: message.trim(),
          whyProject: whyProject.trim(),
          firstWeekPlan: firstWeekPlan.trim(),
          availability: availability.trim(),
        });
      }}
    >
      <p className="text-sm font-semibold">
        {localText(
          locale,
          "Only you can see this draft",
          "Чернетку бачите лише ви",
          "Tylko Ty widzisz tę wersję roboczą"
        )}
      </p>
      <Input
        type="url"
        value={attachmentUrl}
        onChange={(event) => setAttachmentUrl(event.target.value)}
        placeholder={localText(
          locale,
          "CV, GitHub, or portfolio link",
          "Посилання на CV, GitHub або портфоліо",
          "Link do CV, GitHub albo portfolio"
        )}
      />
      <Textarea
        value={message}
        maxLength={2000}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={localText(
          locale,
          "Short note to the owner",
          "Коротке повідомлення власнику",
          "Krótka wiadomość do właściciela"
        )}
      />
      <Textarea
        value={whyProject}
        maxLength={2000}
        onChange={(event) => setWhyProject(event.target.value)}
        placeholder={localText(
          locale,
          "Why this project",
          "Чому цей проєкт",
          "Dlaczego ten projekt"
        )}
      />
      <Textarea
        value={firstWeekPlan}
        maxLength={2000}
        onChange={(event) => setFirstWeekPlan(event.target.value)}
        placeholder={localText(
          locale,
          "What you can do in week one",
          "Що зробите за перший тиждень",
          "Co możesz zrobić w pierwszym tygodniu"
        )}
      />
      <Input
        value={availability}
        maxLength={500}
        onChange={(event) => setAvailability(event.target.value)}
        placeholder={localText(locale, "Availability", "Доступність", "Dostępność")}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {localText(locale, "Save changes", "Зберегти зміни", "Zapisz zmiany")}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {localText(locale, "Cancel", "Скасувати", "Anuluj")}
        </Button>
      </div>
    </form>
  );
}
