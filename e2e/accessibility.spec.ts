import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { gotoAfterAuthBootstrap, installApiMock } from "./fixtures";

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const violations = results.violations.filter((item) =>
    ["serious", "critical"].includes(item.impact ?? "")
  );
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

async function expectNoHorizontalPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(
    Math.max(dimensions.document, dimensions.body),
    JSON.stringify(dimensions)
  ).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test.describe("accessibility gate", () => {
  test("home has a keyboard skip path and no serious WCAG A/AA violations", async ({ page }) => {
    await installApiMock(page);
    await gotoAfterAuthBootstrap(page, "/en/");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expectNoSeriousAxeViolations(page);

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoSeriousAxeViolations(page);
  });

  test("login keyboard order follows the visible task flow", async ({ page }) => {
    await installApiMock(page);
    await gotoAfterAuthBootstrap(page, "/en/auth/login");

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Email")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Show password" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Forgot password?" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeFocused();
  });

  test("field errors are programmatically tied to their controls", async ({ page }) => {
    await installApiMock(page, { authenticated: true });
    await gotoAfterAuthBootstrap(page, "/en/auth/register");

    const nickname = page.getByLabel("Nickname");
    await nickname.focus();
    await nickname.blur();
    await expect(nickname).toHaveAttribute("aria-invalid", "true");
    await expect(nickname).toHaveAttribute("aria-describedby", "register-nickname-error");
    await expect(page.locator("#register-nickname-error")).toContainText(
      "Nickname must be at least 2 characters"
    );

    await gotoAfterAuthBootstrap(page, "/en/auth/forgot-password");
    const email = page.getByLabel("Email");
    await email.fill("not-an-email");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAttribute("aria-describedby", "forgot-password-email-error");

    await gotoAfterAuthBootstrap(page, "/en/auth/reset-password?token=e2e-reset-token");
    await page.getByLabel("New password", { exact: true }).fill("Password123!");
    const confirmation = page.getByLabel("Confirm new password");
    await confirmation.fill("Different123!");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(confirmation).toHaveAttribute("aria-invalid", "true");
    await expect(confirmation).toHaveAttribute("aria-describedby", "reset-password-confirm-error");

    await gotoAfterAuthBootstrap(page, "/en/profile/edit");
    const github = page.locator("#profile-githubProfile");
    await github.fill("not-a-url");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator("#profile-error-summary")).toBeFocused();
    await expect(github).toHaveAttribute("aria-invalid", "true");
    await expect(github).toHaveAttribute("aria-describedby", "profile-githubProfile-error");
  });

  test("long Ukrainian and Polish copy reflows at 320 CSS px and at 200% text size", async ({
    page,
  }, testInfo) => {
    await installApiMock(page);
    for (const locale of ["uk", "pl"]) {
      await page.setViewportSize({ width: 320, height: 900 });
      await gotoAfterAuthBootstrap(page, `/${locale}/auth/login`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalPageOverflow(page);
      const createAccount = page.locator(`a[href="/${locale}/auth/register"]`);
      await createAccount.evaluate((element) =>
        element.scrollIntoView({ block: "center", behavior: "auto" })
      );
      await expect(createAccount).toBeInViewport();
      if (process.env.PLAYWRIGHT_VISUAL_EVIDENCE === "1") {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: testInfo.outputPath(`${locale}-login-320.png`),
          fullPage: true,
        });
      }

      await page.setViewportSize({ width: 1280, height: 900 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expectNoHorizontalPageOverflow(page);
      await expectNoSeriousAxeViolations(page);
      await createAccount.evaluate((element) =>
        element.scrollIntoView({ block: "center", behavior: "auto" })
      );
      await expect(createAccount).toBeInViewport();
      if (process.env.PLAYWRIGHT_VISUAL_EVIDENCE === "1") {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: testInfo.outputPath(`${locale}-login-200-percent.png`),
          fullPage: true,
        });
      }
    }
  });

  test("400% reflow equivalent keeps the primary public flow usable", async ({ page }) => {
    await installApiMock(page);
    // WCAG 1.4.10 tests a 1280 CSS px desktop layout at 400% as a 320 CSS px
    // reflow viewport. Browser chrome zoom is also covered by the manual gate.
    await page.setViewportSize({ width: 320, height: 900 });
    await gotoAfterAuthBootstrap(page, "/en/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse projects" }).first()).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
  });

  test("Polish policy hub and DSA notice form reflow and expose linked errors", async ({
    page,
  }) => {
    await installApiMock(page);
    await page.setViewportSize({ width: 320, height: 900 });
    await gotoAfterAuthBootstrap(page, "/pl/policies");

    await expect(
      page.getByRole("heading", { name: "Polityki, prawa i bezpieczeństwo" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Bezpieczeństwo i nielegalne treści/ })
    ).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
    await expectNoSeriousAxeViolations(page);

    await gotoAfterAuthBootstrap(page, "/en/safety");
    await page.getByRole("button", { name: "Send notice" }).click();
    const errorSummary = page.getByRole("alert").filter({
      hasText: "Correct the highlighted fields:",
    });
    await expect(errorSummary).toBeFocused();
    await expect(page.locator("#notice-contentUrl")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#notice-contentUrl")).toHaveAttribute(
      "aria-describedby",
      "notice-contentUrl-hint notice-contentUrl-error"
    );

    await page.getByLabel("Category").selectOption("child_safety");
    const localContentUrl = await page.evaluate(() => `${window.location.origin}/en/projects/7`);
    await page.getByLabel("Exact WorkTogether content URL").fill(localContentUrl);
    await page
      .getByLabel("Why you believe the content is illegal")
      .fill("The page may facilitate sexual abuse of a child and needs urgent review.");
    await page.getByLabel(/I confirm that this notice is accurate/).check();
    await page.getByRole("button", { name: "Send notice" }).click();
    await expect(page.getByRole("heading", { name: "Notice received" })).toBeVisible();
    await expect(page.getByText("WT-DSA-E2E000000000000000000000000002")).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
  });

  test("reduced-motion preference suppresses ambient and ping animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await installApiMock(page);
    await gotoAfterAuthBootstrap(page, "/en/");

    const durations = await page.locator(".animate-ping").evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          animationDuration: style.animationDuration,
          iterationCount: style.animationIterationCount,
        };
      })
    );
    expect(durations.length).toBeGreaterThan(0);
    for (const duration of durations) {
      expect(parseFloat(duration.animationDuration)).toBeLessThanOrEqual(0.001);
      expect(duration.iterationCount).toBe("1");
    }

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
  });
});
