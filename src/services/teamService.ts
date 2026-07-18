import type {
  ContributionConfirmation,
  ProjectIntegration,
  ProjectMember,
  ProjectMemberHistory,
  ProjectMilestone,
  TeamCharter,
  TrialSprint,
  WeeklyCheckIn,
} from "@/types";
import api from "./api";

const base = (projectId: number) => `/api/projects/${projectId}/team`;
export const teamService = {
  roster: async (projectId: number) => (await api.get<ProjectMember[]>(base(projectId))).data,
  history: async (projectId: number) =>
    (await api.get<ProjectMemberHistory[]>(`${base(projectId)}/history`)).data,
  conversation: async (projectId: number) =>
    (await api.get<{ conversationId: number | null }>(`${base(projectId)}/conversation`)).data,
  charter: async (projectId: number) =>
    (await api.get<TeamCharter>(`${base(projectId)}/charter`)).data,
  saveCharter: async (projectId: number, charter: TeamCharter) =>
    (await api.put<TeamCharter>(`${base(projectId)}/charter`, charter)).data,
  trialSprints: async (projectId: number) =>
    (await api.get<TrialSprint[]>(`${base(projectId)}/trial-sprints`)).data,
  createTrialSprint: async (
    projectId: number,
    deliverable: string,
    startsAt: string,
    endsAt: string
  ) =>
    (
      await api.post<TrialSprint>(`${base(projectId)}/trial-sprints`, {
        deliverable,
        startsAt,
        endsAt,
      })
    ).data,
  milestones: async (projectId: number) =>
    (await api.get<ProjectMilestone[]>(`${base(projectId)}/milestones`)).data,
  createMilestone: async (
    projectId: number,
    data: { title: string; description?: string; linkUrl?: string; dueAt?: string }
  ) => (await api.post<ProjectMilestone>(`${base(projectId)}/milestones`, data)).data,
  toggleMilestone: async (projectId: number, milestoneId: number) =>
    (await api.patch<ProjectMilestone>(`${base(projectId)}/milestones/${milestoneId}/complete`))
      .data,
  checkIns: async (projectId: number) =>
    (await api.get<WeeklyCheckIn[]>(`${base(projectId)}/check-ins`)).data,
  saveCheckIn: async (
    projectId: number,
    data: { weekOf?: string; done: string; blocked?: string; next: string }
  ) => (await api.put<WeeklyCheckIn>(`${base(projectId)}/check-ins`, data)).data,
  integrations: async (projectId: number) =>
    (await api.get<ProjectIntegration[]>(`${base(projectId)}/integrations`)).data,
  addIntegration: async (
    projectId: number,
    data: { type: ProjectIntegration["type"]; url: string; label?: string }
  ) => (await api.post<ProjectIntegration>(`${base(projectId)}/integrations`, data)).data,
  removeIntegration: async (projectId: number, integrationId: number) => {
    await api.delete(`${base(projectId)}/integrations/${integrationId}`);
  },
  changeRole: async (projectId: number, userId: number, membershipRole: "member" | "co_owner") => {
    await api.put(`${base(projectId)}/members/${userId}/role`, { membershipRole });
  },
  changePermissions: async (projectId: number, userId: number, permissions: string[]) => {
    await api.put(`${base(projectId)}/members/${userId}/permissions`, { permissions });
  },
  transferOwnership: async (projectId: number, targetUserId: number) => {
    await api.post(`${base(projectId)}/transfer-ownership`, { targetUserId });
  },
  removeMember: async (projectId: number, userId: number, reason: string) => {
    await api.delete(`${base(projectId)}/members/${userId}`, { data: { reason } });
  },
  leave: async (projectId: number) => {
    await api.post(`${base(projectId)}/leave`);
  },
  complete: async (
    projectId: number,
    data: { outcome: string; demoUrl?: string; repositoryUrl?: string; lessonsLearned: string }
  ) => {
    await api.put(`${base(projectId)}/complete`, data);
  },
  confirmContribution: async (projectId: number, contribution: string, confirmed: boolean) =>
    (
      await api.put<ContributionConfirmation>(`${base(projectId)}/contribution`, {
        contribution,
        confirmed,
      })
    ).data,
  contributions: async (projectId: number) =>
    (await api.get<ContributionConfirmation[]>(`${base(projectId)}/contributions`)).data,
};
