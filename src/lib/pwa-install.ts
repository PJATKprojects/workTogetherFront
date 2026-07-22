export type PwaInstallOutcome = "accepted" | "dismissed" | "unavailable";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __workTogetherInstallPrompt?: InstallPromptEvent | null;
  }
}

const stateEvent = "wt:pwa-install-state";

function notify() {
  window.dispatchEvent(new Event(stateEvent));
}

export function capturePwaInstallPrompt(event: Event) {
  window.__workTogetherInstallPrompt = event as InstallPromptEvent;
  notify();
}

export function clearPwaInstallPrompt() {
  window.__workTogetherInstallPrompt = null;
  notify();
}

export function isPwaInstallAvailable() {
  return typeof window !== "undefined" && Boolean(window.__workTogetherInstallPrompt);
}

export function subscribeToPwaInstall(listener: () => void) {
  window.addEventListener(stateEvent, listener);
  window.addEventListener("appinstalled", listener);
  return () => {
    window.removeEventListener(stateEvent, listener);
    window.removeEventListener("appinstalled", listener);
  };
}

export async function requestPwaInstall(): Promise<PwaInstallOutcome> {
  const prompt = window.__workTogetherInstallPrompt;
  if (!prompt) return "unavailable";

  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    return choice.outcome;
  } catch {
    // Browsers may invalidate a captured prompt after a navigation or a
    // previous attempt. Fall back to the manual instructions without leaving
    // an unhandled promise rejection in the UI.
    return "unavailable";
  } finally {
    if (window.__workTogetherInstallPrompt === prompt) {
      clearPwaInstallPrompt();
    }
  }
}
