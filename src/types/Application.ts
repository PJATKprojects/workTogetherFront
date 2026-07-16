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
}

export interface CreateApplicationDto {
  projectPositionId: number;
  attachmentUrl: string;
  message?: string;
}

export interface UpdateApplicationStatusDto {
  statusId: 2 | 3;
}
