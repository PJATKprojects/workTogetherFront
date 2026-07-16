import type { ApplicationStatus, ProjectStatus, Role, Technology } from "@/types";

import api from "./api";

export const lookupService = {
  getRoles: async () => (await api.get<Role[]>("/api/lookups/roles")).data,
  getTechnologies: async () => (await api.get<Technology[]>("/api/lookups/technologies")).data,
  /** Find-or-create: an existing name (case-insensitive) returns the existing row. */
  createTechnology: async (name: string) =>
    (await api.post<Technology>("/api/lookups/technologies", { name })).data,
  getProjectStatuses: async () =>
    (await api.get<ProjectStatus[]>("/api/lookups/project-statuses")).data,
  getApplicationStatuses: async () =>
    (await api.get<ApplicationStatus[]>("/api/lookups/application-statuses")).data,
};
