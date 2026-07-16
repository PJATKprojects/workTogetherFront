"use client";

import { useReceivedPendingCountQuery } from "@/hooks/use-applications-query";

/** Count for the "My projects" unread badge; 0 while logged out or loading. */
export function useApplicationsBadge(isAuthenticated: boolean): number {
  const query = useReceivedPendingCountQuery(isAuthenticated);
  return isAuthenticated ? (query.data ?? 0) : 0;
}
