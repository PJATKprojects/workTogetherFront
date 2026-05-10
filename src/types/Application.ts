import { User } from "./User";
import { ProjectPosition } from "./Project";

export interface ApplicationStatus {
  id: number;
  name: string; // Pending, Accepted, Rejected
}

export interface Application {
  id: number;
  userId: number;
  projectPositionId: number;
  applicationStatusId: number;
  appliedAt: string;
  // Navigation
  applicant?: User;
  projectPosition?: ProjectPosition;
  applicationStatus?: ApplicationStatus;
}
