"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { tokenStore } from "@/lib/auth/token-store";
import { queryKeys } from "@/lib/query/keys";
import { authService } from "@/services/authService";
import { clearApiResponseCache, invalidateAuthSessionState } from "@/services/api";
import type { PrivateUser } from "@/types";

type AuthState = {
  user: PrivateUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<PrivateUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.refresh();
      await queryClient.cancelQueries();
      queryClient.clear();
      clearApiResponseCache();
      setUser(response.user);
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

  const login = useCallback(
    async (email: string, password: string) => {
      setUser(null);
      invalidateAuthSessionState();
      await queryClient.cancelQueries();
      queryClient.clear();
      const response = await authService.login({ email, password });
      clearApiResponseCache();
      setUser(response.user);
      queryClient.setQueryData(queryKeys.users.me(), response.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    // Disable polling components first, then abort their in-flight requests
    // while the access token is still valid for the server-side logout call.
    setUser(null);
    invalidateAuthSessionState();
    await queryClient.cancelQueries();
    try {
      await authService.logout();
    } finally {
      tokenStore.clear();
      clearApiResponseCache();
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenStore.get()),
      isLoading,
      login,
      logout,
      refreshSession,
    }),
    [isLoading, login, logout, refreshSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
