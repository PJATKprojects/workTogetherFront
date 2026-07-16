"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { applicationService } from "@/services/applicationService";

export function useApplicationMutations(projectId?: number) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    if (projectId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    }
  };

  return {
    apply: useMutation({ mutationFn: applicationService.create, onSuccess: invalidate }),
    updateStatus: useMutation({
      mutationFn: ({ id, statusId }: { id: number; statusId: 2 | 3 }) =>
        applicationService.updateStatus(id, statusId),
      onSuccess: invalidate,
    }),
    withdraw: useMutation({ mutationFn: applicationService.withdraw, onSuccess: invalidate }),
  };
}
