import { expect, test } from "@playwright/test";

import { gotoAfterAuthBootstrap, installApiMock } from "./fixtures";

test.describe("profile", () => {
  test("hides First steps after onboarding progress is complete", async ({ page }) => {
    await installApiMock(page, {
      authenticated: true,
      onboardingProgress: {
        profileProgressPercent: 100,
        steps: [
          {
            code: "intent",
            completed: true,
            current: 1,
            target: 1,
            improvement: "",
          },
        ],
        achievements: [],
        newlyUnlocked: [],
      },
    });

    await gotoAfterAuthBootstrap(page, "/en/profile");

    await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "First steps" })).toHaveCount(0);
  });
});
