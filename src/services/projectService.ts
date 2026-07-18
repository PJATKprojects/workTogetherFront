import type {
  CreatePositionDto,
  CreateProjectDto,
  PagedResult,
  PaginationParams,
  ProjectDetail,
  ProjectFilters,
  ProjectListItem,
  UpdatePositionDto,
  UpdateProjectDto,
} from "@/types";

import api from "./api";

export interface ProjectDraftReviewItem {
  id: string;
  reviewerUserId: number;
  userName: string;
  status: "pending" | "completed" | "expired" | "revoked";
  comment?: string;
  createdAt: string;
  expiresAt: string;
  viewedAt?: string;
  submittedAt?: string;
}

export interface ProjectDraftReviewPreview {
  id: string;
  expiresAt: string;
  status: string;
  comment?: string;
  project: {
    id: number;
    projectName: string;
    problem: string;
    expectedOutcome: string;
    stage: string;
    format: string;
    duration: string;
    hoursPerWeek: number | null;
    timeZone: string;
    teamLanguages: string;
    projectLink: string;
    positions: Array<{
      id: number;
      role: string;
      tasks: string;
      level: string;
      isFilled: boolean;
      mustHave: string[];
      niceToHave: string[];
    }>;
  };
}

function projectParams(params?: ProjectFilters | PaginationParams) {
  if (!params) return undefined;
  return {
    ...params,
    technologyIds:
      "technologyIds" in params && params.technologyIds?.length
        ? params.technologyIds.join(",")
        : undefined,
  };
}

export const projectService = {
  getAll: async (params: ProjectFilters) => {
    const response = await api.get<PagedResult<ProjectListItem>>("/api/projects", {
      params: projectParams(params),
    });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<ProjectDetail>(`/api/projects/${id}`);
    return response.data;
  },
  getMy: async (params?: PaginationParams) => {
    const response = await api.get<PagedResult<ProjectListItem>>("/api/projects/my", { params });
    return response.data;
  },
  create: async (data: CreateProjectDto) => {
    const response = await api.post<ProjectDetail>("/api/projects", data);
    return response.data;
  },
  update: async (id: number, data: UpdateProjectDto) => {
    const response = await api.put<ProjectDetail>(`/api/projects/${id}`, data);
    return response.data;
  },
  remove: (id: number) => api.delete(`/api/projects/${id}`),
  closeRecruitment: async (id: number) =>
    (await api.patch<ProjectDetail>(`/api/projects/${id}/recruitment/close`)).data,
  reopenRecruitment: async (id: number) =>
    (await api.patch<ProjectDetail>(`/api/projects/${id}/recruitment/reopen`)).data,
  hide: async (id: number) =>
    (await api.patch<ProjectDetail>(`/api/projects/${id}/visibility/hide`)).data,
  publish: async (id: number) =>
    (await api.patch<ProjectDetail>(`/api/projects/${id}/visibility/publish`)).data,
  archive: async (id: number) =>
    (await api.patch<ProjectDetail>(`/api/projects/${id}/archive`)).data,
  restore: async (id: number) =>
    (await api.patch<ProjectDetail>(`/api/projects/${id}/restore`)).data,
  confirmFreshnessActive: async (id: number) =>
    (await api.post<ProjectDetail>(`/api/projects/${id}/freshness/confirm-active`)).data,
  confirmFreshnessClose: async (id: number) =>
    (await api.post<ProjectDetail>(`/api/projects/${id}/freshness/confirm-close`)).data,
  previewFreshnessLink: async (id: number, token: string) =>
    (
      await api.get<{
        project: {
          id: number;
          projectName: string;
          healthStatus: string;
          isRecruitmentClosed: boolean;
          freshnessReviewRequiredAt: string | null;
        };
        expiresAt: string;
        requiresExplicitConfirmation: boolean;
      }>("/api/project-freshness/preview", {
        params: { projectId: id, token },
      })
    ).data,
  confirmFreshnessLink: async (id: number, token: string, action: "active" | "close") =>
    (
      await api.post<{
        id: number;
        healthStatus: string;
        isRecruitmentClosed: boolean;
      }>(`/api/project-freshness/confirm/${id}`, { token, action })
    ).data,
  draftReviews: async (projectId: number) =>
    (await api.get<ProjectDraftReviewItem[]>(`/api/projects/${projectId}/draft-reviews`)).data,
  inviteDraftReviewer: async (projectId: number, userName: string) =>
    (
      await api.post<{ id: string; expiresAt: string }>(
        `/api/projects/${projectId}/draft-reviews`,
        { userName }
      )
    ).data,
  revokeDraftReview: async (projectId: number, reviewId: string) => {
    await api.delete(`/api/projects/${projectId}/draft-reviews/${encodeURIComponent(reviewId)}`);
  },
  previewDraftReview: async (token: string) =>
    (
      await api.get<ProjectDraftReviewPreview>("/api/project-draft-reviews/preview", {
        params: { token },
      })
    ).data,
  submitDraftReview: async (token: string, comment: string) => {
    await api.post("/api/project-draft-reviews/submit", { token, comment });
  },
  addPosition: async (projectId: number, data: CreatePositionDto) => {
    const response = await api.post(`/api/projects/${projectId}/positions`, data);
    return response.data;
  },
  updatePosition: async (projectId: number, positionId: number, data: UpdatePositionDto) => {
    const response = await api.put(`/api/projects/${projectId}/positions/${positionId}`, data);
    return response.data;
  },
  deletePosition: (projectId: number, positionId: number) =>
    api.delete(`/api/projects/${projectId}/positions/${positionId}`),
  closePosition: (projectId: number, positionId: number) =>
    api.patch(`/api/projects/${projectId}/positions/${positionId}/close`),
  reopenPosition: (projectId: number, positionId: number) =>
    api.patch(`/api/projects/${projectId}/positions/${positionId}/reopen`),
};
