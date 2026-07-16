"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApplicationMutations } from "@/hooks/use-application-mutations";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";

export function ReviewActions({
  applicationId,
  projectId,
  messages,
}: Readonly<{ applicationId: number; projectId: number; messages: SiteMessages }>) {
  const { updateStatus } = useApplicationMutations(projectId);
  const [decision, setDecision] = useState<2 | 3 | null>(null);
  const [error, setError] = useState("");

  const confirm = async () => {
    if (!decision) return;
    setError("");
    try {
      await updateStatus.mutateAsync({ id: applicationId, statusId: decision });
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
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <ConfirmDialog
        open={decision !== null}
        title={
          decision === 2 ? messages.applications.confirmAccept : messages.applications.confirmReject
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
