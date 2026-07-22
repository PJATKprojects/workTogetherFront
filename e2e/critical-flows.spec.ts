import { expect, test } from "@playwright/test";

import { gotoAfterAuthBootstrap, installApiMock } from "./fixtures";

test.describe("critical browser flows", () => {
  test("email/password auth restores the requested user session", async ({ page }) => {
    const api = await installApiMock(page);
    await gotoAfterAuthBootstrap(page, "/en/auth/login");

    await page.getByLabel("Email").fill("alex@example.test");
    await page.getByLabel("Password", { exact: true }).fill("ValidPassword1");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole("banner").getByRole("link", { name: "Profile" })).toBeVisible();
    expect(api.signedIn).toBe(true);
  });

  test("OAuth invalid state is announced as a recoverable error", async ({ page }) => {
    await installApiMock(page);
    await gotoAfterAuthBootstrap(page, "/en/auth/callback?error=invalid_state");

    await expect(page.getByRole("heading", { name: "Sign-in didn't go through" })).toBeVisible();
    await expect(
      page.getByRole("alert").filter({ hasText: /expired or was already used/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to log in" })).toBeVisible();
  });

  test("new OAuth users continue to community onboarding without an MFA gate", async ({ page }) => {
    await installApiMock(page, {
      authenticated: true,
      requiresCommunityOnboarding: true,
    });
    await gotoAfterAuthBootstrap(page, "/en/auth/callback?returnUrl=%2Fen%2F&onboarding=1");

    await expect(page).toHaveURL(/\/en\/profile\/community-onboarding$/);
    await expect(page.getByRole("heading", { name: "One more step" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Confirm this sensitive action" })).toHaveCount(
      0
    );
  });

  test("a non-MFA 428 response does not open the MFA gate", async ({ page }) => {
    await installApiMock(page, { authenticated: true });
    let rejectedRequests = 0;
    await page.route("**/api/onboarding/progress", async (route) => {
      rejectedRequests += 1;
      await route.fulfill({
        status: 428,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Complete age verification and accept the Community Guidelines to continue.",
        }),
      });
    });

    await gotoAfterAuthBootstrap(page, "/en/");
    await expect.poll(() => rejectedRequests).toBeGreaterThan(0);
    await expect(page.getByRole("dialog", { name: "Confirm this sensitive action" })).toHaveCount(
      0
    );
  });

  test("email confirmation is explicit and reset consumes a one-time token", async ({ page }) => {
    const api = await installApiMock(page);
    await gotoAfterAuthBootstrap(page, "/en/auth/confirm-email?token=one-time-confirm-token");

    await expect(page.getByRole("status")).toContainText(
      "Confirm explicitly to verify this email."
    );
    await expect(page.getByRole("button", { name: "Confirm email" })).toBeVisible();
    expect(api.confirmEmailRequests).toEqual([]);

    await page.getByRole("button", { name: "Confirm email" }).click();
    await expect.poll(() => api.confirmEmailRequests).toHaveLength(1);
    expect(api.confirmEmailRequests[0]).toEqual({ token: "one-time-confirm-token" });
    await expect(page.getByRole("status")).toContainText("Email confirmed successfully.");

    await gotoAfterAuthBootstrap(page, "/en/auth/reset-password?token=one-time-token");

    await page.getByLabel("New password", { exact: true }).fill("ChangedPassword1");
    await page.getByLabel("Confirm new password").fill("ChangedPassword1");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Password updated. All previous sessions have been signed out."
    );
  });

  test("application can be sent and its completion is announced", async ({ page }) => {
    const api = await installApiMock(page, {
      authenticated: true,
      includeProject: true,
    });
    await gotoAfterAuthBootstrap(page, "/en/projects/7");

    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await page
      .getByLabel("CV / LinkedIn / GitHub link")
      .fill("https://github.com/example/accessibility-work");
    const draftKey = "wt:draft:application:user:1:position:17";
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), draftKey))
      .not.toBeNull();

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.dataset.authReady === "true");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByLabel("CV / LinkedIn / GitHub link")).toHaveValue(
      "https://github.com/example/accessibility-work"
    );
    await expect(page.getByRole("status")).toContainText(
      "Your saved application draft was restored."
    );
    await page.getByRole("button", { name: "Send application" }).click();

    await expect(page.getByRole("status")).toHaveText("Application sent");
    expect(api.applications).toHaveLength(1);
    expect(api.applications[0]).toMatchObject({
      projectPositionId: 17,
      attachmentUrl: "https://github.com/example/accessibility-work",
      isDraft: false,
    });
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), draftKey))
      .toBeNull();
  });

  test("report dialog traps focus, submits, closes, and restores focus", async ({ page }) => {
    const api = await installApiMock(page, {
      authenticated: true,
      includePublicUser: true,
    });
    await gotoAfterAuthBootstrap(page, "/en/users/42");

    const reportButton = page.getByRole("button", { name: "Report" });
    await reportButton.click();
    const dialog = page.getByRole("dialog", { name: "Report a safety issue" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Category")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Submit report" })).toBeFocused();

    await dialog.getByLabel("Category").selectOption("scam");
    await dialog.getByLabel("What happened? (optional)").fill("Suspicious payment request.");
    await dialog.getByRole("button", { name: "Submit report" }).click();
    await expect(dialog.getByRole("status")).toContainText("sent to moderation");
    expect(api.reports).toEqual([
      {
        targetType: "user",
        targetId: 42,
        category: "scam",
        details: "Suspicious payment request.",
      },
    ]);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(reportButton).toBeFocused();
  });

  test("blocking a user confirms the action and redirects away from the profile", async ({
    page,
  }) => {
    const api = await installApiMock(page, {
      authenticated: true,
      includePublicUser: true,
    });
    page.on("dialog", (dialog) => void dialog.accept());
    await gotoAfterAuthBootstrap(page, "/en/users/42");

    await page.getByRole("button", { name: "Block" }).click();
    await expect(page).toHaveURL(/\/en\/students$/);
    expect(api.blockedUserIds).toEqual([42]);
  });

  test("accepted application exposes concrete next steps and the team workspace", async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration failed/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      if (/hydration failed/i.test(error.message)) {
        hydrationErrors.push(error.message);
      }
    });
    await installApiMock(page, {
      authenticated: true,
      includeAcceptedApplication: true,
    });
    await gotoAfterAuthBootstrap(page, "/en/applications");

    await expect(page.getByText(/accepted.+next steps/i)).toBeVisible();
    await expect(page.getByText("Open the team chat")).toBeVisible();
    const workspace = page.getByRole("link", { name: "Open team workspace" });
    await expect(workspace).toHaveAttribute("href", "/en/projects/7/team");
    expect(hydrationErrors).toEqual([]);
  });

  test("project template updates the transparent score, previews, then publishes", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(60_000);
    const api = await installApiMock(page, { authenticated: true });
    await gotoAfterAuthBootstrap(page, "/en/projects/new");

    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const errorSummary = page.getByRole("alert").filter({
      hasText: "Please fix these fields",
    });
    await expect(errorSummary).toBeFocused();
    await expect(page.getByLabel("Problem")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Project name")).toHaveCount(0);

    for (const name of [
      /Study project/i,
      /Open source/i,
      /Hackathon/i,
      /Startup validation/i,
      /^Research /i,
      /^Volunteer /i,
    ]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }

    const startupTemplate = page.getByRole("button", { name: /Startup validation/i });
    await startupTemplate.click();
    await expect(startupTemplate).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Use this template" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Template applied. Review every field before publishing."
    );
    const readiness = page.getByRole("progressbar", { name: "Readiness score" });
    await expect(readiness).toHaveAttribute("aria-valuenow", "80");
    await expect(
      page.getByText("Add at least one role with the technologies it will use.")
    ).toBeVisible();

    await page.getByLabel("Problem").fill("Fix onboarding.");
    await expect(readiness).toHaveAttribute("aria-valuenow", "80");
    const draftKey = "wt:draft:project:new:user:1";
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), draftKey))
      .not.toBeNull();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.dataset.authReady === "true");
    await expect(page.getByLabel("Problem")).toHaveValue("Fix onboarding.");
    await expect(page.getByRole("status")).toContainText("Your saved draft was restored.");

    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Role 1").selectOption("3");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Expected outcome").fill("Working demo.");
    await page.locator("#must-1").click();
    await page.getByRole("option", { name: "React", exact: true }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await expect(readiness).toHaveAttribute("aria-valuenow", "100");
    await expect(page.getByText(/transparent checklist/i)).toBeVisible();

    const preview = page.getByRole("region", { name: "Candidate preview" });
    await expect(preview).toContainText("Fix onboarding.");
    await expect(preview).toContainText("Active");
    await expect(preview).toContainText("Remote");
    expect(api.createdProjects).toEqual([]);
    if (process.env.PLAYWRIGHT_VISUAL_EVIDENCE === "1") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: testInfo.outputPath("project-preview.png"),
        fullPage: true,
      });
    }

    await page.getByRole("button", { name: "Publish project" }).click();
    await expect.poll(() => api.createdProjects.length).toBe(1);
    expect(api.createdProjects[0]).toMatchObject({
      problem: "Fix onboarding.",
      expectedOutcome: "Working demo.",
      stage: "prototype",
      format: "remote",
      teamLanguages: ["en"],
      positions: [
        {
          roleId: 3,
          tasks: "Own one validation slice and deliver a reviewable result each week.",
          mustHaveTechnologyIds: [5],
          niceToHaveTechnologyIds: [],
          level: "intermediate",
        },
      ],
    });
    expect(api.createdProjects[0]).not.toHaveProperty("projectName");
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), draftKey))
      .toBeNull();
  });
});
