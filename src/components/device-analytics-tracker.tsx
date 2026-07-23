"use client";

import { useEffect } from "react";

import {
  analyticsConsentVersion,
  analyticsVisitSessionName,
  privacyConsentChangedEvent,
  readPrivacyConsent,
} from "@/lib/privacy-consent";

export function DeviceAnalyticsTracker() {
  useEffect(() => {
    const recordVisit = () => {
      if (!readPrivacyConsent()?.analytics) return;
      try {
        if (window.sessionStorage.getItem(analyticsVisitSessionName) === "1") return;
        window.sessionStorage.setItem(analyticsVisitSessionName, "1");
      } catch {
        // Some privacy modes disable sessionStorage; the layout still records at most once per mount.
      }

      void fetch("/api/analytics/device-visits", {
        method: "POST",
        credentials: "include",
        keepalive: true,
        headers: {
          "X-WorkTogether-Analytics-Consent": analyticsConsentVersion,
        },
      }).catch(() => {
        // Analytics must never interrupt or degrade the requested product flow.
      });
    };

    recordVisit();
    window.addEventListener(privacyConsentChangedEvent, recordVisit);
    return () => window.removeEventListener(privacyConsentChangedEvent, recordVisit);
  }, []);

  return null;
}
