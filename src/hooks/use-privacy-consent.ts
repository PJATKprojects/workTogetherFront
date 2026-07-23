"use client";

import { useSyncExternalStore } from "react";

import {
  getPrivacyConsentSnapshot,
  parsePrivacyConsentSnapshot,
  subscribePrivacyConsent,
} from "@/lib/privacy-consent";

export function usePrivacyConsent() {
  const snapshot = useSyncExternalStore(
    subscribePrivacyConsent,
    getPrivacyConsentSnapshot,
    () => undefined
  );
  return parsePrivacyConsentSnapshot(snapshot);
}
