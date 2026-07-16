"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSaveUserNote, useUserNoteQuery } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import type { SiteMessages } from "@/messages/types";

export function PersonalNoteEditor({
  targetUserId,
  labels,
}: Readonly<{ targetUserId: number; labels: SiteMessages["chat"] }>) {
  const { user, isAuthenticated } = useAuth();
  const enabled = isAuthenticated && user?.id !== targetUserId;
  const query = useUserNoteQuery(targetUserId, enabled);
  const mutation = useSaveUserNote(targetUserId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ targetUserId: number; text: string } | null>(null);
  const [savedFor, setSavedFor] = useState<number | null>(null);
  const text = draft?.targetUserId === targetUserId ? draft.text : (query.data?.text ?? "");

  if (!enabled) return null;

  return (
    <section className="rounded-xl border border-secondary/20 bg-secondary/5 px-2.5 py-2">
      <button
        type="button"
        className="focus-ring flex w-full items-center gap-2 rounded-lg text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="shrink-0 text-xs font-semibold text-secondary">{labels.personalNote}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
          {text || labels.noteHint}
        </span>
        <span className="text-xs text-muted-foreground" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open ? (
        <>
          <Textarea
            value={text}
            maxLength={1000}
            rows={2}
            disabled={query.isLoading || mutation.isPending}
            placeholder={labels.notePlaceholder}
            className="mt-2 h-12 min-h-12 resize-none bg-surface/80 py-1.5 text-xs"
            style={{ resize: "none" }}
            onChange={(event) => {
              setSavedFor(null);
              setDraft({ targetUserId, text: event.target.value });
            }}
          />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-[11px] text-success">
              {savedFor === targetUserId ? labels.noteSaved : ""}
            </span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="min-h-7 px-2.5 text-xs"
              disabled={mutation.isPending}
              onClick={() => {
                void mutation.mutateAsync(text).then(() => {
                  setDraft({ targetUserId, text });
                  setSavedFor(targetUserId);
                  setOpen(false);
                });
              }}
            >
              {labels.saveNote}
            </Button>
          </div>
        </>
      ) : null}
    </section>
  );
}
