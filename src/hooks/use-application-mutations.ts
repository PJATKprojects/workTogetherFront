"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { applicationService } from "@/services/applicationService";

export function useApplicationMutations(projectId?: number) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
    if (projectId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    }
  };

  return {
    apply: useMutation({ mutationFn: applicationService.create, onSuccess: invalidate }),
    updateStatus: useMutation({
      mutationFn: ({
        id,
        statusId,
        details,
      }: {
        id: number;
        statusId: 2 | 3 | 6 | 7 | 8;
        details?: Record<string, unknown>;
      }) => applicationService.updateStatus(id, statusId, details),
      onSuccess: invalidate,
    }),
    withdraw: useMutation({ mutationFn: applicationService.withdraw, onSuccess: invalidate }),
    submitDraft: useMutation({ mutationFn: applicationService.submitDraft, onSuccess: invalidate }),
    updateDraft: useMutation({
      mutationFn: ({
        id,
        value,
      }: {
        id: number;
        value: Parameters<typeof applicationService.updateDraft>[1];
      }) => applicationService.updateDraft(id, value),
      onSuccess: invalidate,
    }),
    expire: useMutation({ mutationFn: applicationService.expire, onSuccess: invalidate }),
  };
}
