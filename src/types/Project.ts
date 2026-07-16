import type { PaginationParams } from "./Common";
import type { ProjectStatus, Role, Technology } from "./Lookup";
import type { UserListItem } from "./User";

export interface ProjectListItem {
  id: number;
  projectName: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  owner: Pick<UserListItem, "id" | "userName">;
  openPositionsCount: number;
  totalPositionsCount: number;
  applicationsCount: number;
  pendingApplicationsCount: number;
  isRecruitmentClosed: boolean;
  isHidden: boolean;
  technologies: string[];
}

export interface ProjectPosition {
  id: number;
  role: Role;
  description: string | null;
  requirements: string | null;
  isFilled: boolean;
  technologies: Technology[];
  applicationsCount: number;
  /** True when the current user already applied to this position (v1.3). */
  hasApplied: boolean;
}

export interface ProjectDetail {
  id: number;
  projectName: string;
  description: string;
  /** Sanitized rich-text HTML body (v1.3), null when not provided. */
  fullDescription: string | null;
  status: ProjectStatus;
  createdAt: string;
  owner: UserListItem;
  positions: ProjectPosition[];
  isOwner: boolean;
  isRecruitmentClosed: boolean;
  isHidden: boolean;
}

export interface CreatePositionDto {
  roleId: number;
  description?: string | null;
  requirements?: string | null;
  technologyIds: number[];
}

export interface UpdatePositionDto {
  description?: string | null;
  requirements?: string | null;
  technologyIds: number[];
}

export interface CreateProjectDto {
  projectName: string;
  description: string;
  fullDescription?: string | null;
  positions: CreatePositionDto[];
}

export interface UpdateProjectDto {
  projectName: string;
  description: string;
  fullDescription?: string | null;
  statusId: number;
}

export interface ProjectFilters extends PaginationParams {
  search?: string;
  statusId?: number;
  roleId?: number;
  technologyIds?: number[];
  hasOpenPositions?: boolean;
  sort?: string;
}
