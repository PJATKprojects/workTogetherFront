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
      const fieldMessages = candidate.errors ? Object.values(candidate.errors).flat() : [];
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

export function getApiStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
