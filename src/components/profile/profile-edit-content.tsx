"use client";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useProfileQuery } from "@/hooks/use-profile-query";
import { getApiError } from "@/lib/api-error";
import type { SiteMessages } from "@/messages/types";

import { ProfileForm } from "./profile-form";

export function ProfileEditContent({ messages }: Readonly<{ messages: SiteMessages }>) {
  const query = useProfileQuery();
  if (query.isLoading) return <LoadingSkeleton count={1} />;
  if (query.isError)
    return (
      <ErrorState
        message={getApiError(query.error, messages.errors.generic).message}
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );
  if (!query.data) return null;
  return <ProfileForm profile={query.data} messages={messages} />;
}
