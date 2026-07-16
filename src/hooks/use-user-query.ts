"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { userService } from "@/services/userService";

export function useUserQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
