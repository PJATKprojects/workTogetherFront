import { expect, test } from "@playwright/test";

import { gotoAfterAuthBootstrap, installApiMock } from "./fixtures";

const editableControlSelector = [
  "input:not([type])",
  'input[type="date"]',
  'input[type="datetime-local"]',
  'input[type="email"]',
  'input[type="month"]',
  'input[type="number"]',
  'input[type="password"]',
  'input[type="search"]',
  'input[type="tel"]',
  'input[type="text"]',
  'input[type="time"]',
  'input[type="url"]',
  'input[type="week"]',
  "select",
  "textarea",
].join(",");

test("mobile registration fields use focus-safe text sizing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installApiMock(page);
  await gotoAfterAuthBootstrap(page, "/en/auth/register");

  const fields = page.locator(editableControlSelector);
  await expect(page.getByLabel("Email")).toBeVisible();

  const fontSizes = await fields.evaluateAll((elements) =>
    elements
      .filter((element) => element instanceof HTMLElement && element.offsetParent !== null)
      .map((element) => Number.parseFloat(getComputedStyle(element).fontSize))
  );

  expect(fontSizes.length).toBeGreaterThan(0);
  expect(Math.min(...fontSizes)).toBeGreaterThanOrEqual(16);
});
