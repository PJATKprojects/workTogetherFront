import { expect, test } from "@playwright/test";

import { installApiMock } from "./fixtures";

test.describe("localized PWA shell", () => {
  test("remembers a dismissed install banner and keeps manual install in the footer", async ({
    page,
  }) => {
    await installApiMock(page);
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.removeItem("wt:pwa-install-banner-dismissed");
    });
    await expect(page.locator("html")).toHaveAttribute("data-auth-ready", "true");

    const dispatchInstallPrompt = (outcome: "accepted" | "dismissed") =>
      page.evaluate((selectedOutcome) => {
        const event = new Event("beforeinstallprompt", { cancelable: true });
        Object.defineProperties(event, {
          prompt: { value: async () => undefined },
          userChoice: { value: Promise.resolve({ outcome: selectedOutcome }) },
        });
        window.dispatchEvent(event);
      }, outcome);

    await dispatchInstallPrompt("dismissed");
    await expect(
      page.getByText("Add the WorkTogether website to your device for quicker access.")
    ).toBeVisible();
    await page.getByRole("button", { name: "Dismiss install prompt" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem("wt:pwa-install-banner-dismissed"))
      )
      .toBe("1");

    await page.reload({ waitUntil: "domcontentloaded" });
    await dispatchInstallPrompt("dismissed");
    await expect(
      page.getByText("Add the WorkTogether website to your device for quicker access.")
    ).toHaveCount(0);

    const installLink = page.getByRole("link", { name: "Add to device" }).last();
    await expect(installLink).toHaveAttribute("href", "/en/install");
    await installLink.click();
    await expect(
      page.getByRole("heading", { name: "Add WorkTogether to your device" })
    ).toBeVisible();

    await dispatchInstallPrompt("accepted");
    await page.getByRole("button", { name: "Add WorkTogether" }).click();
    await expect(page.getByText("WorkTogether is already added to this device.")).toBeVisible();
  });

  test.describe("service worker", () => {
    test.use({ serviceWorkers: "allow" });

    test("manifest uses the stored locale and the Polish offline shell is available", async ({
      page,
    }) => {
      await installApiMock(page);

      const manifestResponse = await page.request.get("/manifest.webmanifest");
      expect(manifestResponse.ok()).toBeTruthy();
      const manifest = (await manifestResponse.json()) as {
        start_url: string;
        icons: Array<{ src: string; sizes: string; purpose: string }>;
        shortcuts: Array<{ url: string }>;
      };
      expect(manifest.start_url).toBe("/");
      expect(manifest.shortcuts.map((shortcut) => shortcut.url)).toEqual([
        "/projects",
        "/messages",
      ]);
      expect(manifest.icons).toEqual([
        expect.objectContaining({ src: "/icon-192.png", sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ src: "/icon-512.png", sizes: "512x512", purpose: "any" }),
        expect.objectContaining({
          src: "/maskable-icon-512.png",
          sizes: "512x512",
          purpose: "maskable",
        }),
      ]);
      for (const icon of manifest.icons) {
        const iconResponse = await page.request.get(icon.src);
        expect(iconResponse.ok()).toBeTruthy();
        expect(iconResponse.headers()["content-type"]).toBe("image/png");
      }

      const workerResponse = await page.request.get("/sw.js");
      expect(workerResponse.ok()).toBeTruthy();
      const worker = await workerResponse.text();
      expect(worker).toContain('"/en/offline"');
      expect(worker).toContain('"/uk/offline"');
      expect(worker).toContain('"/pl/offline"');
      expect(worker).toContain('addEventListener("push"');
      expect(worker).toContain('icon: "/icon-192.png"');
      expect(worker).toContain('headers.set("Content-Language", locale)');

      await page.goto("/pl/offline", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", "pl");
      await expect(page.getByRole("heading", { name: "Brak połączenia" })).toBeVisible();
    });

    test("the registered worker serves the Polish fallback in every browser engine", async ({
      page,
    }) => {
      await page.goto("/pl/offline", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Brak połączenia" })).toBeVisible();

      const workerState = await page.evaluate(async () => {
        if (!("serviceWorker" in navigator)) return "unsupported";
        const registration = await navigator.serviceWorker.ready;
        const worker = registration.active ?? registration.waiting ?? registration.installing;
        if (!worker) return "missing";
        if (worker.state !== "activated") {
          await new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(
              () => reject(new Error("The service worker did not activate.")),
              10_000
            );
            worker.addEventListener(
              "statechange",
              () => {
                if (worker.state !== "activated") return;
                window.clearTimeout(timeout);
                resolve();
              },
              { once: false }
            );
          });
        }
        if (!navigator.serviceWorker.controller) {
          await new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(
              () => reject(new Error("The service worker did not claim the page.")),
              10_000
            );
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => {
                window.clearTimeout(timeout);
                resolve();
              },
              { once: true }
            );
          });
        }
        return worker.state;
      });
      expect(workerState).toBe("activated");
      const cachedPolishShell = await page.evaluate(async () => {
        const response = await caches.match("/pl/offline");
        return response ? response.text() : "";
      });
      expect(cachedPolishShell).toContain("Brak połączenia");

      await page.goto("/pl/projects/offline-probe?offline-preview=1", {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator("html")).toHaveAttribute("lang", "pl");
      await expect(page.getByRole("heading", { name: "Brak połączenia" })).toBeVisible();
    });
  });
});
