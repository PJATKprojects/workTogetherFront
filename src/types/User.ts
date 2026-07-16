import type { PaginationParams } from "./Common";

/** Social handle (v1.3): type is one of SOCIAL_NETWORKS ids, handle without "@". */
export interface SocialLink {
  type: string;
  handle: string;
}

export interface PublicUser {
  id: number;
  userName: string;
  userDescription: string;
  /** Uploaded file ("/api/files/…") or absolute provider URL; "" when unset. */
  avatarUrl: string;
  githubProfile: string;
  linkedInProfile: string;
  isLookingForTeam: boolean;
  isConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  technologies: string[];
  socialLinks: SocialLink[];
}

export interface PrivateUser extends PublicUser {
  userEmail: string;
  cv: string;
}

export interface UserListItem {
  id: number;
  userName: string;
  userDescription: string;
  avatarUrl: string;
  githubProfile: string;
  isLookingForTeam: boolean;
  technologies: string[];
}

export interface UpdateUserProfileDto {
  userName: string;
  userDescription: string;
  avatarUrl: string;
  githubProfile: string;
  linkedInProfile: string;
  cv: string;
  isLookingForTeam: boolean;
  technologyIds: number[];
  socialLinks: SocialLink[];
}

export interface UserFilters extends PaginationParams {
  search?: string;
  technologyIds?: number[];
  isLookingForTeam?: boolean;
}
