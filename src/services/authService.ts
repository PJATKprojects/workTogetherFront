import { getApiError } from "@/lib/api-error";
import { tokenStore } from "@/lib/auth/token-store";
import type { PrivateUser } from "@/types";
import type { Locale } from "@/i18n/locales";

import api, { refreshAuthSession } from "./api";

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  locale: Locale;
  acceptCommunityGuidelines: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: PrivateUser;
  requiresCommunityOnboarding: boolean;
  requiresProductOnboarding: boolean;
}

export interface RegisterResponseDto {
  message: string;
  user: unknown;
}

export interface AuthSessionDto {
  id: string;
  deviceName: string;
  region: string;
  ipAddress: string;
  authMethod: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface LoginMethodDto {
  type: "password" | "oauth";
  provider?: "google" | "github";
  email?: string;
  connectedAt?: string;
  lastUsedAt?: string;
  canDisconnect: boolean;
}

export interface LoginMethodsDto {
  hasPassword: boolean;
  methods: LoginMethodDto[];
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const response = await api.post<RegisterResponseDto>("/api/auth/register", payload);
    return response.data;
  },

  login: async (payload: LoginPayload) => {
    const response = await api.post<AuthResponseDto>("/api/auth/login", payload);
    tokenStore.set(response.data.token);
    return response.data;
  },

  forgotPassword: async (email: string, locale: Locale) => {
    const response = await api.post<{ message: string }>(
      "/api/auth/forgot-password",
      { email, locale },
      { skipAuthRefresh: true }
    );
    return response.data;
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    const response = await api.post<{ message: string }>(
      "/api/auth/reset-password",
      { token, password, confirmPassword },
      { skipAuthRefresh: true }
    );
    return response.data;
  },

  resendConfirmation: async (email: string, locale: Locale) => {
    const response = await api.post<{ message: string }>(
      "/api/auth/resend-confirmation",
      { email, locale },
      { skipAuthRefresh: true }
    );
    return response.data;
  },

  // Single-flight (shared with the 401-retry interceptor): refresh tokens are
  // single-use, so parallel callers must ride the same request.
  refresh: (): Promise<AuthResponseDto> => refreshAuthSession(),

  logout: async () => {
    try {
      await api.post("/api/auth/logout", undefined, { skipAuthRefresh: true });
    } finally {
      tokenStore.clear();
    }
  },

  /**
   * Full-page redirect target that starts the server-side OAuth flow. The API
   * redirects to the provider and, after the callback, sends the browser to
   * /{locale}/auth/callback where the session is picked up via the refresh cookie.
   */
  oauthStartUrl: (provider: "google" | "github", returnUrl: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    return `${base}/api/auth/oauth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`;
  },

  oauthLinkStartUrl: async (provider: "google" | "github", returnUrl: string) => {
    const response = await api.post<{ authorizationUrl: string }>(
      `/api/auth/oauth/${provider}/link`,
      undefined,
      { params: { returnUrl } }
    );
    return response.data.authorizationUrl;
  },

  sessions: async () => {
    const response = await api.get<AuthSessionDto[]>("/api/auth/sessions");
    return response.data;
  },

  revokeSession: async (sessionId: string) => {
    await api.delete(`/api/auth/sessions/${sessionId}`);
  },

  revokeAllSessions: async (keepCurrent = true) => {
    await api.delete("/api/auth/sessions", { params: { keepCurrent } });
  },

  loginMethods: async () => {
    const response = await api.get<LoginMethodsDto>("/api/auth/login-methods");
    return response.data;
  },

  setPassword: async (newPassword: string, confirmPassword: string, currentPassword?: string) => {
    await api.put("/api/auth/password", { currentPassword, newPassword, confirmPassword });
  },

  reauthenticate: async (password: string) => {
    await api.post("/api/auth/reauthenticate", { password });
  },

  completeCommunityOnboarding: async (
    dateOfBirth: string,
    locale: Locale,
    acceptCommunityGuidelines: boolean
  ) => {
    const response = await api.post<PrivateUser>("/api/auth/community-onboarding", {
      dateOfBirth,
      locale,
      acceptCommunityGuidelines,
    });
    return response.data;
  },

  disconnectLoginMethod: async (provider: "google" | "github") => {
    await api.delete(`/api/auth/login-methods/${provider}`);
  },

  getApiErrorMessage: (error: unknown, fallback: string) => getApiError(error, fallback).message,
};
