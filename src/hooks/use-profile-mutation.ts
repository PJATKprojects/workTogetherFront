"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query/keys";
import { userService } from "@/services/userService";

export function useProfileMutation() {
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(queryKeys.users.me(), profile);
      await refreshSession();
    },
  });
}
