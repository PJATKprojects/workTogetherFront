import type { PaginationParams } from "./Common";
import type { Locale } from "@/i18n/locales";

/** Social handle (v1.3): type is one of SOCIAL_NETWORKS ids, handle without "@". */
export interface SocialLink {
  type: string;
  handle: string;
}

export interface VerificationBadge {
  type: "email" | "github" | "domain" | "organization" | "completed_collaboration";
  label: string;
  verifiedAt: string;
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
  skills: Array<{
    technologyId: number;
    name: string;
    level: "beginner" | "intermediate" | "advanced";
  }>;
  socialLinks: SocialLink[];
  verificationBadges: VerificationBadge[];
}

export interface PrivateUser extends PublicUser {
  userEmail: string;
  cv: string;
  isAdmin: boolean;
  locale: Locale;
  timeZone: string;
  utcOffsetMinutes: number | null;
  availableFromMinutes: number | null;
  availableToMinutes: number | null;
  hoursPerWeek: number | null;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  languages: string[];
  collaborationGoal: string;
  riskPreference: string;
  workPace: string;
  communicationStyle: string;
  accessibilityNeeds: string;
  onboardingIntent: "join" | "find_people" | "both" | "";
  primaryRoleId: number | null;
  preferredWorkFormat: "remote" | "local" | "hybrid" | "";
  availableStartDate: string | null;
  productOnboardingCompletedAt: string | null;
  githubUsername: string;
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
  locale: Locale;
  timeZone: string;
  utcOffsetMinutes: number | null;
  availableFromMinutes: number | null;
  availableToMinutes: number | null;
  hoursPerWeek: number | null;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  languages: string[];
  collaborationGoal: string;
  riskPreference: string;
  workPace: string;
  communicationStyle: string;
  accessibilityNeeds: string;
}

export interface UserFilters extends PaginationParams {
  search?: string;
  technologyIds?: number[];
  isLookingForTeam?: boolean;
}
