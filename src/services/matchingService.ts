import type { ProjectFilters, ProjectListItem, UserListItem } from "@/types";
import api from "./api";

export interface MatchReason {
  code: string;
  explanation: string;
  points: number;
}
export interface ProjectMatch {
  project: ProjectListItem;
  score: number;
  reasons: MatchReason[];
  diversitySlot: boolean;
}
export interface ComplementaryPerson {
  user: UserListItem;
  score: number;
  complementarySkills: string[];
  sharedSkills: string[];
  reasons: MatchReason[];
}
export interface SavedSearch {
  id: number;
  name: string;
  filters: ProjectFilters;
  weeklyDigest: boolean;
  createdAt: string;
  updatedAt: string;
}

type ApiFilters = Omit<ProjectFilters, "technologyIds"> & { technologyIds?: string };
interface ApiSavedSearch extends Omit<SavedSearch, "filters"> {
  filters: ApiFilters;
}
const toApiFilters = (filters: ProjectFilters): ApiFilters => ({
  ...filters,
  technologyIds: filters.technologyIds?.join(","),
});
const fromApiSearch = (item: ApiSavedSearch): SavedSearch => ({
  ...item,
  filters: {
    ...item.filters,
    technologyIds: item.filters.technologyIds?.split(",").map(Number).filter(Number.isFinite),
  },
});

export const matchingService = {
  projects: async (limit = 24) =>
    (await api.get<ProjectMatch[]>("/api/matching/projects", { params: { limit } })).data,
  complementaryPeople: async (limit = 20) =>
    (
      await api.get<ComplementaryPerson[]>("/api/matching/people/complementary", {
        params: { limit },
      })
    ).data,
  feedback: async (projectId: number, action: "hide" | "not_interested", reason?: string) => {
    await api.put(`/api/matching/projects/${projectId}/feedback`, { action, reason });
  },
  undoFeedback: async (projectId: number) => {
    await api.delete(`/api/matching/projects/${projectId}/feedback`);
  },
  savedSearches: async () =>
    (await api.get<ApiSavedSearch[]>("/api/saved-searches")).data.map(fromApiSearch),
  saveSearch: async (name: string, filters: ProjectFilters, weeklyDigest: boolean) =>
    fromApiSearch(
      (
        await api.post<ApiSavedSearch>("/api/saved-searches", {
          name,
          filters: toApiFilters(filters),
          weeklyDigest,
        })
      ).data
    ),
  updateSearch: async (id: number, name: string, filters: ProjectFilters, weeklyDigest: boolean) =>
    fromApiSearch(
      (
        await api.put<ApiSavedSearch>(`/api/saved-searches/${id}`, {
          name,
          filters: toApiFilters(filters),
          weeklyDigest,
        })
      ).data
    ),
  deleteSearch: async (id: number) => {
    await api.delete(`/api/saved-searches/${id}`);
  },
};
