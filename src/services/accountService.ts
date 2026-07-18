import api from "./api";

export interface DeletionRequest {
  accountDeletionScheduledAt: string;
  gracePeriodDays: number;
  message: string;
}

export const accountService = {
  exportData: async () => {
    const response = await api.get<Blob>("/api/account/export", { responseType: "blob" });
    return response.data;
  },
  requestDeletion: async (archiveOwnedProjects: boolean) =>
    (await api.post<DeletionRequest>("/api/account/delete-request", { archiveOwnedProjects })).data,
  cancelDeletion: async () => {
    await api.delete("/api/account/delete-request");
  },
};
