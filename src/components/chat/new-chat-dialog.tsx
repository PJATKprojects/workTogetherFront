"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  useChatUserSearch,
  useCreateGroupConversation,
  useStartConversation,
} from "@/hooks/use-chat";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { ChatUser } from "@/types";

type ChatMode = "direct" | "group";

export function NewChatDialog({
  open,
  labels,
  onClose,
  onCreated,
}: Readonly<{
  open: boolean;
  labels: SiteMessages["chat"];
  onClose: () => void;
  onCreated: (conversationId: number) => void;
}>) {
  const [mode, setMode] = useState<ChatMode>("direct");
  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [selected, setSelected] = useState<ChatUser[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [clientRequestId, setClientRequestId] = useState(() => crypto.randomUUID());
  const search = useChatUserSearch(debouncedEmail, open);
  const startDirect = useStartConversation();
  const createGroup = useCreateGroupConversation();
  const pending = startDirect.isPending || createGroup.isPending;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedEmail(email), 300);
    return () => window.clearTimeout(timer);
  }, [email]);

  if (!open) return null;

  const resetAndClose = () => {
    setMode("direct");
    setEmail("");
    setDebouncedEmail("");
    setSelected([]);
    setTitle("");
    setMessage("");
    setError("");
    setClientRequestId(crypto.randomUUID());
    onClose();
  };

  const selectUser = (candidate: ChatUser) => {
    setError("");
    if (mode === "direct") {
      setSelected([candidate]);
      return;
    }
    setSelected((current) =>
      current.some((item) => item.id === candidate.id)
        ? current.filter((item) => item.id !== candidate.id)
        : [...current, candidate]
    );
  };

  const valid =
    message.trim().length > 0 &&
    (mode === "direct" ? selected.length === 1 : selected.length >= 2 && title.trim().length > 0);

  const create = async () => {
    if (!valid) {
      setError(mode === "direct" ? labels.chooseUser : labels.groupNeedsMembers);
      return;
    }
    setError("");
    try {
      const conversation =
        mode === "direct"
          ? await startDirect.mutateAsync({
              clientRequestId,
              recipientUserId: selected[0].id,
              contextType: "user",
              contextId: 0,
              message: message.trim(),
            })
          : await createGroup.mutateAsync({
              clientRequestId,
              title: title.trim(),
              participantUserIds: selected.map((item) => item.id),
              message: message.trim(),
            });
      resetAndClose();
      onCreated(conversation.id);
    } catch (reason) {
      setError(getApiError(reason, labels.loadError).message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={() => !pending && resetAndClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        className="glass-panel max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="new-chat-title" className="text-xl font-semibold">
            {labels.newChatTitle}
          </h2>
          <Button type="button" size="sm" variant="ghost" onClick={resetAndClose}>
            {labels.cancel}
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-2xl bg-muted p-1">
          {(["direct", "group"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`focus-ring rounded-xl px-3 py-2 text-sm font-semibold transition ${
                mode === item ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => {
                setMode(item);
                setSelected([]);
                setError("");
              }}
            >
              {item === "direct" ? labels.directChat : labels.groupChat}
            </button>
          ))}
        </div>

        {mode === "group" ? (
          <label className="mt-5 block text-sm font-medium">
            {labels.groupTitle}
            <Input
              value={title}
              maxLength={120}
              placeholder={labels.groupTitlePlaceholder}
              className="mt-2"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
        ) : null}

        <label className="mt-5 block text-sm font-medium">
          {labels.emailSearchPlaceholder}
          <Input
            type="text"
            value={email}
            autoComplete="off"
            placeholder="name@example.com"
            className="mt-2"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <div className="mt-2 min-h-11">
          {email.trim().length < 2 ? (
            <p className="text-xs text-muted-foreground">{labels.emailSearchHint}</p>
          ) : null}
          {search.isFetching ? (
            <p className="py-2 text-sm text-muted-foreground">{labels.searchingUsers}</p>
          ) : null}
          {!search.isFetching && debouncedEmail.trim().length >= 3 && search.data?.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">{labels.noUsersFound}</p>
          ) : null}
          {search.data?.length ? (
            <div className="grid max-h-52 gap-2 overflow-y-auto">
              {search.data.map((candidate) => {
                const isSelected = selected.some((item) => item.id === candidate.id);
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    className={`focus-ring flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-surface hover:bg-muted"
                    }`}
                    onClick={() => selectUser(candidate)}
                  >
                    <UserAvatar
                      name={candidate.userName}
                      avatarUrl={candidate.avatarUrl}
                      className="size-10 rounded-xl text-sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {candidate.userName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {candidate.email ? candidate.email : candidate.userName}
                      </span>
                    </span>
                    <span
                      className={`grid size-6 place-items-center rounded-full border text-xs ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input"
                      }`}
                    >
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {selected.length ? (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground">
              {(mode === "direct" ? labels.selectedUser : labels.selectedMembers).replace(
                "{count}",
                String(selected.length)
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  onClick={() =>
                    setSelected((current) => current.filter((item) => item.id !== member.id))
                  }
                >
                  {member.userName} ×
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Textarea
          value={message}
          maxLength={4000}
          rows={4}
          placeholder={labels.firstMessagePlaceholder}
          className="mt-5 min-h-28 resize-none"
          style={{ resize: "none" }}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void create();
            }
          }}
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">{message.length}/4000</div>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="ghost" disabled={pending} onClick={resetAndClose}>
            {labels.cancel}
          </Button>
          <Button type="button" disabled={!valid || pending} onClick={() => void create()}>
            {pending ? labels.creatingChat : labels.createChat}
          </Button>
        </div>
      </div>
    </div>
  );
}
