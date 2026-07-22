import { expect, test } from "@playwright/test";

import { gotoAfterAuthBootstrap, installApiMock } from "./fixtures";

test.describe("progressive onboarding contract", () => {
  test("requires one choice, saves optional details, and shows three matches", async ({ page }) => {
    test.setTimeout(60_000);
    const api = await installApiMock(page, { authenticated: true });
    await gotoAfterAuthBootstrap(page, "/en/onboarding");

    await page.getByText("Join a project", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Primary role").selectOption("3");
    await page.getByLabel("Skills").fill("React");
    await page.getByRole("button", { name: "+ React" }).click();
    await page.getByLabel("React: Level").selectOption("intermediate");

    await page.locator("summary").filter({ hasText: "Availability" }).click();
    await page.getByLabel("Timezone").fill("Europe/Warsaw");
    await page.getByLabel("Hours per week").fill("8");
    await page.getByLabel("Start date").fill("2026-08-01");
    await page.getByText("Hybrid", { exact: true }).click();
    await page.getByText("English", { exact: true }).click();

    await page.locator("summary").filter({ hasText: "Your goal" }).click();
    await page.getByLabel("Goal").fill("Build a useful accessible product with a reliable team.");

    const githubSection = page.getByText("Import GitHub evidence (optional)");
    await githubSection.click();
    await page.getByPlaceholder("github-username").fill("alex");
    const previewGithub = page.getByRole("button", { name: "Preview extracted data" }).first();
    await expect(previewGithub).toBeDisabled();
    await page
      .getByLabel("I consent to fetching this public GitHub profile for a preview.")
      .check();
    await previewGithub.click();
    await expect(page.getByText("@alex")).toBeVisible();
    await expect(page.getByText("42 contributions in the last year")).toBeVisible();
    await page.getByLabel("Include this reviewed preview in my profile").check();

    await page.getByText("Preview LinkedIn/CV text (optional)").click();
    await page.getByPlaceholder("Paste LinkedIn or CV text").fill("Frontend developer. English.");
    const previewDocument = page.getByRole("button", { name: "Preview extracted data" }).last();
    await expect(previewDocument).toBeDisabled();
    await page.getByLabel("I consent to parsing this text for a local preview.").check();
    await previewDocument.scrollIntoViewIfNeeded();
    await expect(previewDocument).toBeEnabled();
    await previewDocument.click();
    await expect(page.getByText("Extracted fields", { exact: true })).toBeVisible();
    expect(api.completedOnboarding).toEqual([]);

    await page.getByRole("button", { name: "Save and continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Three relevant starting points" })
    ).toBeVisible();
    await expect(page.locator("a[href^='/en/projects/']")).toHaveCount(3);

    expect(api.githubImportRequests).toEqual([{ username: "alex", consent: true }]);
    expect(api.documentImportRequests).toEqual([
      { source: "cv", text: "Frontend developer. English.", consent: true },
    ]);
    expect(api.completedOnboarding).toHaveLength(1);
    expect(api.completedOnboarding[0]).toMatchObject({
      intent: "join",
      primaryRoleId: 3,
      skills: [{ technologyId: 5, level: "intermediate" }],
      timeZone: "Europe/Warsaw",
      languages: ["en"],
      hoursPerWeek: 8,
      format: "hybrid",
      goal: "Build a useful accessible product with a reliable team.",
      startDate: "2026-08-01",
      reviewedGithubImport: {
        username: "alex",
        contributionCount: 42,
      },
    });
    expect(api.completedOnboarding[0]).not.toHaveProperty("riskPreference");
    expect(api.completedOnboarding[0]).not.toHaveProperty("workPace");
    expect(api.completedOnboarding[0]).not.toHaveProperty("communicationStyle");
  });

  test("can defer every profile detail without being trapped in setup", async ({ page }) => {
    const api = await installApiMock(page, { authenticated: true });
    await gotoAfterAuthBootstrap(page, "/en/onboarding");

    await page.getByRole("button", { name: "Fill in later" }).click();

    await expect(page).toHaveURL(/\/en\/profile$/);
    expect(api.completedOnboarding).toHaveLength(1);
    expect(api.completedOnboarding[0]).toMatchObject({
      intent: "both",
      skills: [],
      languages: [],
      goal: "",
    });
    expect(api.completedOnboarding[0]).not.toHaveProperty("primaryRoleId");
    expect(api.completedOnboarding[0]).not.toHaveProperty("hoursPerWeek");
    expect(api.completedOnboarding[0]).not.toHaveProperty("format");
    expect(api.completedOnboarding[0]).not.toHaveProperty("startDate");
  });
});
