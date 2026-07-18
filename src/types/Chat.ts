export type ChatContextType = "user" | "project" | "application";

export interface ChatUser {
  id: number;
  userName: string;
  avatarUrl: string | null;
  email: string | null;
  isAdmin: boolean;
}

export interface ChatContext {
  type: ChatContextType;
  id: number;
  projectId: number | null;
  projectName: string | null;
  roleName: string | null;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  clientRequestId: string | null;
  sender: ChatUser;
  body: string;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  attachments: ChatAttachment[];
}

export interface ChatAttachment {
  id: number;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface CreateChatAttachment {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface SendChatMessagePayload {
  clientRequestId?: string;
  body: string;
  attachments: CreateChatAttachment[];
}

export interface Conversation {
  id: number;
  isGroup: boolean;
  title: string | null;
  participants: ChatUser[];
  currentUserIsAdmin: boolean;
  otherUser: ChatUser | null;
  context: ChatContext;
  lastMessage: ChatMessage | null;
  lastMessageAt: string;
  unreadCount: number;
  personalNote: string | null;
  requestStatus: "pending" | "active" | "declined";
  requestedByUserId: number | null;
  requestedAt: string | null;
}

export interface ConversationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateGroupConversationPayload {
  clientRequestId?: string;
  title: string;
  participantUserIds: number[];
  message: string;
}

export interface StartConversationPayload {
  clientRequestId?: string;
  recipientUserId: number;
  contextType: ChatContextType;
  contextId: number;
  message: string;
}

export interface UserNote {
  targetUserId: number;
  text: string;
  updatedAt: string | null;
}
