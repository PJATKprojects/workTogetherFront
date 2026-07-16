"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApplicationMutations } from "@/hooks/use-application-mutations";
import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError, getApiStatus } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Apply flow: the button expands into a small inline form asking for the
 * required CV / LinkedIn / GitHub link (prefilled from the profile when
 * available) — the owner reviews candidates through that link.
 */
export function ApplyButton({
  projectId,
  positionId,
  locale,
  labels,
  errors,
  alreadyApplied = false,
}: Readonly<{
  projectId: number;
  positionId: number;
  locale: Locale;
  labels: SiteMessages["projects"];
  errors: SiteMessages["errors"];
  /** Server-computed: the current user already has an application here. */
  alreadyApplied?: boolean;
}>) {
  const { isAuthenticated, user } = useAuth();
  const { apply } = useApplicationMutations(projectId);
  const router = useRouter();
  const inputId = useId();
  const noteId = useId();
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const applied = alreadyApplied || message === labels.applied;

  const onOpen = () => {
    if (!isAuthenticated) {
      const returnUrl = withLocale(locale, `/projects/${projectId}`);
      router.push(
        `${withLocale(locale, "/auth/login")}?returnUrl=${encodeURIComponent(returnUrl)}`
      );
      return;
    }

    // Prefill with the best link we know about from the user's own profile.
    if (!link) {
      setLink(user?.cv || user?.linkedInProfile || user?.githubProfile || "");
    }
    setMessage("");
    setOpen(true);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = link.trim();
    if (!isHttpUrl(trimmed)) {
      setValidationError(labels.applyAttachInvalid);
      return;
    }

    setValidationError("");
    setMessage("");
    try {
      const trimmedNote = note.trim();
      await apply.mutateAsync({
        projectPositionId: positionId,
        attachmentUrl: trimmed,
        ...(trimmedNote ? { message: trimmedNote } : {}),
      });
      setMessage(labels.applied);
      setOpen(false);
    } catch (error) {
      const status = getApiStatus(error);
      if (status === 409) setMessage(labels.alreadyApplied);
      else if (status === 422) setMessage(getApiError(error, errors.businessRule).message);
      else if (status === 429) setMessage(errors.tooManyRequests);
      else setMessage(getApiError(error, errors.generic).message);
    }
  };

  if (!open || applied) {
    return (
      <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
        <Button type="button" disabled={apply.isPending || applied} onClick={onOpen}>
          {apply.isPending ? labels.applying : applied ? labels.applied : labels.apply}
        </Button>
        {message && !applied ? (
          <p className="max-w-xs text-xs text-destructive">{message}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl border border-border bg-surface-muted/70 p-4 sm:max-w-sm"
    >
      <p className="text-sm font-semibold text-foreground">{labels.applyAttachTitle}</p>
      <label htmlFor={inputId} className="mt-3 block text-xs font-medium text-muted-foreground">
        {labels.applyAttachLabel}
      </label>
      <Input
        id={inputId}
        type="url"
        inputMode="url"
        required
        value={link}
        onChange={(event) => setLink(event.target.value)}
        placeholder={labels.applyAttachPlaceholder}
        className="mt-1.5"
      />
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{labels.applyAttachHint}</p>
      <label htmlFor={noteId} className="mt-3 block text-xs font-medium text-muted-foreground">
        {labels.applyMessageLabel}
      </label>
      <Textarea
        id={noteId}
        value={note}
        maxLength={2000}
        onChange={(event) => setNote(event.target.value)}
        placeholder={labels.applyMessagePlaceholder}
        className="mt-1.5 min-h-24 text-sm"
      />
      {validationError ? <p className="mt-2 text-xs text-destructive">{validationError}</p> : null}
      {message && !applied ? <p className="mt-2 text-xs text-destructive">{message}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" disabled={apply.isPending}>
          {apply.isPending ? labels.applying : labels.applySubmit}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {labels.applyCancel}
        </Button>
      </div>
    </form>
  );
}
