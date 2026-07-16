"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { createQueryClient } from "@/lib/query/client";

export function AppQueryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => createQueryClient());

  useEffect(() => {
    // Remove data written by the previous persisted-cache implementation.
    window.sessionStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
  }, []);

  // Keep account-scoped data in memory only. Persisting chat/application
  // queries in sessionStorage can restore the previous account's state after
  // logout or account switching.
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
