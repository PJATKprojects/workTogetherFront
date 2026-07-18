"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { SiteMessages } from "@/messages/types";

type Labels = SiteMessages["authCallback"];

/** Only same-app relative paths are safe post-login destinations. */
function sanitizeReturnUrl(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

/**
 * Landing spot after the API finishes an OAuth exchange. The refresh cookie is
 * already set — we mint an access token via the cookie-based refresh call, then
 * forward the user to their original destination.
 */
export function OAuthCallbackContent({
  labels,
  localePrefix,
}: Readonly<{ labels: Labels; localePrefix: string }>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [refreshFailed, setRefreshFailed] = useState(false);
  const startedRef = useRef(false);

  const errorParam = searchParams.get("error");

  // Provider/state errors arrive in the URL — pure derivation, no effect needed.
  const errorText = useMemo(() => {
    if (refreshFailed) return labels.genericFailed;
    if (!errorParam) return null;
    const known: Record<string, string> = {
      not_available: labels.notAvailable,
      access_denied: labels.accessDenied,
      email_linked: labels.emailLinked,
      link_required: labels.linkRequired,
      link_conflict: labels.linkConflict,
      reauth_required: labels.reauthRequired,
      invalid_state: labels.invalidState,
    };
    return known[errorParam] ?? labels.genericFailed;
  }, [errorParam, labels, refreshFailed]);

  useEffect(() => {
    if (startedRef.current || errorParam) return;
    startedRef.current = true;

    const destination =
      searchParams.get("onboarding") === "1"
        ? `${localePrefix}/profile/community-onboarding`
        : sanitizeReturnUrl(searchParams.get("returnUrl"), `${localePrefix}/`);
    void refreshSession().then((ok) => {
      if (ok) {
        router.replace(destination);
      } else {
        setRefreshFailed(true);
      }
    });
  }, [errorParam, localePrefix, refreshSession, router, searchParams]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[100dvh] items-center justify-center bg-background px-4 text-foreground"
    >
      <div className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
        {errorText === null ? (
          <>
            <span
              aria-hidden
              className="mx-auto block size-10 animate-spin rounded-full border-[3px] border-border border-t-primary"
            />
            <p className="mt-5 text-sm text-muted-foreground" role="status">
              {labels.verifying}
            </p>
          </>
        ) : (
          <>
            <span
              aria-hidden
              className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive-soft text-destructive-soft-foreground"
            >
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" d="M12 8v5m0 3.5v.5" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <h1 className="mt-4 text-xl font-semibold">{labels.errorTitle}</h1>
            <p
              role="alert"
              aria-live="assertive"
              className="mt-2 text-sm leading-6 text-muted-foreground"
            >
              {errorText}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href={`${localePrefix}/auth/login`}
                className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary-hover"
              >
                {labels.retry}
              </Link>
              <Link
                href={`${localePrefix}/`}
                className="focus-ring inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition duration-200 hover:border-input hover:bg-muted"
              >
                {labels.backHome}
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
