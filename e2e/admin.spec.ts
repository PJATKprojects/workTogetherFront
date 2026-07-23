import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoAfterAuthBootstrap, installApiMock } from "./fixtures";

test.describe("separate administration control center", () => {
  test("tracks operations and manages reports, appeals, sanctions, jobs and badges", async ({
    page,
  }) => {
    test.setTimeout(45_000);
    const api = await installApiMock(page, { authenticated: true, admin: true });
    await gotoAfterAuthBootstrap(page, "/en/admin");

    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();
    await expect(page.getByText("Administrator role verified")).toBeVisible();
    await expect(page.getByText("Operational alerts")).toBeVisible();
    await expect(page.getByText("Dead-letter email requires review")).toBeVisible();
    await expect(page.getByText("84.4 ms")).toBeVisible();
    await expect(page.getByText("0.49%")).toBeVisible();
    await expect(page.getByText("Login attempts")).toBeVisible();
    await expect(page.getByText("Password reset attempts")).toBeVisible();
    await expect(page.getByText("OAuth attempts", { exact: true })).toBeVisible();

    const overviewTab = page.getByRole("tab", { name: "Overview" });
    await overviewTab.focus();
    await page.keyboard.press("ArrowRight");
    const analyticsTab = page.getByRole("tab", { name: "Device analytics" });
    await expect(analyticsTab).toBeFocused();
    await expect(analyticsTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: "Device analytics" })).toBeVisible();
    await expect(page.getByText("180", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Device mix")).toBeVisible();

    const moderationTab = page.getByRole("tab", { name: "Moderation" });
    await moderationTab.click();
    await expect(moderationTab).toHaveAttribute("aria-selected", "true");

    await expect(page.getByRole("heading", { name: "DSA illegal-content notices" })).toBeVisible();
    await page
      .getByLabel("Statement of reasons sent with the final decision")
      .fill("The reported solicitation was removed after the evidence was verified.");
    await page.getByRole("button", { name: "Action taken" }).click();
    await expect(page.getByRole("status")).toContainText("Illegal-content notice updated");
    expect(api.adminIllegalContentNotices[0]).toMatchObject({
      status: "actioned",
      decision: "The reported solicitation was removed after the evidence was verified.",
    });

    await expect(page.getByRole("heading", { name: "Report queue" })).toBeVisible();
    await expect(page.getByText("#501 harassment · user 42")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sam Teammate" })).toBeVisible();
    await page.getByRole("button", { name: "Resolve", exact: true }).click();
    await expect(page.getByLabel("Internal resolution note")).toBeFocused();
    await expect(page.getByLabel("Internal resolution note")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    await page.getByLabel("Internal resolution note").fill("Evidence reviewed; action recorded.");
    await page.getByRole("button", { name: "Resolve", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Report #501 updated.");
    expect(api.adminReports[0]).toMatchObject({
      status: "resolved",
      resolution: "Evidence reviewed; action recorded.",
    });

    await page
      .getByLabel("Decision reason")
      .fill("The sanction did not meet the documented threshold.");
    await page.getByRole("button", { name: "Accept", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Appeal #601 updated.");
    expect(api.adminAppeals[0]).toMatchObject({
      status: "accepted",
      resolution: "The sanction did not meet the documented threshold.",
    });

    await expect(page.getByRole("heading", { name: "Sanctions" })).toBeVisible();
    await expect(page.getByText("Restricted User")).toBeVisible();
    await page.getByRole("button", { name: "Revoke sanction" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Revoke sanction" }).click();
    await expect(page.getByRole("status")).toContainText("Sanction revoked.");
    expect(api.adminSanctions[0]).toMatchObject({ id: 701, isActive: false });

    await page.getByRole("button", { name: "Apply sanction" }).click();
    await expect(page.getByLabel("User ID")).toBeFocused();
    await expect(page.getByLabel("User ID")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#sanction-user-error")).toBeVisible();

    await page.getByLabel("User ID").fill("42");
    await page.getByLabel("Reason and evidence").fill("Confirmed policy violation.");
    await page.getByRole("button", { name: "Apply sanction" }).click();
    await expect(page.getByRole("status")).toContainText("Sanction created.");
    expect(api.adminSanctions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: 42,
          type: "warning",
          reason: "Confirmed policy violation.",
          isActive: true,
        }),
      ])
    );

    const seriousViolations = (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
    expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);

    await page.getByRole("tab", { name: "Email delivery" }).click();
    await expect(page.getByRole("heading", { name: "Email delivery queue" })).toBeVisible();
    await expect(page.getByText("SMTP timeout")).toBeVisible();

    await page.getByRole("tab", { name: "Scheduled jobs" }).click();
    await expect(page.getByRole("cell", { name: "email-outbox" })).toBeVisible();
    await page.getByRole("button", { name: "Run safely" }).click();
    await expect.poll(() => api.adminJobRuns).toEqual(["email-outbox"]);

    await page.getByRole("tab", { name: "Users", exact: true }).click();
    await expect(page.getByText("Email", { exact: true })).toBeVisible();
    await expect(page.getByText("GitHub", { exact: true })).toBeVisible();
    await expect(page.getByText("Completed collaboration", { exact: true })).toBeVisible();
    await expect(page.getByText("domain: example.test", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Account status").locator('option[value="deleted"]')).toHaveCount(
      0
    );

    await page.getByRole("tab", { name: "Deleted users" }).click();
    await expect(page.getByRole("heading", { name: "Deleted users" })).toBeVisible();
    await expect(page.getByText("#77 · Deleted user", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete account" })).toHaveCount(0);

    await page.getByRole("tab", { name: "Audit log" }).click();
    await expect(page.getByRole("heading", { name: "Administrative audit log" })).toBeVisible();
    const auditEvent = page.locator("details").filter({ hasText: "Report status changed" });
    await auditEvent.locator("summary").press("Enter");
    await expect(auditEvent).toHaveAttribute("open", "");
    await expect(page.getByText("Exact time (UTC)")).toBeVisible();
    await expect(page.getByText("Admin Operator · a***r@example.test")).toBeVisible();
  });

  test("filters, bans, unbans and deletes accounts from the user directory", async ({ page }) => {
    test.setTimeout(45_000);
    const api = await installApiMock(page, { authenticated: true, admin: true });
    await gotoAfterAuthBootstrap(page, "/en/admin?section=users");

    await expect(page.getByRole("heading", { name: "User directory" })).toBeVisible();
    await page.getByLabel("Search").fill("Sam");
    await page.getByLabel("Role").selectOption("member");
    await page.getByLabel("Sort").selectOption("name");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByText("1 accounts found")).toBeVisible();
    await expect(page.getByRole("link", { name: "#42 · Sam Teammate" })).toBeVisible();

    await page.getByRole("button", { name: "Ban account" }).click();
    const banDialog = page.getByRole("alertdialog");
    await banDialog.getByLabel("Reason").fill("Repeated automated spam confirmed by support.");
    await banDialog.getByRole("button", { name: "Ban account" }).click();
    await expect(page.getByRole("status")).toContainText("Sam Teammate was banned.");
    await expect(page.getByRole("listitem").getByText("Banned", { exact: true })).toBeVisible();

    await page.getByLabel("Account status").selectOption("banned");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByRole("button", { name: "Remove ban" })).toBeVisible();
    await page.getByRole("button", { name: "Remove ban" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Remove ban" }).click();
    await expect(page.getByRole("status")).toContainText("The ban was removed from Sam Teammate.");

    await page.getByLabel("Account status").selectOption("all");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.getByRole("button", { name: "Delete account" }).click();
    const deleteDialog = page.getByRole("alertdialog");
    await deleteDialog
      .getByLabel("Reason")
      .fill("Duplicate spam account confirmed by support review.");
    await deleteDialog.getByRole("button", { name: "Delete permanently" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Sam Teammate was deleted and anonymized."
    );

    expect(api.adminUserActions).toEqual([
      expect.objectContaining({ kind: "ban", userId: 42 }),
      expect.objectContaining({ kind: "unban", userId: 42 }),
      expect.objectContaining({ kind: "delete", userId: 42 }),
    ]);

    const seriousViolations = (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
    expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);
  });
});
