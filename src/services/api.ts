import axios, { type InternalAxiosRequestConfig } from "axios";

import { tokenStore } from "@/lib/auth/token-store";
import type { PrivateUser } from "@/types";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

type RequestWithMetadata = InternalAxiosRequestConfig & {
  _retry?: boolean;
  metadata?: { cacheKey: string; cacheable: boolean; correlationId: string };
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
  headers: { "Content-Type": "application/json" },
});

const etagStore = new Map<string, string>();
const responseCache = new Map<string, unknown>();

export type AuthSession = {
  token: string;
  user: PrivateUser;
  requiresCommunityOnboarding: boolean;
  requiresProductOnboarding: boolean;
};

let sessionRefreshPromise: Promise<AuthSession> | null = null;
let authSessionEpoch = 0;

export function clearApiResponseCache() {
  etagStore.clear();
  responseCache.clear();
}

/**
 * Invalidates any refresh request that started for the previous account.
 * Its HTTP response may still arrive, but it is no longer allowed to restore
 * the old access token after logout/account switching.
 */
export function invalidateAuthSessionState() {
  authSessionEpoch += 1;
  clearApiResponseCache();
}

/**
 * Single-flight cookie-based session refresh. Refresh tokens are single-use
 * (rotated server-side), so concurrent callers MUST share one request —
 * e.g. AuthProvider's mount restore + the OAuth callback page, or several
 * 401-retries firing at once. A second parallel request would present the
 * already-rotated token and get 401.
 */
export function refreshAuthSession(): Promise<AuthSession> {
  if (sessionRefreshPromise) return sessionRefreshPromise;

  const epoch = authSessionEpoch;
  const refreshPromise = api
    .post<AuthSession>("/api/auth/refresh", undefined, { skipAuthRefresh: true })
    .then((response) => {
      if (epoch !== authSessionEpoch) {
        throw new axios.CanceledError("Session changed while refresh was in progress.");
      }
      tokenStore.set(response.data.token);
      return response.data;
    })
    .finally(() => {
      if (sessionRefreshPromise === refreshPromise) {
        sessionRefreshPromise = null;
      }
    });
  sessionRefreshPromise = refreshPromise;
  return refreshPromise;
}

function getRequestCacheKey(url?: string, params?: unknown) {
  return `${url ?? ""}|${JSON.stringify(params ?? {})}`;
}

function newCorrelationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

api.interceptors.request.use((config) => {
  const request = config as RequestWithMetadata;
  const token = tokenStore.get();
  // Authenticated responses are user-specific and must never be reused for
  // another account. React Query owns their in-memory caching instead.
  const cacheable = !token && config.method?.toLowerCase() === "get";
  const cacheKey = getRequestCacheKey(config.url, config.params);
  const correlationId = request.metadata?.correlationId ?? newCorrelationId();
  request.metadata = { cacheKey, cacheable, correlationId };
  config.headers["X-Correlation-ID"] = correlationId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (cacheable) {
    const etag = etagStore.get(cacheKey);
    if (etag) config.headers["If-None-Match"] = etag;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const metadata = (response.config as RequestWithMetadata).metadata;
    if (!metadata?.cacheable) return response;
    const cacheKey = metadata.cacheKey;

    if (response.status === 304 && responseCache.has(cacheKey)) {
      response.data = responseCache.get(cacheKey);
    } else if (response.config.method?.toLowerCase() === "get") {
      const etag = response.headers.etag as string | undefined;
      if (etag) {
        etagStore.set(cacheKey, etag);
        responseCache.set(cacheKey, response.data);
      }
    }

    return response;
  },
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config) return Promise.reject(error);

    const request = error.config as RequestWithMetadata;
    if (error.response?.status === 428 && typeof window !== "undefined") {
      const body = error.response.data as { errors?: { mfa?: string[] } } | undefined;
      window.dispatchEvent(
        new CustomEvent("wt:mfa-required", {
          detail: {
            mode: body?.errors?.mfa?.[0] ?? "verification_required",
          },
        })
      );
    }
    const isRefresh = request.url?.includes("/api/auth/refresh");
    const isPublicAuth = /\/api\/auth\/(login|register|confirm-email)/.test(request.url ?? "");

    if (
      error.response?.status !== 401 ||
      request._retry ||
      request.skipAuthRefresh ||
      isRefresh ||
      isPublicAuth
    ) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      await refreshAuthSession();
      return api(request);
    } catch (refreshError) {
      // Logout/account switching intentionally invalidates refreshes that
      // belong to the previous session. Never let that stale request clear a
      // token that may already belong to the newly logged-in account.
      if (!axios.isCancel(refreshError)) {
        tokenStore.clear();
      }
      return Promise.reject(refreshError);
    }
  }
);

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn("API URL is not defined. Check NEXT_PUBLIC_API_URL.");
}

export default api;
