"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStartConversation } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { ChatContextType } from "@/types";

export function ChatLauncher({
  recipientUserId,
  recipientName,
  contextType,
  contextId = 0,
  locale,
  labels,
  variant = "secondary",
  compact = false,
}: Readonly<{
  recipientUserId: number;
  recipientName: string;
  contextType: ChatContextType;
  contextId?: number;
  locale: Locale;
  labels: SiteMessages["chat"];
  variant?: "primary" | "secondary" | "accent" | "ghost";
  compact?: boolean;
}>) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const mutation = useStartConversation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const closeComposer = useCallback(() => {
    if (!mutation.isPending) setOpen(false);
  }, [mutation.isPending]);
  const dialogRef = useDialogFocus<HTMLDivElement>(open, closeComposer);

  if (user?.id === recipientUserId) return null;

  const openComposer = () => {
    if (!isAuthenticated) {
      router.push(withLocale(locale, "/auth/login"));
      return;
    }
    setError("");
    setOpen(true);
  };

  const send = async () => {
    if (!message.trim()) return;
    setError("");
    try {
      const conversation = await mutation.mutateAsync({
        recipientUserId,
        contextType,
        contextId,
        message: message.trim(),
      });
      setOpen(false);
      setMessage("");
      router.push(withLocale(locale, `/messages?conversation=${conversation.id}`));
    } catch (reason) {
      setError(getApiError(reason, labels.loadError).message);
    }
  };

  return (
    <>
      <Button
        type="button"
        size={compact ? "sm" : "md"}
        variant={variant}
        className="relative z-10"
        onClick={openComposer}
      >
        <MessageIcon />
        {labels.writeMessage}
      </Button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
              onClick={closeComposer}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="chat-composer-title"
                ref={dialogRef}
                tabIndex={-1}
                className="glass-panel max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="chat-composer-title" className="text-xl font-semibold">
                  {labels.writeTo.replace("{name}", recipientName)}
                </h2>
                <Textarea
                  autoFocus
                  data-dialog-initial-focus
                  maxLength={4000}
                  value={message}
                  placeholder={labels.firstMessagePlaceholder}
                  className="mt-4 min-h-36 resize-none"
                  style={{ resize: "none" }}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                />
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {message.length}/4000
                </div>
                {error ? (
                  <p className="mt-2 text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="mt-5 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={closeComposer}
                  >
                    {labels.cancel}
                  </Button>
                  <Button
                    type="button"
                    disabled={!message.trim() || mutation.isPending}
                    onClick={() => void send()}
                  >
                    {mutation.isPending ? labels.sending : labels.send}
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function MessageIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}
