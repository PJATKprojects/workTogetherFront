import type { CheckoutSession, PlanOverview } from "@/types";

import api from "./api";

export const billingService = {
  getOverview: async () => (await api.get<PlanOverview>("/api/billing/overview")).data,
  createCheckout: async (input: {
    packageCode: string;
    clientRequestId: string;
    locale: "en" | "uk" | "pl";
    immediatePerformanceConsent: boolean;
  }) => (await api.post<CheckoutSession>("/api/billing/checkout", input)).data,
  syncNative: async (platform: "ios" | "android") =>
    (await api.post<PlanOverview>("/api/billing/native/sync", { platform })).data,
};
