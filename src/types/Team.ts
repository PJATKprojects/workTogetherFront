export interface ProjectMember {
  userId: number;
  userName: string;
  avatarUrl?: string;
  roleId?: number;
  roleName?: string;
  membershipRole: "owner" | "co_owner" | "member";
  permissions: string[];
  joinedAt: string;
}
export interface ProjectMemberHistory {
  id: number;
  projectId: number;
  userId: number;
  actorUserId?: number;
  action: string;
  reason?: string;
  createdAt: string;
}

export interface TeamCharter {
  goal: string;
  definitionOfDone: string;
  roleExpectations: string;
  weeklyHours: string;
  channels: string;
  meetingCadence: string;
  conflictProtocol: string;
  updatedAt?: string;
}

export interface TrialSprint {
  id: number;
  projectId: number;
  deliverable: string;
  startsAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
}
export interface ProjectMilestone {
  id: number;
  projectId: number;
  title: string;
  description: string;
  linkUrl: string;
  dueAt?: string;
  completedAt?: string;
  createdByUserId: number;
  createdAt: string;
}
export interface WeeklyCheckIn {
  id: number;
  projectId: number;
  userId: number;
  weekOf: string;
  done: string;
  blocked: string;
  next: string;
  createdAt: string;
}
export interface ProjectIntegration {
  id: number;
  projectId: number;
  type: "github" | "discord" | "slack" | "linear" | "trello" | "notion";
  url: string;
  label: string;
  addedByUserId: number;
  addedAt: string;
}
export interface ContributionConfirmation {
  id: number;
  userId: number;
  userName: string;
  contribution: string;
  confirmed: boolean;
  updatedAt: string;
}
