import api from "./api";
import { User } from "../types/User";

export const userService = {
  // List all users
  getAll: async () => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  // get User by ID
  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
};
