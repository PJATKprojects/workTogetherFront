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
