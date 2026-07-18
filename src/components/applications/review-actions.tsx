"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApplicationMutations } from "@/hooks/use-application-mutations";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import { localText, type Locale } from "@/i18n/locales";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export function ReviewActions({
  applicationId,
  projectId,
  messages,
  locale,
  currentStatusId,
  alternatePositions,
}: Readonly<{
  applicationId: number;
  projectId: number;
  messages: SiteMessages;
  locale: Locale;
  currentStatusId: number;
  alternatePositions?: Array<{ id: number; name: string }>;
}>) {
  const { updateStatus } = useApplicationMutations(projectId);
  const [decision, setDecision] = useState<2 | 3 | 6 | 7 | 8 | null>(null);
  const [rejectionReason, setRejectionReason] = useState("other");
  const [rejectionComment, setRejectionComment] = useState("");
  const [proposedPositionId, setProposedPositionId] = useState("");
  const [error, setError] = useState("");

  const confirm = async () => {
    if (!decision) return;
    setError("");
    try {
      await updateStatus.mutateAsync({
        id: applicationId,
        statusId: decision,
        details:
          decision === 3
            ? {
                rejectionReasonCategory: rejectionReason,
                rejectionComment: rejectionComment.trim() || undefined,
                proposedProjectPositionId: proposedPositionId
                  ? Number(proposedPositionId)
                  : undefined,
              }
            : undefined,
      });
      setDecision(null);
    } catch (reason) {
      setError(getApiError(reason, messages.errors.generic).message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setDecision(2)}>
          {messages.applications.accept}
        </Button>
        <Button type="button" variant="danger" onClick={() => setDecision(3)}>
          {messages.applications.reject}
        </Button>
        {[1, 5].includes(currentStatusId) ? (
          <Button type="button" variant="secondary" onClick={() => setDecision(6)}>
            {localText(locale, "Shortlist", "Короткий список", "Krótka lista")}
          </Button>
        ) : null}
        {[1, 5, 6].includes(currentStatusId) ? (
          <Button type="button" variant="secondary" onClick={() => setDecision(7)}>
            {localText(locale, "Interview", "Інтерв’ю", "Rozmowa")}
          </Button>
        ) : null}
        {[6, 7].includes(currentStatusId) ? (
          <Button type="button" variant="secondary" onClick={() => setDecision(8)}>
            {localText(locale, "Trial", "Пробний етап", "Etap próbny")}
          </Button>
        ) : null}
      </div>
      {decision === 3 ? (
        <div className="mt-3 grid gap-2 rounded-xl border border-border p-3">
          <label className="text-xs font-semibold">
            {localText(
              locale,
              "Safe reason category",
              "Безпечна категорія причини",
              "Bezpieczna kategoria powodu"
            )}
            <Select
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              className="mt-1"
            >
              <option value="skills">
                {localText(locale, "Skills", "Навички", "Umiejętności")}
              </option>
              <option value="availability">
                {localText(locale, "Availability", "Доступність", "Dostępność")}
              </option>
              <option value="experience">
                {localText(locale, "Experience", "Досвід", "Doświadczenie")}
              </option>
              <option value="position_filled">
                {localText(locale, "Position filled", "Позицію закрито", "Rola obsadzona")}
              </option>
              <option value="project_changed">
                {localText(locale, "Project changed", "Проєкт змінився", "Projekt się zmienił")}
              </option>
              <option value="other">{localText(locale, "Other", "Інше", "Inny")}</option>
            </Select>
          </label>
          <label className="text-xs font-semibold">
            {localText(
              locale,
              "Personal comment (optional)",
              "Особистий коментар (необов’язково)",
              "Osobisty komentarz (opcjonalnie)"
            )}
            <Textarea
              value={rejectionComment}
              onChange={(event) => setRejectionComment(event.target.value)}
              maxLength={2000}
              className="mt-1 min-h-20"
            />
          </label>
        </div>
      ) : null}
      {decision === 3 && alternatePositions?.length ? (
        <label className="mt-3 block rounded-xl border border-primary/30 bg-primary-soft p-3 text-xs font-semibold">
          {localText(
            locale,
            "Offer another position instead of a new manual application",
            "Запропонувати іншу позицію замість нової ручної заявки",
            "Zaproponuj inną rolę bez tworzenia nowego zgłoszenia"
          )}
          <Select
            value={proposedPositionId}
            onChange={(event) => setProposedPositionId(event.target.value)}
            className="mt-2"
          >
            <option value="">
              {localText(
                locale,
                "No alternate position",
                "Не пропонувати",
                "Nie proponuj innej roli"
              )}
            </option>
            {alternatePositions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </Select>
        </label>
      ) : null}
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <ConfirmDialog
        open={decision !== null}
        title={
          decision === 2
            ? messages.applications.confirmAccept
            : decision === 3
              ? messages.applications.confirmReject
              : localText(
                  locale,
                  "Change application status?",
                  "Змінити статус заявки?",
                  "Zmienić status zgłoszenia?"
                )
        }
        confirmLabel={messages.common.confirm}
        cancelLabel={messages.common.cancel}
        danger={decision === 3}
        pending={updateStatus.isPending}
        onCancel={() => setDecision(null)}
        onConfirm={() => void confirm()}
      />
    </div>
  );
}
