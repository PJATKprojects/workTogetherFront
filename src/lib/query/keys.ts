import type { ConversationFilters, PaginationParams, ProjectFilters, UserFilters } from "@/types";

export const queryKeys = {
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
    list: (filters: UserFilters) => [...queryKeys.users.all, "list", filters] as const,
    lookingForTeam: (filters: UserFilters) => [...queryKeys.users.all, "looking", filters] as const,
    detail: (id: number) => [...queryKeys.users.all, id] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (filters: ProjectFilters) => [...queryKeys.projects.all, "list", filters] as const,
    detail: (id: number) => [...queryKeys.projects.all, "detail", id] as const,
    my: (filters?: PaginationParams) => [...queryKeys.projects.all, "my", filters] as const,
  },
  applications: {
    all: ["applications"] as const,
    my: (pagination?: PaginationParams) =>
      [...queryKeys.applications.all, "my", pagination] as const,
    byProject: (id: number, pagination?: PaginationParams) =>
      [...queryKeys.applications.all, "project", id, pagination] as const,
    receivedCount: () => [...queryKeys.applications.all, "received-count"] as const,
  },
  chat: {
    all: ["chat"] as const,
    conversations: (filters?: ConversationFilters) =>
      [...queryKeys.chat.all, "conversations", filters] as const,
    messages: (conversationId: number) =>
      [...queryKeys.chat.all, "messages", conversationId] as const,
    unreadCount: () => [...queryKeys.chat.all, "unread-count"] as const,
    users: (email: string) => [...queryKeys.chat.all, "users", email] as const,
    note: (targetUserId: number) => [...queryKeys.chat.all, "note", targetUserId] as const,
  },
  lookups: {
    all: ["lookups"] as const,
    roles: () => [...queryKeys.lookups.all, "roles"] as const,
    technologies: () => [...queryKeys.lookups.all, "technologies"] as const,
    projectStatuses: () => [...queryKeys.lookups.all, "project-statuses"] as const,
    applicationStatuses: () => [...queryKeys.lookups.all, "application-statuses"] as const,
  },
};
