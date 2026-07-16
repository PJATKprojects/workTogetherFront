import type {
  PagedResult,
  PrivateUser,
  PublicUser,
  UpdateUserProfileDto,
  UserFilters,
  UserListItem,
} from "@/types";

import api from "./api";

function userParams(params: UserFilters) {
  return {
    ...params,
    technologyIds: params.technologyIds?.length ? params.technologyIds.join(",") : undefined,
  };
}

export const userService = {
  getMyProfile: async () => {
    const response = await api.get<PrivateUser>("/api/users/me");
    return response.data;
  },
  updateProfile: async (data: UpdateUserProfileDto) => {
    const response = await api.put<PrivateUser>("/api/users/me", data);
    return response.data;
  },
  confirmEmail: async (token: string) => {
    const response = await api.get<{ message: string }>("/api/auth/confirm-email", {
      params: { token },
    });
    return response.data;
  },
  getAll: async (params: UserFilters) => {
    const response = await api.get<PagedResult<UserListItem>>("/api/users", {
      params: userParams(params),
    });
    return response.data;
  },
  getLookingForTeam: async (params: UserFilters) => {
    const response = await api.get<PagedResult<UserListItem>>("/api/users/looking-for-team", {
      params: userParams(params),
    });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<PublicUser>(`/api/users/${id}`);
    return response.data;
  },
};
