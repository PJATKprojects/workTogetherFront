import { getApiError } from "@/lib/api-error";
import { tokenStore } from "@/lib/auth/token-store";
import type { PrivateUser } from "@/types";

import api, { refreshAuthSession } from "./api";

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: PrivateUser;
}

export interface RegisterResponseDto {
  message: string;
  user: unknown;
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

  getApiErrorMessage: (error: unknown, fallback: string) => getApiError(error, fallback).message,
};
