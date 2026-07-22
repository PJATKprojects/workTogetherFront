"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useProjectMutations } from "@/hooks/use-project-mutations";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { projectCopy } from "@/i18n/project-copy";
import { getApiError, getPlanLimitCode } from "@/lib/api-error";
import { proCopy } from "@/i18n/pro-copy";
import type { SiteMessages } from "@/messages/types";
import type { ProjectDetail } from "@/types";

export function ProjectOwnerControls({
  project,
  locale,
  messages,
  compact = false,
}: Readonly<{
  project: Pick<ProjectDetail, "id" | "isRecruitmentClosed" | "isHidden" | "archivedAt"> &
    Partial<Pick<ProjectDetail, "freshnessReviewRequiredAt">>;
  locale: Locale;
  messages: SiteMessages;
  compact?: boolean;
}>) {
  const router = useRouter();
  const exact = projectCopy(locale);
  const mutations = useProjectMutations(project.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [planLimited, setPlanLimited] = useState(false);
  const pending =
    mutations.closeRecruitment.isPending ||
    mutations.reopenRecruitment.isPending ||
    mutations.hide.isPending ||
    mutations.publish.isPending ||
    mutations.archive.isPending ||
    mutations.restore.isPending ||
    mutations.confirmFreshnessActive.isPending ||
    mutations.confirmFreshnessClose.isPending ||
    mutations.remove.isPending;

  const run = async (action: () => Promise<unknown>) => {
    setError("");
    setPlanLimited(false);
    try {
      await action();
    } catch (reason) {
      setPlanLimited(Boolean(getPlanLimitCode(reason)));
      setError(getApiError(reason, messages.projects.projectControlError).message);
    }
  };

  return (
    <>
      <div className={`flex flex-wrap justify-end gap-2 ${compact ? "w-full" : ""}`}>
        {project.freshnessReviewRequiredAt ? (
          <>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => void run(() => mutations.confirmFreshnessActive.mutateAsync())}
            >
              {exact.keepActive}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => void run(() => mutations.confirmFreshnessClose.mutateAsync())}
            >
              {exact.closeStale}
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            void run(() =>
              project.isRecruitmentClosed
                ? mutations.reopenRecruitment.mutateAsync()
                : mutations.closeRecruitment.mutateAsync()
            )
          }
        >
          {project.isRecruitmentClosed
            ? messages.projects.reopenRecruitment
            : messages.projects.closeRecruitment}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            void run(() =>
              project.isHidden ? mutations.publish.mutateAsync() : mutations.hide.mutateAsync()
            )
          }
        >
          {project.isHidden ? messages.projects.publishProject : messages.projects.hideProject}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            void run(() =>
              project.archivedAt ? mutations.restore.mutateAsync() : mutations.archive.mutateAsync()
            )
          }
        >
          {project.archivedAt
            ? localText(locale, "Restore", "Відновити з архіву", "Przywróć z archiwum")
            : localText(locale, "Archive", "Архівувати", "Archiwizuj")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
        >
          {messages.projects.deleteProject}
        </Button>
        {error ? (
          <div className="basis-full text-right text-xs text-destructive">
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
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={messages.projects.confirmDeleteProject}
        confirmLabel={messages.projects.deleteProject}
        cancelLabel={messages.common.cancel}
        danger
        pending={mutations.remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          void run(async () => {
            await mutations.remove.mutateAsync();
            router.replace(withLocale(locale, "/projects/my"));
          });
        }}
      />
    </>
  );
}
