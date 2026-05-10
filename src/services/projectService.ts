import api from "./api";
import { Project } from "../types/Project";

export const projectService = {
  getAll: async () => {
    const response = await api.get<Project[]>("/projects");
    return response.data;
  },
};
