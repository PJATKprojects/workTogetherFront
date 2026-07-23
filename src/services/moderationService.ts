import api from "./api";

export type ReportTargetType = "user" | "project" | "message" | "attachment";
export type ReportCategory = "spam" | "scam" | "harassment" | "plagiarism";

export interface ReportItem {
  id: number;
  reporterUserId: number;
  reporterName?: string;
  targetType: ReportTargetType;
  targetId: number;
  targetLabel?: string;
  targetExcerpt?: string;
  targetOwnerUserId?: number;
  category: ReportCategory;
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  assignedAdminId?: number;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface IllegalContentNoticeItem {
  id: number;
  reference: string;
  reporterName?: string;
  reporterEmail?: string;
  contentUrl: string;
  category:
    | "child_safety"
    | "threats"
    | "hate"
    | "fraud"
    | "privacy"
    | "intellectual_property"
    | "other";
  legalReason: string;
  locale: string;
  status: "open" | "reviewing" | "actioned" | "dismissed";
  assignedAdminId?: number;
  decision?: string;
  correlationId: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface BlockedUser {
  userId: number;
  userName: string;
  avatarUrl?: string;
  blockedAt: string;
}

export interface UserSanction {
  id: number;
  type: "warning" | "suspension" | "ban" | "content_removal";
  reason: string;
  startsAt: string;
  endsAt?: string;
  revokedAt?: string;
  canAppeal: boolean;
}

export interface AdminSanction {
  id: number;
  userId: number;
  userName: string;
  adminUserId: number;
  type: UserSanction["type"];
  reason: string;
  startsAt: string;
  endsAt?: string;
  revokedAt?: string;
  revokedByUserId?: number;
  isActive: boolean;
}

export interface AppealItem {
  id: number;
  sanctionId: number;
  userId: number;
  message: string;
  status: "open" | "accepted" | "rejected";
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditItem {
  id: number;
  actorUserId?: number;
  actorName?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadataJson: string;
  ipAddress: string;
  createdAt: string;
}

export const moderationService = {
  report: async (
    targetType: ReportTargetType,
    targetId: number,
    category: ReportCategory,
    details: string
  ) =>
    (await api.post<ReportItem>("/api/reports", { targetType, targetId, category, details })).data,
  myReports: async () => (await api.get<ReportItem[]>("/api/reports/mine")).data,
  blockedUsers: async () => (await api.get<BlockedUser[]>("/api/blocks")).data,
  block: async (userId: number) => {
    await api.post(`/api/blocks/${userId}`);
  },
  unblock: async (userId: number) => {
    await api.delete(`/api/blocks/${userId}`);
  },
  sanctions: async () => (await api.get<UserSanction[]>("/api/appeals/sanctions")).data,
  appeals: async () => (await api.get<AppealItem[]>("/api/appeals")).data,
  appeal: async (sanctionId: number, message: string) =>
    (await api.post<AppealItem>("/api/appeals", { sanctionId, message })).data,

  adminReports: async (status = "open") =>
    (await api.get<ReportItem[]>("/api/admin/moderation/reports", { params: { status } })).data,
  resolveReport: async (id: number, status: ReportItem["status"], resolution: string) =>
    (await api.patch<ReportItem>(`/api/admin/moderation/reports/${id}`, { status, resolution }))
      .data,
  adminIllegalContentNotices: async (status = "open") =>
    (
      await api.get<IllegalContentNoticeItem[]>("/api/admin/moderation/illegal-content-notices", {
        params: { status },
      })
    ).data,
  resolveIllegalContentNotice: async (
    id: number,
    status: IllegalContentNoticeItem["status"],
    decision: string
  ) =>
    (
      await api.patch<IllegalContentNoticeItem>(
        `/api/admin/moderation/illegal-content-notices/${id}`,
        { status, decision }
      )
    ).data,
  createSanction: async (
    userId: number,
    type: UserSanction["type"],
    reason: string,
    endsAt?: string
  ) => {
    await api.post("/api/admin/moderation/sanctions", {
      userId,
      type,
      reason,
      endsAt: endsAt || null,
    });
  },
  adminSanctions: async (state = "active") =>
    (
      await api.get<AdminSanction[]>("/api/admin/moderation/sanctions", {
        params: { state },
      })
    ).data,
  revokeSanction: async (id: number) => {
    await api.delete(`/api/admin/moderation/sanctions/${id}`);
  },
  adminAppeals: async (status = "open") =>
    (await api.get<AppealItem[]>("/api/admin/moderation/appeals", { params: { status } })).data,
  resolveAppeal: async (id: number, status: "accepted" | "rejected", resolution: string) =>
    (await api.patch<AppealItem>(`/api/admin/moderation/appeals/${id}`, { status, resolution }))
      .data,
  audit: async (page = 1) =>
    (await api.get<AuditItem[]>("/api/admin/moderation/audit", { params: { page } })).data,
};
