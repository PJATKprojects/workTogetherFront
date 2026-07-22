import type { Page, Route } from "@playwright/test";

import type { OnboardingProgress } from "../src/services/onboardingService";
import type { ProjectDetail } from "../src/types";

export const testUser = {
  id: 1,
  userName: "Alex Builder",
  userEmail: "alex@example.test",
  userDescription: "Product-minded engineer",
  avatarUrl: "",
  githubProfile: "https://github.com/example",
  linkedInProfile: "",
  cv: "https://github.com/example",
  isLookingForTeam: true,
  isConfirmed: true,
  isActive: true,
  isAdmin: false,
  createdAt: "2026-01-01T12:00:00Z",
  technologies: ["TypeScript", "React"],
  skills: [
    { technologyId: 5, name: "React", level: "intermediate" },
    { technologyId: 6, name: "TypeScript", level: "intermediate" },
  ],
  socialLinks: [],
  verificationBadges: [],
  locale: "en",
  timeZone: "Europe/Warsaw",
  utcOffsetMinutes: 120,
  availableFromMinutes: 1080,
  availableToMinutes: 1320,
  hoursPerWeek: 8,
  experienceLevel: "intermediate",
  languages: ["en"],
  collaborationGoal: "ship",
  riskPreference: "balanced",
  workPace: "steady",
  communicationStyle: "async",
  accessibilityNeeds: "",
  onboardingIntent: "both",
  primaryRoleId: 3,
  preferredWorkFormat: "remote",
  availableStartDate: null,
  productOnboardingCompletedAt: "2026-01-01T12:00:00Z",
  githubUsername: "example",
} as const;

export const publicUser = {
  id: 42,
  userName: "Sam Teammate",
  userDescription: "Open-source contributor looking for a thoughtful team.",
  avatarUrl: "",
  githubProfile: "https://github.com/sam",
  linkedInProfile: "",
  isLookingForTeam: true,
  isConfirmed: true,
  isActive: true,
  createdAt: "2025-11-02T12:00:00Z",
  technologies: ["C#", "React"],
  socialLinks: [],
} as const;

export const project = {
  id: 7,
  projectName: "Accessible community toolkit",
  problem: "Community teams need a clearer way to coordinate accessible work.",
  expectedOutcome: "Ship a small, documented toolkit that teams can reuse.",
  stage: "prototype",
  format: "remote",
  duration: "6 weeks",
  hoursPerWeek: 6,
  timeZone: "Europe/Warsaw",
  teamLanguages: ["en"],
  projectLink: "https://github.com/example/accessible-community-toolkit",
  createdAt: "2026-06-01T12:00:00Z",
  owner: {
    id: 2,
    userName: "Project Owner",
    userDescription: "",
    avatarUrl: "",
    githubProfile: "",
    isLookingForTeam: false,
    technologies: [],
  },
  positions: [
    {
      id: 17,
      role: { id: 3, code: "frontend-developer", name: "Frontend developer" },
      tasks: "Ship an accessible project directory.",
      mustHave: [{ id: 5, name: "React" }],
      niceToHave: [{ id: 6, name: "TypeScript" }],
      level: "any",
      isFilled: false,
      lastOwnerActivityAt: "2026-07-15T12:00:00Z",
      freshnessReviewRequiredAt: null,
      applicationsCount: 2,
      hasApplied: false,
    },
  ],
  isOwner: false,
  isMember: false,
  isRecruitmentClosed: false,
  isHidden: false,
  archivedAt: null,
  pendingApplicationsCount: 2,
  teamMemberCount: 2,
  applicationsCount: 3,
  averageResponseHours: 18,
  completedAt: null,
  outcome: "",
  lessonsLearned: "",
  healthStatus: "active",
  lastActivityAt: "2026-07-15T12:00:00Z",
  lastOwnerActivityAt: "2026-07-15T12:00:00Z",
  freshnessReviewRequiredAt: null,
  staleRecruitmentClosedAt: null,
  planRestrictionCode: null,
  qualityScore: 90,
  qualitySuggestions: [],
  changesSinceLastVisit: [],
} as const satisfies ProjectDetail;

export const acceptedApplication = {
  id: 91,
  appliedAt: "2026-07-01T12:00:00Z",
  status: { id: 2, name: "Accepted" },
  applicant: {
    id: testUser.id,
    userName: testUser.userName,
    userDescription: testUser.userDescription,
    avatarUrl: "",
    githubProfile: testUser.githubProfile,
    isLookingForTeam: true,
    technologies: ["TypeScript"],
  },
  position: {
    id: 17,
    role: { id: 3, name: "Frontend developer" },
    project: {
      id: project.id,
      projectName: project.projectName,
      ownerId: 2,
      ownerName: "Project Owner",
    },
  },
  attachmentUrl: testUser.cv,
  message: "I would love to help.",
  whyProject: "The mission matters to me.",
  firstWeekPlan: "Audit the core flows and ship one fix.",
  availability: "6 hours/week",
  viewedAt: "2026-07-02T12:00:00Z",
  ownerResponseDueAt: null,
  reapplyEligibleAt: null,
  rejectionReasonCategory: null,
  rejectionComment: null,
  proposedProjectPositionId: null,
  timeline: [
    {
      id: 1,
      fromStatusId: 1,
      toStatusId: 2,
      toStatusName: "Accepted",
      changedByUserId: 2,
      reasonCategory: null,
      comment: null,
      createdAt: "2026-07-03T12:00:00Z",
    },
  ],
} as const;

type MockOptions = {
  authenticated?: boolean;
  admin?: boolean;
  includeProject?: boolean;
  includePublicUser?: boolean;
  includeAcceptedApplication?: boolean;
  onboardingProgress?: OnboardingProgress;
};

type MockState = {
  signedIn: boolean;
  reports: Array<Record<string, unknown>>;
  applications: Array<Record<string, unknown>>;
  createdProjects: Array<Record<string, unknown>>;
  completedOnboarding: Array<Record<string, unknown>>;
  githubImportRequests: Array<Record<string, unknown>>;
  documentImportRequests: Array<Record<string, unknown>>;
  blockedUserIds: number[];
  adminReports: Array<Record<string, unknown>>;
  adminIllegalContentNotices: Array<Record<string, unknown>>;
  adminAppeals: Array<Record<string, unknown>>;
  adminSanctions: Array<Record<string, unknown>>;
  adminJobRuns: string[];
  confirmEmailRequests: Array<Record<string, unknown>>;
};

const emptyPage = {
  items: [],
  page: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

/**
 * One deterministic API boundary for browser smoke tests. Unknown reads return
 * an empty collection and unknown writes return an empty object, keeping each
 * test focused while all meaningful mutations are captured in MockState.
 */
export async function installApiMock(page: Page, options: MockOptions = {}): Promise<MockState> {
  const state: MockState = {
    signedIn: options.authenticated ?? false,
    reports: [],
    applications: [],
    createdProjects: [],
    completedOnboarding: [],
    githubImportRequests: [],
    documentImportRequests: [],
    blockedUserIds: [],
    adminReports: [
      {
        id: 501,
        reporterUserId: 12,
        reporterName: "Case Reporter",
        targetType: "user",
        targetId: 42,
        targetLabel: "Sam Teammate",
        targetOwnerUserId: 42,
        category: "harassment",
        details: "Repeated hostile messages after being asked to stop.",
        status: "open",
        createdAt: "2026-07-17T10:00:00Z",
      },
    ],
    adminIllegalContentNotices: [
      {
        id: 551,
        reference: "WT-DSA-E2E000000000000000000000000001",
        reporterName: "Public Notifier",
        reporterEmail: "notifier@example.test",
        contentUrl: "http://127.0.0.1:3100/pl/projects/7",
        category: "fraud",
        legalReason: "The project appears to request payment using a fabricated company identity.",
        locale: "pl",
        status: "open",
        correlationId: "e2e-correlation",
        createdAt: "2026-07-18T10:00:00Z",
      },
    ],
    adminAppeals: [
      {
        id: 601,
        sanctionId: 77,
        userId: 42,
        message: "Please review the context and the attached conversation history.",
        status: "open",
        createdAt: "2026-07-17T11:00:00Z",
      },
    ],
    adminSanctions: [
      {
        id: 701,
        userId: 87,
        userName: "Restricted User",
        adminUserId: 1,
        type: "suspension",
        reason: "Repeated scam messages confirmed by moderation evidence.",
        startsAt: "2026-07-16T12:00:00Z",
        endsAt: "2026-07-23T12:00:00Z",
        isActive: true,
      },
    ],
    adminJobRuns: [],
    confirmEmailRequests: [],
  };
  const currentUser = options.admin ? { ...testUser, isAdmin: true } : testUser;

  await page.route("**/hubs/**", (route) => route.abort());
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname;

    if (method === "OPTIONS") return route.fulfill({ status: 204 });

    if (path === "/api/auth/refresh") {
      return state.signedIn
        ? json(route, {
            token: "e2e-access-token",
            user: currentUser,
            requiresCommunityOnboarding: false,
            requiresProductOnboarding: false,
          })
        : json(route, { message: "No active session" }, 401);
    }

    if (path === "/api/auth/login" && method === "POST") {
      state.signedIn = true;
      return json(route, {
        token: "e2e-access-token",
        user: currentUser,
        requiresCommunityOnboarding: false,
        requiresProductOnboarding: false,
      });
    }

    if (path === "/api/auth/reset-password" && method === "POST") {
      return json(route, { message: "Password reset." });
    }

    if (path === "/api/auth/confirm-email" && method === "POST") {
      state.confirmEmailRequests.push(request.postDataJSON() as Record<string, unknown>);
      return json(route, { message: "Email confirmed successfully." });
    }

    if (
      path === "/api/applications/received/pending-count" ||
      path === "/api/conversations/unread-count" ||
      path === "/api/notifications/unread-count"
    ) {
      return json(route, { count: 0 });
    }

    if (path === "/api/users/me" && method === "GET") {
      return json(route, currentUser);
    }

    if (path === "/api/users/me" && method === "PUT") {
      return json(route, {
        ...currentUser,
        ...(request.postDataJSON() as Record<string, unknown>),
      });
    }

    if (path === "/api/onboarding/progress") {
      return json(
        route,
        options.onboardingProgress ?? {
          profileProgressPercent: 50,
          steps: [],
          achievements: [],
          newlyUnlocked: [],
        }
      );
    }

    if (path === "/api/admin/operations/overview" && method === "GET") {
      return json(route, {
        generatedAt: "2026-07-17T12:00:00Z",
        correlationId: "e2e-admin-correlation",
        users: { total: 240, active: 219, newLast24Hours: 8, activeSessions: 73 },
        projects: { total: 91, recruiting: 62, stale: 4 },
        applications: { total: 418, waiting: 17, sentLast24Hours: 29 },
        moderation: { openReports: 1, openAppeals: 1, activeSanctions: 3 },
        delivery: {
          outboxPending: 2,
          outboxDeadLetter: 1,
          oldestOutboxAgeSeconds: 480,
          pushPending: 4,
          pushExhausted: 0,
        },
        jobs: { total: 6, running: 1, failed: 0, lagging: 0 },
        process: {
          uptimeSeconds: 86400,
          workingSetBytes: 134217728,
          threadCount: 18,
          databaseSizeBytes: 1073741824,
          storageSizeBytes: 536870912,
        },
        observability: {
          apmExportConfigured: true,
          metricsEndpointEnabled: true,
          slowQueryThresholdMs: 750,
          outboxAgeAlertMinutes: 15,
          scheduledJobLagAlertMinutes: 10,
        },
        alerts: [
          {
            code: "outbox_dead_letter",
            severity: "warning",
            value: 1,
            threshold: 0,
          },
        ],
        counters: {
          authAttempts: 31,
          loginAttempts: 19,
          resetAttempts: 7,
          oauthAttempts: 5,
          authRejected: 4,
          applicationErrors: 2,
          rateLimitRejects: 3,
          signalRReconnects: 5,
          slowQueries: 1,
          pushFailures: 2,
          jobRuns: 48,
          jobFailures: 1,
          requestCount: 810,
          requestErrors: 4,
          averageLatencyMs: 84.4,
          errorRatePercent: 0.49,
        },
      });
    }

    if (path === "/api/admin/operations/jobs" && method === "GET") {
      return json(route, [
        {
          name: "email-outbox",
          lastSucceededAt: "2026-07-17T11:59:00Z",
          runCount: 40,
          failureCount: 1,
          nextExpectedRunAt: "2026-07-17T12:01:00Z",
          heartbeatAt: "2026-07-17T11:59:30Z",
          isRunning: false,
          isLagging: false,
          manualRunPending: false,
        },
      ]);
    }

    const adminJobMatch = path.match(/^\/api\/admin\/operations\/jobs\/([^/]+)\/run$/);
    if (adminJobMatch && method === "POST") {
      state.adminJobRuns.push(decodeURIComponent(adminJobMatch[1]));
      return json(route, { message: "Queued" }, 202);
    }

    if (path === "/api/admin/operations/users" && method === "GET") {
      return json(route, {
        ...emptyPage,
        items: [
          {
            id: 42,
            userName: "Sam Teammate",
            email: "s***m@example.test",
            isActive: true,
            isConfirmed: true,
            isAdmin: false,
            createdAt: "2025-11-02T12:00:00Z",
            loginMethods: ["github"],
            activeSessions: 1,
            badges: {
              email: true,
              github: true,
              completedCollaboration: true,
              attestations: [{ type: "domain", label: "example.test" }],
            },
          },
        ],
        totalCount: 1,
        totalPages: 1,
      });
    }

    if (path === "/api/admin/moderation/reports" && method === "GET") {
      return json(route, state.adminReports);
    }

    if (path === "/api/admin/moderation/illegal-content-notices" && method === "GET") {
      return json(route, state.adminIllegalContentNotices);
    }

    const adminIllegalNoticeMatch = path.match(
      /^\/api\/admin\/moderation\/illegal-content-notices\/(\d+)$/
    );
    if (adminIllegalNoticeMatch && method === "PATCH") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const notice = state.adminIllegalContentNotices.find(
        (item) => item.id === Number(adminIllegalNoticeMatch[1])
      );
      if (notice) Object.assign(notice, payload);
      return json(route, notice ?? {}, notice ? 200 : 404);
    }

    const adminReportMatch = path.match(/^\/api\/admin\/moderation\/reports\/(\d+)$/);
    if (adminReportMatch && method === "PATCH") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const report = state.adminReports.find((item) => item.id === Number(adminReportMatch[1]));
      if (report) Object.assign(report, payload);
      return json(route, report ?? {}, report ? 200 : 404);
    }

    if (path === "/api/admin/moderation/appeals" && method === "GET") {
      return json(route, state.adminAppeals);
    }

    const adminAppealMatch = path.match(/^\/api\/admin\/moderation\/appeals\/(\d+)$/);
    if (adminAppealMatch && method === "PATCH") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const appeal = state.adminAppeals.find((item) => item.id === Number(adminAppealMatch[1]));
      if (appeal) Object.assign(appeal, payload);
      return json(route, appeal ?? {}, appeal ? 200 : 404);
    }

    if (path === "/api/admin/moderation/sanctions" && method === "GET") {
      const filter = url.searchParams.get("state") || "active";
      return json(
        route,
        state.adminSanctions.filter((item) => {
          if (filter === "all") return true;
          if (filter === "revoked") return Boolean(item.revokedAt);
          if (filter === "expired") return !item.isActive && !item.revokedAt;
          return item.isActive;
        })
      );
    }

    if (path === "/api/admin/moderation/sanctions" && method === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const id = 700 + state.adminSanctions.length + 1;
      state.adminSanctions.push({
        id,
        userId: payload.userId,
        userName: `User #${payload.userId}`,
        adminUserId: 1,
        type: payload.type,
        reason: payload.reason,
        startsAt: "2026-07-17T12:00:00Z",
        endsAt: payload.endsAt,
        isActive: true,
      });
      return json(route, { id }, 201);
    }

    const adminSanctionMatch = path.match(/^\/api\/admin\/moderation\/sanctions\/(\d+)$/);
    if (adminSanctionMatch && method === "DELETE") {
      const sanction = state.adminSanctions.find(
        (item) => item.id === Number(adminSanctionMatch[1])
      );
      if (!sanction) return json(route, {}, 404);
      sanction.isActive = false;
      sanction.revokedAt = "2026-07-17T12:01:00Z";
      return route.fulfill({ status: 204 });
    }

    if (path === "/api/admin/moderation/audit" && method === "GET") {
      return json(route, [
        {
          id: 801,
          actorUserId: 1,
          action: "report_status_changed",
          entityType: "report",
          entityId: "500",
          metadataJson: '{"status":"reviewing"}',
          ipAddress: "[redacted]",
          createdAt: "2026-07-17T09:00:00Z",
        },
      ]);
    }

    if (path === "/api/admin/email-outbox" && method === "GET") {
      return json(route, {
        ...emptyPage,
        items: [
          {
            messageId: "00000000-0000-0000-0000-000000000901",
            type: "password_reset",
            correlationId: "e2e-mail-correlation",
            recipientEmail: "a***x@example.test",
            subject: "Reset your password",
            attempts: 5,
            maxAttempts: 5,
            lastError: "SMTP timeout",
            createdAt: "2026-07-17T08:00:00Z",
            nextAttemptAt: "2026-07-17T08:05:00Z",
            deadLetteredAt: "2026-07-17T08:30:00Z",
            isLeased: false,
          },
        ],
        totalCount: 1,
        totalPages: 1,
      });
    }

    if (path === "/api/onboarding/imports/github/preview" && method === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      state.githubImportRequests.push(payload);
      return json(route, {
        username: payload.username,
        pinnedRepositories: [
          {
            name: "accessible-onboarding",
            url: "https://github.com/alex/accessible-onboarding",
            description: "A small onboarding reference",
            primaryLanguage: "TypeScript",
            stars: 4,
          },
        ],
        languages: ["TypeScript"],
        contributionCount: 42,
        reviewedAt: "2026-07-17T12:00:00Z",
      });
    }

    if (path === "/api/onboarding/imports/document/preview" && method === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      state.documentImportRequests.push(payload);
      return json(route, {
        source: payload.source,
        suggestedRoleId: 3,
        suggestedSkills: [{ technologyId: 6, level: "intermediate" }],
        suggestedLanguages: ["en", "pl"],
        suggestedGoal: "Build a useful accessible product",
      });
    }

    if (path === "/api/onboarding/complete" && method === "PUT") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      state.completedOnboarding.push(payload);
      return json(route, {
        ...testUser,
        onboardingIntent: payload.intent,
        primaryRoleId: payload.primaryRoleId,
        preferredWorkFormat: payload.format,
        availableStartDate: payload.startDate,
        productOnboardingCompletedAt: "2026-07-17T12:00:00Z",
      });
    }

    if (path === "/api/lookups/roles" && method === "GET") {
      return json(route, [
        { id: 3, name: "Frontend developer" },
        { id: 4, name: "Product designer" },
      ]);
    }

    if (path === "/api/lookups/technologies" && method === "GET") {
      return json(route, [
        { id: 5, name: "React" },
        { id: 6, name: "TypeScript" },
      ]);
    }

    if (path === "/api/lookups/project-statuses" && method === "GET") {
      return json(route, [
        { id: 1, name: "Open" },
        { id: 2, name: "In progress" },
        { id: 3, name: "Finished" },
      ]);
    }

    if (path === "/api/projects/7" && method === "GET" && options.includeProject) {
      return json(route, project);
    }

    if (path === "/api/matching/projects" && method === "GET") {
      return json(
        route,
        [7, 8, 9].map((id, index) => ({
          project: {
            ...project,
            id,
            projectName: [
              "Accessible community toolkit",
              "Open-source onboarding guide",
              "Inclusive study planner",
            ][index],
          },
          score: 94 - index * 5,
          reasons: [
            {
              code: "skill_overlap",
              explanation: "Matches your selected role, skills, and availability.",
              points: 40,
            },
          ],
          diversitySlot: false,
        }))
      );
    }

    if (path === "/api/projects" && method === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      state.createdProjects.push(payload);
      return json(route, { ...project, ...payload, id: 8, isOwner: true }, 201);
    }

    if (path === "/api/applications" && method === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      state.applications.push(payload);
      return json(route, {
        ...acceptedApplication,
        id: 92,
        status: { id: payload.isDraft ? 4 : 1, name: payload.isDraft ? "Draft" : "Sent" },
      });
    }

    if (path === "/api/applications/my" && method === "GET" && options.includeAcceptedApplication) {
      return json(route, {
        ...emptyPage,
        items: [acceptedApplication],
        totalCount: 1,
        totalPages: 1,
      });
    }

    if (path === "/api/users/42" && method === "GET" && options.includePublicUser) {
      return json(route, publicUser);
    }

    if (path === "/api/conversations/notes/42" && method === "GET") {
      return json(route, { targetUserId: 42, text: "", updatedAt: null });
    }

    if (path === "/api/reports" && method === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      state.reports.push(payload);
      return json(route, {
        id: 301,
        reporterUserId: testUser.id,
        ...payload,
        status: "open",
        createdAt: "2026-07-17T12:00:00Z",
      });
    }

    if (path === "/api/legal/illegal-content-notices" && method === "POST") {
      return json(
        route,
        {
          reference: "WT-DSA-E2E000000000000000000000000002",
          status: "open",
          receivedAt: "2026-07-18T12:00:00Z",
        },
        201
      );
    }

    const blockMatch = path.match(/^\/api\/blocks\/(\d+)$/);
    if (blockMatch && method === "POST") {
      state.blockedUserIds.push(Number(blockMatch[1]));
      return route.fulfill({ status: 204 });
    }

    if (method === "GET") return json(route, emptyPage);
    return json(route, {});
  });

  return state;
}

/** Wait for the client AuthProvider to finish hydration before typing. */
export async function gotoAfterAuthBootstrap(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.authReady === "true");
}
