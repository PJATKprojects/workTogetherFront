"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/locales";
import {
  capturePwaInstallPrompt,
  clearPwaInstallPrompt,
  requestPwaInstall,
} from "@/lib/pwa-install";

const installBannerDismissedKey = "wt:pwa-install-banner-dismissed";

export function PwaRegistrar({ locale }: Readonly<{ locale: Locale }>) {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const text = {
    en: {
      body: "Add the WorkTogether website to your device for quicker access.",
      install: "Add",
      dismiss: "Dismiss install prompt",
    },
    uk: {
      body: "Додайте сайт WorkTogether на пристрій для швидшого доступу.",
      install: "Додати",
      dismiss: "Закрити пропозицію встановлення",
    },
    pl: {
      body: "Dodaj stronę WorkTogether do urządzenia, aby szybciej ją otwierać.",
      install: "Dodaj",
      dismiss: "Zamknij propozycję instalacji",
    },
  }[locale];

  useEffect(() => {
    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      capturePwaInstallPrompt(event);
      try {
        setShowBanner(window.localStorage.getItem(installBannerDismissedKey) !== "1");
      } catch {
        setShowBanner(true);
      }
    };
    const onInstalled = () => {
      clearPwaInstallPrompt();
      setShowBanner(false);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === installBannerDismissedKey && event.newValue === "1") {
        setShowBanner(false);
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!showBanner || pathname.replace(/\/+$/u, "").endsWith("/install")) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-xl backdrop-blur">
      <p className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground">{text.body}</p>
      <button
        type="button"
        onClick={() => {
          void requestPwaInstall().finally(() => setShowBanner(false));
        }}
        className="focus-ring inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold leading-snug text-primary-foreground transition hover:bg-primary-hover"
      >
        {text.install}
      </button>
      <button
        type="button"
        aria-label={text.dismiss}
        onClick={() => {
          try {
            window.localStorage.setItem(installBannerDismissedKey, "1");
          } catch {
            // Storage may be unavailable in private/locked-down contexts.
          }
          setShowBanner(false);
        }}
        className="focus-ring flex size-10 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        ×
      </button>
    </div>
  );
}
