import type { ApplicationDto, PagedResult, PaginationParams } from "@/types";

import api from "./api";

export const applicationService = {
  create: async (payload: {
    projectPositionId: number;
    attachmentUrl: string;
    message?: string;
  }) => {
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
  updateStatus: async (id: number, statusId: 2 | 3) => {
    const response = await api.patch(`/api/applications/${id}/status`, { statusId });
    return response.data;
  },
  withdraw: (id: number) => api.delete(`/api/applications/${id}`),
  /** Pending applications across all MY projects — the "unread" badge (v1.3). */
  getReceivedPendingCount: async () =>
    (await api.get<{ count: number }>("/api/applications/received/pending-count")).data.count,
};
