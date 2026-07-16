"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { chatService } from "@/services/chatService";
import type {
  ConversationFilters,
  CreateGroupConversationPayload,
  StartConversationPayload,
  SendChatMessagePayload,
} from "@/types";

export function useConversationsQuery(filters: ConversationFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chat.conversations(filters),
    queryFn: () => chatService.getConversations(filters),
    enabled,
    refetchInterval: 10_000,
  });
}

export function useChatMessagesQuery(conversationId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages(conversationId),
    queryFn: ({ pageParam }) =>
      chatService.getMessages(conversationId, { page: pageParam, pageSize: 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled: conversationId > 0,
    refetchInterval: 5_000,
  });
}

export function useChatUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.chat.unreadCount(),
    queryFn: chatService.getUnreadCount,
    enabled,
    refetchInterval: 10_000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartConversationPayload) => chatService.startConversation(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
  });
}

export function useCreateGroupConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupConversationPayload) =>
      chatService.createGroupConversation(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
  });
}

export function useChatUserSearch(email: string, enabled = true) {
  const normalized = email.trim().toLowerCase();
  return useQuery({
    queryKey: queryKeys.chat.users(normalized),
    queryFn: () => chatService.searchUsers(normalized),
    enabled: enabled && normalized.length >= 3,
    staleTime: 30_000,
  });
}

function useGroupConversationMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
  });
}

export function useUpdateGroupTitle(conversationId: number) {
  return useGroupConversationMutation((title: string) =>
    chatService.updateGroupTitle(conversationId, title)
  );
}

export function useAddGroupParticipant(conversationId: number) {
  return useGroupConversationMutation((userId: number) =>
    chatService.addGroupParticipant(conversationId, userId)
  );
}

export function useRemoveGroupParticipant(conversationId: number) {
  return useGroupConversationMutation((userId: number) =>
    chatService.removeGroupParticipant(conversationId, userId)
  );
}

export function useSetGroupAdmin(conversationId: number) {
  return useGroupConversationMutation(({ userId, isAdmin }: { userId: number; isAdmin: boolean }) =>
    chatService.setGroupAdmin(conversationId, userId, isAdmin)
  );
}

export function useLeaveGroup(conversationId: number) {
  return useGroupConversationMutation(() => chatService.leaveGroup(conversationId));
}

export function useSendChatMessage(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendChatMessagePayload) =>
      chatService.sendMessage(conversationId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(conversationId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.all }),
      ]);
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatService.markRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.unreadCount() }),
      ]);
    },
  });
}

export function useUserNoteQuery(targetUserId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chat.note(targetUserId),
    queryFn: () => chatService.getNote(targetUserId),
    enabled: enabled && targetUserId > 0,
  });
}

export function useSaveUserNote(targetUserId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => chatService.saveNote(targetUserId, text),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.note(targetUserId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.all }),
      ]);
    },
  });
}
