"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { lookupService } from "@/services/lookupService";

const hour = 60 * 60 * 1000;

export const useRolesQuery = () =>
  useQuery({
    queryKey: queryKeys.lookups.roles(),
    queryFn: lookupService.getRoles,
    staleTime: hour,
  });

export const useTechnologiesQuery = () =>
  useQuery({
    queryKey: queryKeys.lookups.technologies(),
    queryFn: lookupService.getTechnologies,
    staleTime: hour,
  });

export const useProjectStatusesQuery = () =>
  useQuery({
    queryKey: queryKeys.lookups.projectStatuses(),
    queryFn: lookupService.getProjectStatuses,
    staleTime: hour,
  });

export const useApplicationStatusesQuery = () =>
  useQuery({
    queryKey: queryKeys.lookups.applicationStatuses(),
    queryFn: lookupService.getApplicationStatuses,
    staleTime: hour,
  });
