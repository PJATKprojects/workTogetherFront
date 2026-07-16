"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { GroupManagementDialog } from "@/components/chat/group-management-dialog";
import { PersonalNoteEditor } from "@/components/chat/personal-note-editor";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  useChatMessagesQuery,
  useConversationsQuery,
  useMarkConversationRead,
  useSendChatMessage,
} from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { chatContextHref, chatContextLabel } from "@/lib/chat-context";
import { resolveFileUrl } from "@/lib/files";
import type { SiteMessages } from "@/messages/types";
import { fileService } from "@/services/fileService";
import type { ChatAttachment, Conversation } from "@/types";

export function MessageCenter({
  locale,
  messages: siteMessages,
}: Readonly<{ locale: Locale; messages: SiteMessages }>) {
  const labels = siteMessages.chat;
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = Number(searchParams.get("conversation"));
  const initialConversationPage = Math.max(1, Number(searchParams.get("chatPage")) || 1);
  const [conversationPage, setConversationPage] = useState(initialConversationPage);
  const [chatSearch, setChatSearch] = useState("");
  const conversations = useConversationsQuery({
    page: conversationPage,
    pageSize: 12,
    search: chatSearch.trim() || undefined,
  });
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const selectedConversation = conversations.data?.items.find(
    (item) => item.id === selectedConversationId
  );
  const requestedConversation = conversations.data?.items.find((item) => item.id === requestedId);
  const active =
    selectedConversation ?? requestedConversation ?? conversations.data?.items[0] ?? null;
  const activeId = active?.id ?? 0;
  const thread = useChatMessagesQuery(activeId);
  const markRead = useMarkConversationRead();
  const sendMessage = useSendChatMessage(activeId);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatMessages = useMemo(
    () => (thread.data ? [...thread.data.pages].reverse().flatMap((page) => page.items) : []),
    [thread.data]
  );
  const latestMessageId = chatMessages.at(-1)?.id;

  useEffect(() => {
    if (active?.unreadCount && thread.data) markRead.mutate(active.id);
  }, [active?.id, active?.unreadCount, markRead, thread.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId, latestMessageId]);

  if (conversations.isLoading) return <LoadingSkeleton count={3} />;
  if (conversations.isError) {
    return (
      <ErrorState
        message={getApiError(conversations.error, labels.loadError).message}
        retryLabel={siteMessages.common.retry}
        onRetry={() => void conversations.refetch()}
      />
    );
  }

  const openConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    setGroupSettingsOpen(false);
    setDraft("");
    setPendingFiles([]);
    setError("");
    router.replace(
      `${withLocale(locale, "/messages")}?conversation=${conversationId}&chatPage=${conversationPage}`,
      { scroll: false }
    );
  };

  const send = async () => {
    if ((!draft.trim() && pendingFiles.length === 0) || !activeId) return;
    setError("");
    try {
      setUploadingAttachments(pendingFiles.length > 0);
      const attachments = await Promise.all(
        pendingFiles.map(async (file) => {
          const uploaded = await fileService.upload(file);
          return {
            url: uploaded.url,
            fileName: uploaded.fileName,
            contentType: uploaded.contentType,
            size: uploaded.size,
          };
        })
      );
      await sendMessage.mutateAsync({ body: draft.trim(), attachments });
      setDraft("");
      setPendingFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (reason) {
      setError(getApiError(reason, labels.attachmentUploadError).message);
    } finally {
      setUploadingAttachments(false);
    }
  };
  const sending = sendMessage.isPending || uploadingAttachments;

  const activeName = active ? conversationName(active, labels) : "";
  const activeParticipantSummary = active?.isGroup
    ? labels.participants.replace("{count}", String(active.participants.length))
    : active
      ? chatContextLabel(active.context, labels)
      : "";

  return (
    <>
      <div className="grid h-[calc(100dvh-10rem)] min-h-[620px] max-h-[780px] grid-rows-[220px_minmax(0,1fr)] overflow-hidden rounded-3xl border border-border bg-surface/75 shadow-[var(--shadow-lg)] lg:h-[calc(100dvh-12rem)] lg:grid-cols-[340px_minmax(0,1fr)] lg:grid-rows-1">
        <aside className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold">{labels.title}</h1>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {labels.subtitle}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={() => setComposerOpen(true)}
              >
                <PlusIcon />
                {labels.newChat}
              </Button>
            </div>
            <div className="relative mt-4">
              <SearchIcon />
              <Input
                value={chatSearch}
                placeholder={labels.searchChatsPlaceholder}
                className="pl-10"
                onChange={(event) => {
                  setChatSearch(event.target.value);
                  setConversationPage(1);
                  setSelectedConversationId(null);
                  setPendingFiles([]);
                }}
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {conversations.data?.items.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
                locale={locale}
                labels={labels}
                currentUserId={user?.id}
                onSelect={() => openConversation(conversation.id)}
              />
            ))}
            {conversations.data?.totalCount === 0 && !chatSearch.trim() ? (
              <div className="px-4 py-10 text-center">
                <p className="font-semibold">{labels.emptyTitle}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{labels.emptyBody}</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-4"
                  onClick={() => setComposerOpen(true)}
                >
                  <PlusIcon />
                  {labels.newChat}
                </Button>
              </div>
            ) : null}
            {conversations.data?.totalCount === 0 && chatSearch.trim() ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                {labels.noChatSearchResults}
              </p>
            ) : null}
            {conversations.data ? (
              <Pagination
                page={conversations.data.page}
                totalPages={conversations.data.totalPages}
                onPageChange={(page) => {
                  setConversationPage(page);
                  setSelectedConversationId(null);
                  setPendingFiles([]);
                  router.replace(`${withLocale(locale, "/messages")}?chatPage=${page}`, {
                    scroll: false,
                  });
                }}
                previousLabel={siteMessages.common.previous}
                nextLabel={siteMessages.common.next}
                pageLabel={siteMessages.common.pageOf
                  .replace("{page}", String(conversations.data.page))
                  .replace("{total}", String(conversations.data.totalPages))}
              />
            ) : null}
          </div>
        </aside>

        {active ? (
          <section className="flex min-h-0 min-w-0 flex-col">
            <header className="border-b border-border px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar
                    name={activeName}
                    avatarUrl={active.isGroup ? null : active.otherUser?.avatarUrl}
                    className="size-11 rounded-2xl"
                  />
                  <div className="min-w-0">
                    {active.otherUser ? (
                      <Link
                        href={withLocale(locale, `/users/${active.otherUser.id}`)}
                        className="block truncate font-semibold hover:text-primary-text hover:underline"
                      >
                        {activeName}
                      </Link>
                    ) : (
                      <p className="truncate font-semibold">{activeName}</p>
                    )}
                    <p className="truncate text-xs text-muted-foreground">
                      {activeParticipantSummary}
                    </p>
                  </div>
                </div>
                {active.isGroup ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setGroupSettingsOpen(true)}
                  >
                    <GroupIcon />
                    {labels.manageGroup}
                  </Button>
                ) : active.otherUser ? (
                  <Link
                    href={chatContextHref(active.context, active.otherUser.id, locale)}
                    className="rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                  >
                    {labels.openContext} ↗
                  </Link>
                ) : null}
              </div>
              {active.otherUser ? (
                <div className="mt-3">
                  <PersonalNoteEditor targetUserId={active.otherUser.id} labels={labels} />
                </div>
              ) : null}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-background/35 px-4 py-5 sm:px-6">
              {thread.isLoading ? <LoadingSkeleton count={3} /> : null}
              {thread.isError ? (
                <ErrorState
                  message={labels.loadError}
                  retryLabel={siteMessages.common.retry}
                  onRetry={() => void thread.refetch()}
                />
              ) : null}
              {thread.hasNextPage ? (
                <div className="mb-4 text-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={thread.isFetchingNextPage}
                    onClick={() => void thread.fetchNextPage()}
                  >
                    {thread.isFetchingNextPage ? labels.loadingEarlier : labels.loadEarlier}
                  </Button>
                </div>
              ) : null}
              {chatMessages.length === 0 && !thread.isLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  {labels.noMessages}
                </p>
              ) : null}
              <div className="grid gap-3">
                {chatMessages.map((message) => {
                  const mine = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[72%] ${
                          mine
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border border-border bg-surface text-foreground"
                        }`}
                      >
                        {active.isGroup && !mine ? (
                          <p className="mb-1 text-xs font-semibold text-secondary">
                            {message.sender.userName}
                          </p>
                        ) : null}
                        {message.attachments.length ? (
                          <MessageAttachments attachments={message.attachments} mine={mine} />
                        ) : null}
                        {message.body ? (
                          <p
                            className={`whitespace-pre-wrap break-words leading-6 ${
                              message.attachments.length ? "mt-2" : ""
                            }`}
                          >
                            {message.body}
                          </p>
                        ) : null}
                        <p
                          className={`mt-1 text-[10px] ${
                            mine ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatMessageTime(message.sentAt, locale)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            <form
              className="border-t border-border bg-surface p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              {pendingFiles.length ? (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {pendingFiles.map((file, index) => (
                    <div
                      key={`${file.name}:${file.size}:${file.lastModified}`}
                      className="flex max-w-52 shrink-0 items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2"
                    >
                      <FileTypeIcon image={file.type.startsWith("image/")} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{file.name}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={labels.removeAttachment}
                        className="focus-ring grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"
                        disabled={sending}
                        onClick={() =>
                          setPendingFiles((current) =>
                            current.filter((_, fileIndex) => fileIndex !== index)
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex items-end gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
                  onChange={(event) => {
                    const selected = Array.from(event.target.files ?? []);
                    setPendingFiles((current) => {
                      if (current.length + selected.length > 10) {
                        setError(labels.attachmentLimit);
                      }
                      return [...current, ...selected].slice(0, 10);
                    });
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="size-11 shrink-0 px-0"
                  aria-label={labels.addAttachment}
                  title={labels.addAttachment}
                  disabled={sending || pendingFiles.length >= 10}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon />
                </Button>
                <Textarea
                  value={draft}
                  maxLength={4000}
                  rows={2}
                  placeholder={labels.messagePlaceholder}
                  className="min-h-11 resize-none"
                  style={{ resize: "none" }}
                  disabled={sending}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={(!draft.trim() && pendingFiles.length === 0) || sending}
                >
                  {uploadingAttachments
                    ? labels.uploadingAttachments
                    : sendMessage.isPending
                      ? labels.sending
                      : labels.send}
                </Button>
              </div>
              {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
            </form>
          </section>
        ) : (
          <div className="grid place-items-center p-8 text-center text-sm text-muted-foreground">
            <div>
              <p>{labels.selectConversation}</p>
              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={() => setComposerOpen(true)}
              >
                <PlusIcon />
                {labels.newChat}
              </Button>
            </div>
          </div>
        )}
      </div>

      <NewChatDialog
        open={composerOpen}
        labels={labels}
        onClose={() => setComposerOpen(false)}
        onCreated={openConversation}
      />
      {active?.isGroup ? (
        <GroupManagementDialog
          key={active.id}
          open={groupSettingsOpen}
          conversation={active}
          currentUserId={user?.id}
          labels={labels}
          cancelLabel={siteMessages.common.close}
          onClose={() => setGroupSettingsOpen(false)}
          onLeft={() => {
            setGroupSettingsOpen(false);
            setSelectedConversationId(null);
            router.replace(withLocale(locale, "/messages"), { scroll: false });
          }}
        />
      ) : null}
    </>
  );
}

function ConversationRow({
  conversation,
  active,
  locale,
  labels,
  currentUserId,
  onSelect,
}: Readonly<{
  conversation: Conversation;
  active: boolean;
  locale: Locale;
  labels: SiteMessages["chat"];
  currentUserId?: number;
  onSelect: () => void;
}>) {
  const name = conversationName(conversation, labels);
  const preview = conversation.lastMessage
    ? conversation.isGroup && conversation.lastMessage.senderId !== currentUserId
      ? `${conversation.lastMessage.sender.userName}: ${
          conversation.lastMessage.body || labels.attachment
        }`
      : conversation.lastMessage.body || labels.attachment
    : labels.noMessages;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`focus-ring flex w-full cursor-pointer gap-3 rounded-2xl p-3 text-left transition ${
        active ? "bg-primary-soft" : "hover:bg-muted"
      }`}
    >
      <UserAvatar
        name={name}
        avatarUrl={conversation.isGroup ? null : conversation.otherUser?.avatarUrl}
        className="size-11 shrink-0 rounded-2xl"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatMessageTime(conversation.lastMessageAt, locale)}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] font-medium text-secondary">
          {conversation.isGroup
            ? labels.participants.replace("{count}", String(conversation.participants.length))
            : chatContextLabel(conversation.context, labels)}
        </span>
        <span className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">{preview}</span>
          {conversation.unreadCount ? (
            <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function conversationName(conversation: Conversation, labels: SiteMessages["chat"]) {
  return conversation.title ?? conversation.otherUser?.userName ?? labels.groupChat;
}

function formatMessageTime(value: string, locale: Locale) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat(
    locale === "uk" ? "uk-UA" : "en-US",
    sameDay ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" }
  ).format(date);
}

function MessageAttachments({
  attachments,
  mine,
}: Readonly<{ attachments: ChatAttachment[]; mine: boolean }>) {
  const images = attachments.filter((attachment) => attachment.contentType.startsWith("image/"));
  const files = attachments.filter((attachment) => !attachment.contentType.startsWith("image/"));

  return (
    <div className="grid gap-2">
      {images.length ? (
        <div
          className={`grid gap-1 overflow-hidden rounded-xl ${images.length > 1 ? "grid-cols-2" : ""}`}
        >
          {images.map((attachment) => (
            <a
              key={attachment.id}
              href={resolveFileUrl(attachment.url)}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg bg-foreground/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- authenticated user uploads use the API file origin */}
              <img
                src={resolveFileUrl(attachment.url)}
                alt={attachment.fileName}
                className="max-h-72 min-h-24 w-full object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      ) : null}
      {files.map((attachment) => (
        <a
          key={attachment.id}
          href={resolveFileUrl(attachment.url)}
          target="_blank"
          rel="noreferrer"
          className={`flex min-w-52 items-center gap-3 rounded-xl p-2.5 transition hover:brightness-95 ${
            mine ? "bg-primary-foreground/15" : "bg-muted"
          }`}
        >
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${
              mine
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary-soft text-primary-soft-foreground"
            }`}
          >
            <FileTypeIcon image={false} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold">{attachment.fileName}</span>
            <span
              className={`block text-[10px] ${
                mine ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
            >
              {formatFileSize(attachment.size)}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ image }: Readonly<{ image: boolean }>) {
  return image ? (
    <svg
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m3 17 5-5 4 4 3-3 6 6" />
    </svg>
  ) : (
    <svg
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2" />
      <path d="M3 19a6 6 0 0 1 12 0M15 15a4 4 0 0 1 6 4" />
    </svg>
  );
}
