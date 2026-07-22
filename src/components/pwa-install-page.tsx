"use client";

import { useState, useSyncExternalStore } from "react";

import { isPwaInstallAvailable, requestPwaInstall, subscribeToPwaInstall } from "@/lib/pwa-install";

export type PwaInstallPageLabels = Readonly<{
  eyebrow: string;
  title: string;
  body: string;
  install: string;
  installing: string;
  installed: string;
  unavailableTitle: string;
  unavailableBody: string;
  iosHint: string;
  desktopHint: string;
}>;

const getServerSnapshot = () => false;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function subscribeToStandalone(listener: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  const legacyMedia = media as MediaQueryList & {
    addListener?: (callback: () => void) => void;
    removeListener?: (callback: () => void) => void;
  };
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
  } else {
    legacyMedia.addListener?.(listener);
  }
  window.addEventListener("appinstalled", listener);
  return () => {
    if (typeof media.removeEventListener === "function") {
      media.removeEventListener("change", listener);
    } else {
      legacyMedia.removeListener?.(listener);
    }
    window.removeEventListener("appinstalled", listener);
  };
}

export function PwaInstallPage({ labels }: Readonly<{ labels: PwaInstallPageLabels }>) {
  const installAvailable = useSyncExternalStore(
    subscribeToPwaInstall,
    isPwaInstallAvailable,
    getServerSnapshot
  );
  const installedExternally = useSyncExternalStore(
    subscribeToStandalone,
    isStandalone,
    getServerSnapshot
  );
  const [installAccepted, setInstallAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const installed = installedExternally || installAccepted;

  const install = async () => {
    setBusy(true);
    try {
      const outcome = await requestPwaInstall();
      if (outcome === "accepted") setInstallAccepted(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-surface/90 p-6 shadow-sm sm:p-10">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-text">
        <svg
          className="size-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary-text">
        {labels.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{labels.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{labels.body}</p>

      {installed ? (
        <p
          role="status"
          className="mt-7 rounded-2xl border border-success/30 bg-success/10 p-4 font-semibold text-success"
        >
          {labels.installed}
        </p>
      ) : installAvailable ? (
        <button
          type="button"
          onClick={() => void install()}
          disabled={busy}
          className="focus-ring mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold leading-snug text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? labels.installing : labels.install}
        </button>
      ) : (
        <div className="mt-7 rounded-2xl border border-border bg-surface-muted p-5">
          <h2 className="font-semibold">{labels.unavailableTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{labels.unavailableBody}</p>
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <p className="rounded-2xl border border-border p-4 text-sm leading-6 text-muted-foreground">
          {labels.desktopHint}
        </p>
        <p className="rounded-2xl border border-border p-4 text-sm leading-6 text-muted-foreground">
          {labels.iosHint}
        </p>
      </div>
    </div>
  );
}
