"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { applicationService } from "@/services/applicationService";
import type { PaginationParams } from "@/types";

export function useMyApplicationsQuery(pagination: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.applications.my(pagination),
    queryFn: () => applicationService.getMy(pagination),
    placeholderData: (previous) => previous,
  });
}

export function useProjectApplicationsQuery(
  projectId: number,
  pagination: PaginationParams,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.applications.byProject(projectId, pagination),
    queryFn: () => applicationService.getByProject(projectId, pagination),
    enabled: enabled && projectId > 0,
    placeholderData: (previous) => previous,
  });
}

/** Unread-style badge: pending applications across the user's own projects. */
export function useReceivedPendingCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.applications.receivedCount(),
    queryFn: applicationService.getReceivedPendingCount,
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
