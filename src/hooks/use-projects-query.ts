"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { projectService } from "@/services/projectService";
import type { PaginationParams, ProjectFilters } from "@/types";

export function useProjectsQuery(filters: ProjectFilters) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectService.getAll(filters),
  });
}

export function useProjectQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useMyProjectsQuery(filters?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.projects.my(filters),
    queryFn: () => projectService.getMy(filters),
  });
}
