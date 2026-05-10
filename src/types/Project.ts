import { Status, Role, PositionTechnology } from "./index";
import { User } from "./User";

export interface Project {
  id: number;
  projectName: string;
  description: string;
  userId: number;
  statusId: number;
  createdAt: string;
  // Navigation
  owner?: User;
  status?: Status;
  projectPositions?: ProjectPosition[];
}

export interface ProjectPosition {
  id: number;
  projectId: number;
  roleId: number;
  requirements?: string;
  isFilled: boolean;
  // Navigation
  role?: Role;
  positionTechnologies?: PositionTechnology[];
}
