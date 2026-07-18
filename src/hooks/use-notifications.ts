"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { notificationService } from "@/services/notificationService";

export const useNotifications = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: notificationService.get,
    enabled,
  });
export const useNotificationUnread = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: notificationService.unreadCount,
    enabled,
  });
export function useNotificationActions() {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: queryKeys.notifications.all });
  return {
    read: useMutation({ mutationFn: notificationService.read, onSuccess: invalidate }),
    readAll: useMutation({ mutationFn: notificationService.readAll, onSuccess: invalidate }),
  };
}
