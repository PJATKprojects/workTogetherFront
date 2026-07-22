import type { PagedResult } from "@/types";

import api from "./api";

export interface NotificationItem {
  id: number;
  type:
    | "application"
    | "message"
    | "message_request"
    | "invite"
    | "mention"
    | "deadline"
    | "team_update"
    | "moderation"
    | "plan_limit_applied";
  dataJson: string;
  actionUrl: string;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPreferences {
  emailMessages: boolean;
  emailMentions: boolean;
  emailTeamUpdates: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
  pushValueConfirmedAt: string | null;
  quietHoursStartMinutes: number | null;
  quietHoursEndMinutes: number | null;
}

export interface PushConfiguration {
  available: boolean;
  publicKey: string | null;
  eligibleToConfirmValue: boolean;
  valueConfirmed: boolean;
  enabled: boolean;
  activeSubscriptions: number;
}

function decodeVapidKey(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

async function readyServiceWorker() {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error("Push notifications are not supported by this browser.");
  }
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  return navigator.serviceWorker.ready;
}

export const notificationService = {
  get: async () => (await api.get<PagedResult<NotificationItem>>("/api/notifications")).data,
  unreadCount: async () =>
    (await api.get<{ count: number }>("/api/notifications/unread-count")).data.count,
  read: (id: number) => api.post(`/api/notifications/${id}/read`),
  readAll: () => api.post("/api/notifications/read-all"),
  preferences: async () =>
    (await api.get<NotificationPreferences>("/api/notification-preferences")).data,
  updatePreferences: async (value: NotificationPreferences) =>
    (await api.put<NotificationPreferences>("/api/notification-preferences", value)).data,
  pushConfiguration: async () => (await api.get<PushConfiguration>("/api/push/configuration")).data,
  confirmPushValue: async () => (await api.post<PushConfiguration>("/api/push/confirm-value")).data,
  enablePush: async () => {
    const configuration = (await api.get<PushConfiguration>("/api/push/configuration")).data;
    if (!configuration.available || !configuration.publicKey) {
      throw new Error("Push notifications are not available on this server.");
    }
    if (!configuration.valueConfirmed) {
      throw new Error("Confirm notification value before enabling push.");
    }
    const registration = await readyServiceWorker();
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Browser notification permission was not granted.");
    }
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(configuration.publicKey),
      }));
    const p256dh = subscription.getKey("p256dh");
    const auth = subscription.getKey("auth");
    const response = await api.post<PushConfiguration>("/api/push/subscriptions", {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: p256dh ? arrayBufferToBase64Url(p256dh) : "",
        auth: auth ? arrayBufferToBase64Url(auth) : "",
      },
    });
    return response.data;
  },
  disablePush: async () => {
    const registration = await readyServiceWorker();
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return (await api.get<PushConfiguration>("/api/push/configuration")).data;
    }
    const response = await api.delete<PushConfiguration>("/api/push/subscriptions", {
      data: { endpoint: subscription.endpoint },
    });
    await subscription.unsubscribe();
    return response.data;
  },
};

function arrayBufferToBase64Url(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}
