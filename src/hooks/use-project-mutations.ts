"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { projectService } from "@/services/projectService";
import type { CreatePositionDto, UpdatePositionDto, UpdateProjectDto } from "@/types";

export function useProjectMutations(projectId?: number) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
    if (projectId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    }
  };

  return {
    create: useMutation({ mutationFn: projectService.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (data: UpdateProjectDto) => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.update(projectId, data);
      },
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.remove(projectId);
      },
      onSuccess: invalidate,
    }),
    closeRecruitment: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.closeRecruitment(projectId);
      },
      onSuccess: invalidate,
    }),
    reopenRecruitment: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.reopenRecruitment(projectId);
      },
      onSuccess: invalidate,
    }),
    hide: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.hide(projectId);
      },
      onSuccess: invalidate,
    }),
    publish: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.publish(projectId);
      },
      onSuccess: invalidate,
    }),
    archive: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.archive(projectId);
      },
      onSuccess: invalidate,
    }),
    restore: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.restore(projectId);
      },
      onSuccess: invalidate,
    }),
    confirmFreshnessActive: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.confirmFreshnessActive(projectId);
      },
      onSuccess: invalidate,
    }),
    confirmFreshnessClose: useMutation({
      mutationFn: () => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.confirmFreshnessClose(projectId);
      },
      onSuccess: invalidate,
    }),
    addPosition: useMutation({
      mutationFn: (data: CreatePositionDto) => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.addPosition(projectId, data);
      },
      onSuccess: invalidate,
    }),
    updatePosition: useMutation({
      mutationFn: ({ positionId, data }: { positionId: number; data: UpdatePositionDto }) => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.updatePosition(projectId, positionId, data);
      },
      onSuccess: invalidate,
    }),
    deletePosition: useMutation({
      mutationFn: (positionId: number) => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.deletePosition(projectId, positionId);
      },
      onSuccess: invalidate,
    }),
    closePosition: useMutation({
      mutationFn: (positionId: number) => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.closePosition(projectId, positionId);
      },
      onSuccess: invalidate,
    }),
    reopenPosition: useMutation({
      mutationFn: (positionId: number) => {
        if (!projectId) throw new Error("Project id is required");
        return projectService.reopenPosition(projectId, positionId);
      },
      onSuccess: invalidate,
    }),
  };
}
