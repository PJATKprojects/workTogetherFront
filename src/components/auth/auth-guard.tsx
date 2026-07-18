"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

const subscribeToHydration = () => () => {};

export function AuthGuard({
  children,
  locale,
  loadingLabel,
}: Readonly<{ children: React.ReactNode; locale: Locale; loadingLabel: string }>) {
  const { isAuthenticated, isLoading, requiresCommunityOnboarding, requiresProductOnboarding } =
    useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  // A fast refresh-cookie response can update the outer provider while this
  // Suspense boundary still contains server HTML. Keep the first client
  // snapshot identical to SSR, then reveal authenticated content only after
  // this boundary itself has hydrated.
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const query = searchParams.toString();
      const returnUrl = `${pathname}${query ? `?${query}` : ""}`;
      router.replace(
        `${withLocale(locale, "/auth/login")}?returnUrl=${encodeURIComponent(returnUrl)}`
      );
    } else if (
      !isLoading &&
      isAuthenticated &&
      requiresCommunityOnboarding &&
      !pathname.endsWith("/profile/community-onboarding")
    ) {
      router.replace(withLocale(locale, "/profile/community-onboarding"));
    } else if (
      !isLoading &&
      isAuthenticated &&
      !requiresCommunityOnboarding &&
      requiresProductOnboarding &&
      !pathname.endsWith("/onboarding")
    ) {
      router.replace(withLocale(locale, "/onboarding"));
    }
  }, [
    isAuthenticated,
    isLoading,
    locale,
    pathname,
    requiresCommunityOnboarding,
    requiresProductOnboarding,
    router,
    searchParams,
  ]);

  if (
    !isHydrated ||
    isLoading ||
    !isAuthenticated ||
    (requiresCommunityOnboarding && !pathname.endsWith("/profile/community-onboarding")) ||
    (!requiresCommunityOnboarding && requiresProductOnboarding && !pathname.endsWith("/onboarding"))
  ) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 text-sm text-muted-foreground">
        {loadingLabel}
      </div>
    );
  }

  return children;
}
