"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  useAddGroupParticipant,
  useChatUserSearch,
  useLeaveGroup,
  useRemoveGroupParticipant,
  useSetGroupAdmin,
  useUpdateGroupTitle,
} from "@/hooks/use-chat";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";
import type { ChatUser, Conversation } from "@/types";

type Confirmation = { kind: "leave" } | { kind: "remove"; member: ChatUser } | null;

export function GroupManagementDialog({
  open,
  conversation,
  currentUserId,
  labels,
  cancelLabel,
  onClose,
  onLeft,
}: Readonly<{
  open: boolean;
  conversation: Conversation;
  currentUserId?: number;
  labels: SiteMessages["chat"];
  cancelLabel: string;
  onClose: () => void;
  onLeft: () => void;
}>) {
  const [title, setTitle] = useState(conversation.title ?? "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const search = useChatUserSearch(email, open && conversation.currentUserIsAdmin);
  const updateTitle = useUpdateGroupTitle(conversation.id);
  const addParticipant = useAddGroupParticipant(conversation.id);
  const removeParticipant = useRemoveGroupParticipant(conversation.id);
  const setAdmin = useSetGroupAdmin(conversation.id);
  const leaveGroup = useLeaveGroup(conversation.id);
  const pending =
    updateTitle.isPending ||
    addParticipant.isPending ||
    removeParticipant.isPending ||
    setAdmin.isPending ||
    leaveGroup.isPending;
  const availableUsers = (search.data ?? []).filter(
    (candidate) => !conversation.participants.some((member) => member.id === candidate.id)
  );

  if (!open) return null;

  const run = async (action: () => Promise<unknown>, after?: () => void) => {
    setError("");
    setSuccess("");
    try {
      await action();
      setSuccess(labels.groupUpdated);
      after?.();
    } catch (reason) {
      setError(getApiError(reason, labels.loadError).message);
    }
  };

  const confirmAction = async () => {
    if (!confirmation) return;
    if (confirmation.kind === "leave") {
      await run(
        () => leaveGroup.mutateAsync(undefined),
        () => {
          setConfirmation(null);
          onClose();
          onLeft();
        }
      );
      return;
    }
    await run(
      () => removeParticipant.mutateAsync(confirmation.member.id),
      () => {
        setConfirmation(null);
      }
    );
  };

  const confirmationTitle =
    confirmation?.kind === "remove"
      ? labels.removeMemberConfirm.replace("{name}", confirmation.member.userName)
      : labels.leaveGroupConfirm;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] flex justify-end bg-foreground/40 backdrop-blur-sm"
        onClick={() => !pending && onClose()}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="group-settings-title"
          className="h-full w-full max-w-lg overflow-y-auto border-l border-border bg-background p-4 shadow-2xl sm:p-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="group-settings-title" className="text-xl font-semibold">
              {labels.groupSettings}
            </h2>
            <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={onClose}>
              {cancelLabel}
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <UserAvatar
              name={conversation.title ?? labels.groupChat}
              className="size-14 rounded-2xl text-lg"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold">{conversation.title}</p>
              <p className="text-xs text-muted-foreground">
                {labels.participants.replace("{count}", String(conversation.participants.length))}
              </p>
            </div>
          </div>

          {conversation.currentUserIsAdmin ? (
            <>
              <label className="mt-6 block text-sm font-semibold">
                {labels.renameGroup}
                <div className="mt-2 flex gap-2">
                  <Input
                    value={title}
                    maxLength={120}
                    disabled={pending}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      pending || !title.trim() || title.trim() === (conversation.title ?? "").trim()
                    }
                    onClick={() => void run(() => updateTitle.mutateAsync(title.trim()))}
                  >
                    {labels.saveGroupTitle}
                  </Button>
                </div>
              </label>

              <div className="mt-6">
                <h3 className="text-sm font-semibold">{labels.addMember}</h3>
                <Input
                  type="email"
                  value={email}
                  autoComplete="off"
                  placeholder={labels.emailSearchPlaceholder}
                  className="mt-2"
                  disabled={pending}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {email.trim().length < 3 ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">{labels.emailSearchHint}</p>
                ) : null}
                {search.isFetching ? (
                  <p className="py-3 text-sm text-muted-foreground">{labels.searchingUsers}</p>
                ) : null}
                {!search.isFetching && email.trim().length >= 3 && availableUsers.length === 0 ? (
                  <p className="py-3 text-sm text-muted-foreground">{labels.noAvailableUsers}</p>
                ) : null}
                {availableUsers.length ? (
                  <div className="mt-2 grid max-h-44 gap-2 overflow-y-auto">
                    {availableUsers.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                      >
                        <UserAvatar
                          name={candidate.userName}
                          avatarUrl={candidate.avatarUrl}
                          className="size-9 rounded-xl text-xs"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {candidate.userName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {candidate.email}
                          </span>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            void run(
                              () => addParticipant.mutateAsync(candidate.id),
                              () => setEmail("")
                            )
                          }
                        >
                          {labels.addMember}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-6 rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
              {labels.onlyAdminsManage}
            </p>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold">
              {labels.groupMembers} · {conversation.participants.length}
            </h3>
            <div className="mt-2 grid gap-2">
              {[...conversation.participants]
                .sort((left, right) => Number(right.isAdmin) - Number(left.isAdmin))
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                  >
                    <UserAvatar
                      name={member.userName}
                      avatarUrl={member.avatarUrl}
                      className="size-10 rounded-xl text-sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {member.userName}
                        {member.id === currentUserId ? (
                          <span className="ml-1 font-normal text-muted-foreground">
                            · {labels.you}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`text-xs ${
                          member.isAdmin ? "font-semibold text-secondary" : "text-muted-foreground"
                        }`}
                      >
                        {member.isAdmin ? labels.administrator : labels.member}
                      </span>
                    </span>
                    {conversation.currentUserIsAdmin && member.id !== currentUserId ? (
                      <span className="flex flex-wrap justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() =>
                            void run(() =>
                              setAdmin.mutateAsync({
                                userId: member.id,
                                isAdmin: !member.isAdmin,
                              })
                            )
                          }
                        >
                          {member.isAdmin ? labels.removeAdmin : labels.makeAdmin}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          disabled={pending}
                          onClick={() => setConfirmation({ kind: "remove", member })}
                        >
                          {labels.removeMember}
                        </Button>
                      </span>
                    ) : null}
                  </div>
                ))}
            </div>
          </div>

          {success ? <p className="mt-4 text-sm text-success">{success}</p> : null}
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

          <div className="mt-8 border-t border-border pt-5">
            <Button
              type="button"
              variant="danger"
              disabled={pending}
              onClick={() => setConfirmation({ kind: "leave" })}
            >
              {labels.leaveGroup}
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmation !== null}
        title={confirmationTitle}
        confirmLabel={confirmation?.kind === "remove" ? labels.removeMember : labels.leaveGroup}
        cancelLabel={cancelLabel}
        danger
        pending={pending}
        onConfirm={() => void confirmAction()}
        onCancel={() => setConfirmation(null)}
      />
    </>
  );
}
