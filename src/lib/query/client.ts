import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= 2) {
    return false;
  }

  if (!axios.isAxiosError(error)) {
    return true;
  }

  // Retrying validation/auth/rate-limit responses only adds load and can lock a
  // user into a failing loop. Network failures and transient 5xx reads are safe
  // to retry because query functions must not mutate server state.
  const status = error.response?.status;
  return status === undefined || status >= 500;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        retry: shouldRetryQuery,
        retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 5_000),
        refetchOnWindowFocus: false,
      },
      mutations: {
        // A lost response does not prove that a POST/PUT failed. Automatic
        // retries can therefore create duplicate projects/messages/applications.
        // Individual, server-idempotent mutations may opt into retry explicitly.
        retry: false,
      },
    },
  });
}
