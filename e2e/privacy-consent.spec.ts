import { expect, test } from "@playwright/test";

import { gotoAfterAuthBootstrap, installApiMock } from "./fixtures";

test("optional device analytics remains off until opt-in and can be changed later", async ({
  page,
}) => {
  const api = await installApiMock(page, { privacyChoice: "unset" });
  await gotoAfterAuthBootstrap(page, "/en");

  await expect(page.getByText("Your privacy choices")).toBeVisible();
  await expect(page.getByRole("button", { name: "Necessary only" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Allow anonymous analytics" })).toBeVisible();
  expect(api.analyticsVisits).toBe(0);

  await page.getByRole("button", { name: "Necessary only" }).click();
  await expect(page.getByText("Your privacy choices")).toHaveCount(0);
  expect(api.analyticsVisits).toBe(0);

  await gotoAfterAuthBootstrap(page, "/en/cookies");
  await expect(page.getByRole("heading", { name: "Optional analytics preference" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("necessary storage only");

  await page.getByRole("button", { name: "Allow anonymous analytics" }).click();
  await expect(page.getByRole("status")).toContainText("anonymous analytics allowed");
  await expect.poll(() => api.analyticsVisits).toBe(1);

  await page.reload();
  await expect(page.getByText("Your privacy choices")).toHaveCount(0);
  await expect.poll(() => api.analyticsVisits).toBe(1);
});
