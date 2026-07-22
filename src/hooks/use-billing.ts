"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { billingService } from "@/services/billingService";

export function usePlanOverview(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billing.overview(),
    queryFn: billingService.getOverview,
    enabled,
    staleTime: 30_000,
  });
}

export function useBillingCheckout() {
  return useMutation({ mutationFn: billingService.createCheckout });
}

export function useNativeEntitlementSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: billingService.syncNative,
    onSuccess: (overview) => {
      queryClient.setQueryData(queryKeys.billing.overview(), overview);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
