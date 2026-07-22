"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { tokenStore } from "@/lib/auth/token-store";
import { queryKeys } from "@/lib/query/keys";
import { authService } from "@/services/authService";
import { securityService } from "@/services/securityService";
import { clearApiResponseCache, invalidateAuthSessionState } from "@/services/api";
import type { PrivateUser } from "@/types";

type AuthState = {
  user: PrivateUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresCommunityOnboarding: boolean;
  requiresProductOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPasskey: (email?: string) => Promise<void>;
  logout: (redirectTo: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<PrivateUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresCommunityOnboarding, setRequiresCommunityOnboarding] = useState(false);
  const [requiresProductOnboarding, setRequiresProductOnboarding] = useState(false);
  const queryClient = useQueryClient();

  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.refresh();
      await queryClient.cancelQueries();
      queryClient.clear();
      clearApiResponseCache();
      setUser(response.user);
      setRequiresCommunityOnboarding(response.requiresCommunityOnboarding);
      setRequiresProductOnboarding(response.requiresProductOnboarding);
      queryClient.setQueryData(queryKeys.users.me(), response.user);
      // Project payloads carry per-user fields (isOwner, hasApplied) — anything
      // fetched anonymously before the session restore is stale now.
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      return true;
    } catch (error) {
      // A stale refresh is intentionally cancelled when the user logs out or
      // switches accounts. It must not clear the newly established session.
      if (!axios.isCancel(error)) {
        tokenStore.clear();
        setUser(null);
        setRequiresCommunityOnboarding(false);
        setRequiresProductOnboarding(false);
      }
      return false;
    }
  }, [queryClient]);

  useEffect(() => {
    let active = true;
    const unsubscribe = tokenStore.subscribe((token) => {
      if (!token && active) setUser(null);
    });

    const refreshTimer = window.setTimeout(() => {
      void refreshSession().finally(() => {
        if (active) setIsLoading(false);
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [refreshSession]);

  useEffect(() => {
    if (isLoading) return;
    document.documentElement.dataset.authReady = "true";
    return () => {
      delete document.documentElement.dataset.authReady;
    };
  }, [isLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      setUser(null);
      invalidateAuthSessionState();
      await queryClient.cancelQueries();
      queryClient.clear();
      const response = await authService.login({ email, password });
      clearApiResponseCache();
      setUser(response.user);
      setRequiresCommunityOnboarding(response.requiresCommunityOnboarding);
      setRequiresProductOnboarding(response.requiresProductOnboarding);
      queryClient.setQueryData(queryKeys.users.me(), response.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    [queryClient]
  );

  const loginWithPasskey = useCallback(
    async (email?: string) => {
      setUser(null);
      invalidateAuthSessionState();
      await queryClient.cancelQueries();
      queryClient.clear();
      const response = await securityService.loginWithPasskey(email);
      clearApiResponseCache();
      setUser(response.user);
      setRequiresCommunityOnboarding(response.requiresCommunityOnboarding);
      setRequiresProductOnboarding(response.requiresProductOnboarding);
      queryClient.setQueryData(queryKeys.users.me(), response.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    [queryClient]
  );

  const logout = useCallback(
    async (redirectTo: string) => {
      // Disable polling components first, then abort their in-flight requests
      // while the access token is still valid for the server-side logout call.
      // Keep AuthGuard loading until navigation starts so its login redirect
      // cannot race the explicit post-logout destination.
      setIsLoading(true);
      setUser(null);
      setRequiresCommunityOnboarding(false);
      setRequiresProductOnboarding(false);
      invalidateAuthSessionState();
      await queryClient.cancelQueries();
      try {
        await authService.logout();
      } catch {
        // A network failure must not keep the local session or block sign-out.
      } finally {
        tokenStore.clear();
        clearApiResponseCache();
        setUser(null);
        setRequiresCommunityOnboarding(false);
        setRequiresProductOnboarding(false);
        queryClient.clear();
      }
      window.location.replace(redirectTo);
    },
    [queryClient]
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenStore.get()),
      isLoading,
      requiresCommunityOnboarding,
      requiresProductOnboarding,
      login,
      loginWithPasskey,
      logout,
      refreshSession,
    }),
    [
      isLoading,
      login,
      loginWithPasskey,
      logout,
      refreshSession,
      requiresCommunityOnboarding,
      requiresProductOnboarding,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
