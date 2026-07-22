export interface BillingPackage {
  code: "pro_1_month" | "pro_3_months" | "pro_6_months" | "pro_12_months";
  durationMonths: 1 | 3 | 6 | 12;
  priceMinor: number;
  currency: "PLN";
  equivalentMonthlyPriceMinor: number;
  savingsMinor: number;
}

export interface PlanOverview {
  plan: "free" | "pro" | "admin";
  isPro: boolean;
  proUntil: string | null;
  activeProjects: number;
  activeProjectsLimit: number | null;
  applicationsUsedThisWeek: number;
  applicationsPerWeekLimit: number | null;
  applicationsRemainingThisWeek: number | null;
  applicationsResetAt: string;
  webCheckoutAvailable: boolean;
  nativePurchasesAvailable: boolean;
  nativeAppUserId: string;
  packages: BillingPackage[];
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  expiresAt: string;
}
