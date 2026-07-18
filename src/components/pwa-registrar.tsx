"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/locales";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegistrar({ locale }: Readonly<{ locale: Locale }>) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const text = {
    en: {
      body: "Install WorkTogether for faster access and a safe offline shell.",
      install: "Install",
      dismiss: "Dismiss install prompt",
    },
    uk: {
      body: "Встановіть WorkTogether для швидкого доступу та безпечного offline-екрана.",
      install: "Встановити",
      dismiss: "Закрити пропозицію встановлення",
    },
    pl: {
      body: "Zainstaluj WorkTogether, aby uzyskać szybszy dostęp i bezpieczną stronę offline.",
      install: "Zainstaluj",
      dismiss: "Zamknij propozycję instalacji",
    },
  }[locale];

  useEffect(() => {
    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-xl backdrop-blur">
      <p className="text-xs leading-5 text-muted-foreground">{text.body}</p>
      <button
        type="button"
        onClick={() => {
          void prompt.prompt().then(async () => {
            await prompt.userChoice;
            setPrompt(null);
          });
        }}
        className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
      >
        {text.install}
      </button>
      <button
        type="button"
        aria-label={text.dismiss}
        onClick={() => setPrompt(null)}
        className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted"
      >
        ×
      </button>
    </div>
  );
}
