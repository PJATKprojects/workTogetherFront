import type {
  ApplicationDto,
  CreateApplicationDto,
  PagedResult,
  PaginationParams,
  UpdateApplicationDraftDto,
} from "@/types";

import api from "./api";

export const applicationService = {
  create: async (payload: CreateApplicationDto) => {
    const response = await api.post<ApplicationDto>("/api/applications", payload);
    return response.data;
  },
  getMy: async (pagination: PaginationParams) => {
    const response = await api.get<PagedResult<ApplicationDto>>("/api/applications/my", {
      params: pagination,
    });
    return response.data;
  },
  getByProject: async (projectId: number, pagination: PaginationParams) => {
    const response = await api.get<PagedResult<ApplicationDto>>(
      `/api/applications/project/${projectId}`,
      { params: pagination }
    );
    return response.data;
  },
  updateStatus: async (
    id: number,
    statusId: 2 | 3 | 6 | 7 | 8,
    details?: Record<string, unknown>
  ) => {
    const response = await api.patch(`/api/applications/${id}/status`, { statusId, ...details });
    return response.data;
  },
  withdraw: (id: number) => api.delete(`/api/applications/${id}`),
  submitDraft: async (id: number) =>
    (await api.post<ApplicationDto>(`/api/applications/${id}/submit`)).data,
  updateDraft: async (id: number, value: UpdateApplicationDraftDto) =>
    (await api.put<ApplicationDto>(`/api/applications/${id}/draft`, value)).data,
  expire: async (id: number) =>
    (await api.post<ApplicationDto>(`/api/applications/${id}/expire`)).data,
  /** Pending applications across all MY projects — the "unread" badge (v1.3). */
  getReceivedPendingCount: async () =>
    (await api.get<{ count: number }>("/api/applications/received/pending-count")).data.count,
};
