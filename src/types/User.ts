import { Technology } from "./index";

export interface User {
  id: number;
  userName: string;
  userNickname: string;
  userDescription: string;
  userEmail: string;
  cv?: string; // Optional if not uploaded
  createdAt: string; // ISO Date string from C#
  isLookingForTeam: boolean;
  linkedInProfile?: string;
  githubProfile?: string;
  isConfirmed: boolean;
  isActive: boolean;
  // Navigation properties
  userTechnologies?: UserTechnology[];
}

export interface UserTechnology {
  userId: number;
  technologyId: number;
  technology?: Technology;
}
