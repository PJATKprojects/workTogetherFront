import api from "./api";
import type { PrivateUser } from "@/types";

export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type OnboardingIntent = "join" | "find_people" | "both";
export type WorkFormat = "remote" | "local" | "hybrid";

export interface OnboardingSkillInput {
  technologyId: number;
  level: SkillLevel;
}

export interface GithubRepositoryEvidence {
  name: string;
  url: string;
  description?: string;
  primaryLanguage?: string;
  stars: number;
}

export interface GithubImportPreview {
  username: string;
  pinnedRepositories: GithubRepositoryEvidence[];
  languages: string[];
  contributionCount: number;
  reviewedAt: string;
}

export interface DocumentImportPreview {
  source: "cv" | "linkedin";
  suggestedRoleId?: number;
  suggestedSkills: OnboardingSkillInput[];
  suggestedLanguages: string[];
  suggestedGoal?: string;
}

export interface CompleteOnboardingPayload {
  intent: OnboardingIntent;
  primaryRoleId: number;
  skills: OnboardingSkillInput[];
  timeZone: string;
  utcOffsetMinutes: number;
  languages: string[];
  hoursPerWeek: number;
  format: WorkFormat;
  goal: string;
  startDate: string;
  reviewedGithubImport?: GithubImportPreview;
}

export interface OnboardingProgress {
  profileProgressPercent: number;
  steps: Array<{
    code: string;
    completed: boolean;
    current: number;
    target: number;
    improvement: string;
  }>;
  achievements: Array<{ code: string; level: string; awardedAt: string }>;
  newlyUnlocked: string[];
}

export const onboardingService = {
  progress: async () => (await api.get<OnboardingProgress>("/api/onboarding/progress")).data,
  complete: async (payload: CompleteOnboardingPayload) =>
    (await api.put<PrivateUser>("/api/onboarding/complete", payload)).data,
  previewGithub: async (username: string, consent: boolean) =>
    (
      await api.post<GithubImportPreview>("/api/onboarding/imports/github/preview", {
        username,
        consent,
      })
    ).data,
  previewDocument: async (source: "cv" | "linkedin", text: string, consent: boolean) =>
    (
      await api.post<DocumentImportPreview>("/api/onboarding/imports/document/preview", {
        source,
        text,
        consent,
      })
    ).data,
};
