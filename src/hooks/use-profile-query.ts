"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query/keys";
import { userService } from "@/services/userService";

export function useProfileQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: userService.getMyProfile,
    enabled: isAuthenticated,
    staleTime: 90_000,
    retry: 1,
  });
}
