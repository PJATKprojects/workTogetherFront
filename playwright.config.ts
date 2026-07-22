import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  // WebKit's Windows port is memory-sensitive when video and six browser
  // processes start together. Two workers keep the cross-engine gate stable.
  workers: 2,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "line",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    colorScheme: "light",
    locale: "en-US",
    contextOptions: { reducedMotion: "no-preference" },
    // API smoke tests use page.route(). A registered PWA worker can otherwise
    // take control mid-test and bypass Playwright routing in Firefox/WebKit.
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      // Playwright WebKit is the repeatable CI proxy for Safari. A release
      // checklist still keeps one manual pass on current macOS Safari.
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    // Exercise the same optimized server mode deployed by Vercel. Running the
    // PWA worker against Turbopack HMR can create browser-specific reload loops
    // that do not exist with immutable production chunks.
    command: `npm run preview -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: baseURL,
      NEXT_PUBLIC_REALTIME_URL: baseURL,
      NEXT_PUBLIC_DISABLE_REALTIME: "true",
      CSP_UPGRADE_INSECURE_REQUESTS: "false",
    },
  },
});
