import type { PagedResult } from "@/types";

import api from "./api";

export interface EmailOutboxAdminItem {
  messageId: string;
  type: string;
  correlationId: string;
  recipientEmail: string;
  subject: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: string;
  nextAttemptAt: string;
  sentAt?: string;
  deadLetteredAt?: string;
  isLeased: boolean;
}

export interface AdminOverview {
  generatedAt: string;
  correlationId: string;
  users: {
    total: number;
    active: number;
    newLast24Hours: number;
    activeSessions: number;
  };
  projects: { total: number; recruiting: number; stale: number };
  applications: { total: number; waiting: number; sentLast24Hours: number };
  moderation: {
    openReports: number;
    openAppeals: number;
    activeSanctions: number;
  };
  delivery: {
    outboxPending: number;
    outboxDeadLetter: number;
    oldestOutboxAgeSeconds: number;
    pushPending: number;
    pushExhausted: number;
  };
  jobs: { total: number; running: number; failed: number; lagging: number };
  process: {
    uptimeSeconds: number;
    workingSetBytes: number;
    threadCount: number;
    databaseSizeBytes: number;
    storageSizeBytes: number;
  };
  observability?: {
    apmExportConfigured: boolean;
    metricsEndpointEnabled: boolean;
    slowQueryThresholdMs: number;
    outboxAgeAlertMinutes: number;
    scheduledJobLagAlertMinutes: number;
  };
  alerts?: Array<{
    code:
      | "scheduled_job_lag"
      | "outbox_age"
      | "outbox_dead_letter"
      | "push_exhausted"
      | "database_capacity"
      | "storage_capacity";
    severity: "warning" | "critical";
    value: number;
    threshold: number;
  }>;
  counters: Record<string, number>;
}

export interface AdminJob {
  name: string;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastSucceededAt?: string;
  lastError?: string;
  runCount: number;
  failureCount: number;
  lastDurationMs?: number;
  nextExpectedRunAt?: string;
  heartbeatAt?: string;
  leaseUntil?: string;
  isRunning: boolean;
  isLagging: boolean;
  manualRunPending: boolean;
}

export interface AdminUser {
  id: number;
  userName: string;
  email: string;
  isActive: boolean;
  isConfirmed: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
  anonymizedAt?: string;
  isCurrentUser: boolean;
  activeRestriction?: {
    id: number;
    type: "ban" | "suspension";
    reason: string;
    startsAt: string;
    endsAt?: string;
  } | null;
  loginMethods: string[];
  activeSessions: number;
  badges: {
    email: boolean;
    github: boolean;
    completedCollaboration: boolean;
    attestations: { type: string; label: string }[];
  };
}

export type AdminUserStatus = "all" | "active" | "banned" | "suspended" | "inactive" | "deleted";

export interface AdminUserQuery {
  search?: string;
  status?: AdminUserStatus;
  role?: "all" | "admin" | "member";
  sort?: "newest" | "oldest" | "name";
  page?: number;
  pageSize?: number;
}

export const adminService = {
  emailOutbox: async (state: string, page = 1) => {
    const response = await api.get<PagedResult<EmailOutboxAdminItem>>("/api/admin/email-outbox", {
      params: { state, page, pageSize: 50 },
    });
    return response.data;
  },
  retryEmail: async (messageId: string) => {
    await api.post(`/api/admin/email-outbox/${messageId}/retry`);
  },
  overview: async () => (await api.get<AdminOverview>("/api/admin/operations/overview")).data,
  jobs: async () => (await api.get<AdminJob[]>("/api/admin/operations/jobs")).data,
  triggerJob: async (name: string) => {
    await api.post(`/api/admin/operations/jobs/${encodeURIComponent(name)}/run`);
  },
  users: async (query: AdminUserQuery = {}) =>
    (
      await api.get<PagedResult<AdminUser>>("/api/admin/operations/users", {
        params: {
          search: query.search || undefined,
          status: query.status ?? "all",
          role: query.role ?? "all",
          sort: query.sort ?? "newest",
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 25,
        },
      })
    ).data,
  banUser: async (userId: number, reason: string) => {
    await api.post("/api/admin/moderation/sanctions", {
      userId,
      type: "ban",
      reason,
    });
  },
  unbanUser: async (sanctionId: number) => {
    await api.delete(`/api/admin/moderation/sanctions/${sanctionId}`);
  },
  deleteUser: async (userId: number, reason: string) => {
    await api.post(`/api/admin/operations/users/${userId}/delete`, {
      reason,
    });
  },
  grantVerification: async (
    userId: number,
    type: "domain" | "organization",
    label: string,
    evidenceUrl?: string
  ) => {
    await api.post(`/api/admin/operations/users/${userId}/verifications`, {
      type,
      label,
      evidenceUrl: evidenceUrl || undefined,
    });
  },
  revokeVerification: async (userId: number, type: string) => {
    await api.delete(
      `/api/admin/operations/users/${userId}/verifications/${encodeURIComponent(type)}`
    );
  },
};
