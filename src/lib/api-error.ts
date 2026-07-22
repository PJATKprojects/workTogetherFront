import axios from "axios";

import type { ErrorResponse } from "@/types";

export function getApiError(error: unknown, fallback = "Unknown error"): ErrorResponse {
  if (axios.isAxiosError(error)) {
    if (axios.isCancel(error)) {
      return { message: fallback };
    }
    if (!error.response) {
      return { message: "Network error" };
    }

    const data = error.response.data;
    if (data && typeof data === "object") {
      const candidate = data as Partial<ErrorResponse> & { error?: string };
      const fieldMessages = candidate.errors
        ? Object.entries(candidate.errors)
            .filter(([key]) => key !== "planLimit")
            .flatMap(([, messages]) => messages)
        : [];
      return {
        message:
          [candidate.message || candidate.error, ...fieldMessages].filter(Boolean).join(" ") ||
          fallback,
        errors: candidate.errors,
      };
    }
  }

  return { message: fallback };
}

export function getPlanLimitCode(error: unknown) {
  if (!axios.isAxiosError(error) || error.response?.status !== 402) return undefined;
  const data = error.response.data as { errors?: { planLimit?: string[] } } | undefined;
  return data?.errors?.planLimit?.[0];
}

export function getApiStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
