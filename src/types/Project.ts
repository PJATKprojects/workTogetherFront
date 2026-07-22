import type { PaginationParams } from "./Common";
import type { Role, Technology } from "./Lookup";
import type { UserListItem } from "./User";

export type ProjectHealth = "active" | "slow" | "paused" | "completed" | "abandoned";
export type ProjectStage = "idea" | "prototype" | "mvp" | "growth";
export type ProjectFormat = "remote" | "local" | "hybrid";
export type PositionLevel = "beginner" | "intermediate" | "advanced" | "any";

export type ProjectQualitySuggestion =
  | "problem"
  | "expectedOutcome"
  | "logistics"
  | "timezone"
  | "languages"
  | "positions"
  | "tasks"
  | "mustHave"
  | "level";

export interface ProjectListItem {
  id: number;
  projectName: string;
  problem: string;
  expectedOutcome: string;
  stage: ProjectStage;
  format: ProjectFormat;
  duration: string;
  hoursPerWeek: number | null;
  timeZone: string;
  teamLanguages: string[];
  projectLink: string | null;
  createdAt: string;
  owner: Pick<UserListItem, "id" | "userName">;
  openPositionsCount: number;
  totalPositionsCount: number;
  applicationsCount: number;
  pendingApplicationsCount: number;
  isRecruitmentClosed: boolean;
  isHidden: boolean;
  planRestrictionCode: "free_active_project_limit" | null;
  archivedAt: string | null;
  healthStatus: ProjectHealth;
  lastActivityAt: string;
  lastOwnerActivityAt: string;
  qualityScore: number | null;
}

export interface ProjectPosition {
  id: number;
  role: Role;
  tasks: string;
  mustHave: Technology[];
  niceToHave: Technology[];
  level: PositionLevel;
  isFilled: boolean;
  lastOwnerActivityAt: string;
  freshnessReviewRequiredAt: string | null;
  applicationsCount: number;
  hasApplied: boolean;
}

export interface ProjectDetail extends Omit<
  ProjectListItem,
  "owner" | "openPositionsCount" | "totalPositionsCount"
> {
  owner: UserListItem;
  positions: ProjectPosition[];
  isOwner: boolean;
  isMember: boolean;
  teamMemberCount: number;
  averageResponseHours: number | null;
  completedAt: string | null;
  outcome: string;
  lessonsLearned: string;
  freshnessReviewRequiredAt: string | null;
  staleRecruitmentClosedAt: string | null;
  qualitySuggestions: ProjectQualitySuggestion[];
  changesSinceLastVisit: Array<{
    type: "conditions" | "compensation" | "role" | "team";
    field: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: string;
  }>;
}

export interface CreatePositionDto {
  roleId: number;
  tasks: string;
  mustHaveTechnologyIds: number[];
  niceToHaveTechnologyIds: number[];
  level: PositionLevel;
}

export interface UpdatePositionDto {
  tasks: string;
  mustHaveTechnologyIds: number[];
  niceToHaveTechnologyIds: number[];
  level: PositionLevel;
}

export interface ProjectWriteDto {
  problem: string;
  expectedOutcome: string;
  stage: ProjectStage;
  format: ProjectFormat;
  duration: string;
  hoursPerWeek?: number | null;
  timeZone: string;
  teamLanguages: string[];
  projectLink?: string | null;
}

export interface CreateProjectDto extends ProjectWriteDto {
  clientRequestId?: string;
  positions: CreatePositionDto[];
}

export interface UpdateProjectDto extends ProjectWriteDto {
  healthStatus: ProjectHealth;
}

export interface ProjectFilters extends PaginationParams {
  search?: string;
  roleId?: number;
  technologyIds?: number[];
  hasOpenPositions?: boolean;
  sort?: string;
  skillMode?: "and" | "or";
  positionLevel?: PositionLevel;
  utcOffsetMinutes?: number;
  minimumOverlapHours?: number;
  maxHoursPerWeek?: number;
  language?: string;
  format?: ProjectFormat;
  stage?: ProjectStage;
  healthStatus?: ProjectHealth;
  activeWithinDays?: number;
}
