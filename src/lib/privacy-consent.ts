export const analyticsConsentVersion = "2026-07-23-device-v1";
export const privacyConsentStorageName = "wt_privacy_choice_v1";
export const analyticsVisitSessionName = "wt_device_visit_sent_v1";
export const privacyConsentChangedEvent = "wt:privacy-consent-changed";

export type PrivacyConsent = Readonly<{
  version: typeof analyticsConsentVersion;
  analytics: boolean;
  decidedAt: string;
}>;

let volatileConsentSnapshot: string | null = null;

export function readPrivacyConsent(): PrivacyConsent | null {
  const value = parsePrivacyConsentSnapshot(getPrivacyConsentSnapshot());
  return value === undefined ? null : value;
}

export function parsePrivacyConsentSnapshot(
  snapshot: string | null | undefined
): PrivacyConsent | null | undefined {
  if (snapshot === undefined) return undefined;
  try {
    const value = JSON.parse(snapshot ?? "null") as Partial<PrivacyConsent> | null;
    if (
      !value ||
      value.version !== analyticsConsentVersion ||
      typeof value.analytics !== "boolean" ||
      typeof value.decidedAt !== "string"
    ) {
      return null;
    }
    return value as PrivacyConsent;
  } catch {
    return null;
  }
}

export function getPrivacyConsentSnapshot(): string | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(privacyConsentStorageName) ?? volatileConsentSnapshot;
  } catch {
    return volatileConsentSnapshot;
  }
}

export function subscribePrivacyConsent(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === privacyConsentStorageName) onChange();
  };
  window.addEventListener(privacyConsentChangedEvent, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(privacyConsentChangedEvent, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function savePrivacyConsent(analytics: boolean): PrivacyConsent {
  const choice: PrivacyConsent = {
    version: analyticsConsentVersion,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  volatileConsentSnapshot = JSON.stringify(choice);
  try {
    window.localStorage.setItem(privacyConsentStorageName, volatileConsentSnapshot);
  } catch {
    // The in-memory snapshot still keeps the choice for the current page.
  }
  window.dispatchEvent(new CustomEvent(privacyConsentChangedEvent, { detail: choice }));
  return choice;
}
