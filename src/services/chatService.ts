import type {
  ChatMessage,
  ChatUser,
  Conversation,
  ConversationFilters,
  CreateGroupConversationPayload,
  StartConversationPayload,
  PagedResult,
  PaginationParams,
  SendChatMessagePayload,
  UserNote,
} from "@/types";

import api from "./api";

export const chatService = {
  getConversations: async (filters: ConversationFilters) =>
    (
      await api.get<PagedResult<Conversation>>("/api/conversations", {
        params: filters,
      })
    ).data,

  getMessages: async (conversationId: number, pagination: PaginationParams) =>
    (
      await api.get<PagedResult<ChatMessage>>(`/api/conversations/${conversationId}/messages`, {
        params: pagination,
      })
    ).data,

  startConversation: async (payload: StartConversationPayload) =>
    (await api.post<Conversation>("/api/conversations", payload)).data,

  createGroupConversation: async (payload: CreateGroupConversationPayload) =>
    (await api.post<Conversation>("/api/conversations/groups", payload)).data,

  updateGroupTitle: async (conversationId: number, title: string) =>
    (
      await api.put<Conversation>(`/api/conversations/${conversationId}/group/title`, {
        title,
      })
    ).data,

  addGroupParticipant: async (conversationId: number, userId: number) =>
    (
      await api.post<Conversation>(`/api/conversations/${conversationId}/group/participants`, {
        userId,
      })
    ).data,

  removeGroupParticipant: async (conversationId: number, userId: number) =>
    (
      await api.delete<Conversation>(
        `/api/conversations/${conversationId}/group/participants/${userId}`
      )
    ).data,

  setGroupAdmin: async (conversationId: number, userId: number, isAdmin: boolean) =>
    (
      await api.put<Conversation>(
        `/api/conversations/${conversationId}/group/participants/${userId}/admin`,
        { isAdmin }
      )
    ).data,

  leaveGroup: (conversationId: number) =>
    api.post(`/api/conversations/${conversationId}/group/leave`),

  searchUsers: async (email: string) =>
    (await api.get<ChatUser[]>("/api/conversations/users/search", { params: { email } })).data,

  sendMessage: async (conversationId: number, payload: SendChatMessagePayload) =>
    (await api.post<ChatMessage>(`/api/conversations/${conversationId}/messages`, payload)).data,

  markRead: (conversationId: number) => api.post(`/api/conversations/${conversationId}/read`),

  getUnreadCount: async () =>
    (await api.get<{ count: number }>("/api/conversations/unread-count")).data.count,

  getNote: async (targetUserId: number) =>
    (await api.get<UserNote>(`/api/conversations/notes/${targetUserId}`)).data,

  saveNote: async (targetUserId: number, text: string) =>
    (await api.put<UserNote>(`/api/conversations/notes/${targetUserId}`, { text })).data,
};
