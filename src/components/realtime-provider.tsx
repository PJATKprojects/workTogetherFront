"use client";

import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";

import { tokenStore } from "@/lib/auth/token-store";
import { queryKeys } from "@/lib/query/keys";
import { useAuth } from "@/hooks/use-auth";
import api from "@/services/api";

type RealtimeContextValue = {
  joinConversation: (conversationId: number) => Promise<void>;
  sendTyping: (conversationId: number, isTyping: boolean) => Promise<void>;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  joinConversation: async () => undefined,
  sendTyping: async () => undefined,
});

export function RealtimeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const connection = useRef<HubConnection | null>(null);

  useEffect(() => {
    // Browser smoke tests exercise deterministic HTTP/UI contracts without a
    // live SignalR server. Production and normal development never set this.
    if (process.env.NEXT_PUBLIC_DISABLE_REALTIME === "true") return;

    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let activeToken: string | null = null;

    const start = async (token: string | null) => {
      if (disposed) return;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (!token) {
        if (connection.current) await connection.current.stop();
        connection.current = null;
        activeToken = null;
        return;
      }
      if (
        connection.current &&
        activeToken === token &&
        connection.current.state !== HubConnectionState.Disconnected
      )
        return;
      if (connection.current) await connection.current.stop();
      const base = (
        process.env.NEXT_PUBLIC_REALTIME_URL ??
        process.env.NEXT_PUBLIC_API_URL ??
        ""
      ).replace(/\/$/, "");
      const next = new HubConnectionBuilder()
        .withUrl(`${base}/hubs/chat`, { accessTokenFactory: () => tokenStore.get() ?? "" })
        .withAutomaticReconnect([0, 1_000, 3_000, 10_000])
        .configureLogging(process.env.NODE_ENV === "development" ? LogLevel.Warning : LogLevel.None)
        .build();
      next.on("messageReceived", (message: { id: number; senderId: number }) => {
        if (user && message.senderId !== user.id) {
          void next.invoke("AcknowledgeDelivered", message.id).catch(() => undefined);
        }
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      });
      next.on("messagesDelivered", () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      });
      next.on("messagesRead", () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      });
      next.on("conversationRequestResolved", () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      });
      next.on("notification", () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.unreadCount() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      });
      const reportReconnect = (result: "started" | "succeeded" | "failed") => {
        void api.post("/api/telemetry/signalr-reconnect", { result }).catch(() => undefined);
      };
      next.onreconnecting(() => reportReconnect("started"));
      next.onreconnected(() => reportReconnect("succeeded"));
      next.onclose((error) => {
        if (error) reportReconnect("failed");
      });
      connection.current = next;
      activeToken = token;
      try {
        await next.start();
      } catch {
        if (!disposed && tokenStore.get()) {
          retryTimer = setTimeout(() => {
            void start(tokenStore.get());
          }, 3_000);
        }
      }
    };
    void start(tokenStore.get());
    const unsubscribe = tokenStore.subscribe((token) => {
      void start(token);
    });
    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      unsubscribe();
      const current = connection.current;
      connection.current = null;
      if (current) void current.stop();
    };
  }, [queryClient, user]);

  const joinConversation = useCallback(async (conversationId: number) => {
    if (connection.current?.state === HubConnectionState.Connected)
      await connection.current.invoke("JoinConversation", conversationId);
  }, []);
  const sendTyping = useCallback(async (conversationId: number, isTyping: boolean) => {
    if (connection.current?.state === HubConnectionState.Connected)
      await connection.current.invoke("Typing", conversationId, isTyping);
  }, []);

  return (
    <RealtimeContext.Provider value={{ joinConversation, sendTyping }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
