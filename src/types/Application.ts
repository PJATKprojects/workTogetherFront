import type { ApplicationStatus, Role } from "./Lookup";
import type { UserListItem } from "./User";

export interface ApplicationDto {
  id: number;
  appliedAt: string;
  status: ApplicationStatus;
  applicant: UserListItem;
  position: {
    id: number;
    role: Role;
    project: {
      id: number;
      projectName: string;
      ownerId: number;
      ownerName: string;
    };
  };
  /** Applicant's CV / LinkedIn / GitHub link supplied at apply time. */
  attachmentUrl: string;
  /** Optional note from the applicant to the owner (v1.3). */
  message: string | null;
  whyProject: string;
  firstWeekPlan: string;
  availability: string;
  viewedAt: string | null;
  ownerResponseDueAt: string | null;
  reapplyEligibleAt: string | null;
  rejectionReasonCategory: string | null;
  rejectionComment: string | null;
  proposedProjectPositionId: number | null;
  timeline: Array<{
    id: number;
    fromStatusId: number | null;
    toStatusId: number;
    toStatusName: string;
    changedByUserId: number | null;
    reasonCategory: string | null;
    comment: string | null;
    createdAt: string;
  }>;
}

export interface CreateApplicationDto {
  clientRequestId?: string;
  projectPositionId: number;
  attachmentUrl: string;
  message?: string;
  isDraft?: boolean;
  whyProject?: string;
  firstWeekPlan?: string;
  availability?: string;
}

export interface UpdateApplicationDraftDto {
  attachmentUrl?: string;
  message?: string;
  whyProject?: string;
  firstWeekPlan?: string;
  availability?: string;
}

export interface UpdateApplicationStatusDto {
  statusId: 2 | 3 | 6 | 7 | 8;
  rejectionReasonCategory?:
    | "skills"
    | "availability"
    | "experience"
    | "position_filled"
    | "project_changed"
    | "other";
  rejectionComment?: string;
  proposedProjectPositionId?: number;
}
