"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { userService } from "@/services/userService";
import type { UserFilters } from "@/types";

export function useStudentsQuery(filters: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.lookingForTeam(filters),
    queryFn: () => userService.getLookingForTeam(filters),
  });
}
