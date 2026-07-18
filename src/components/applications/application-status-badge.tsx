import { Badge, statusTone } from "@/components/ui/badge";
import type { SiteMessages } from "@/messages/types";

export function ApplicationStatusBadge({
  status,
  labels,
}: Readonly<{ status: string; labels: SiteMessages["applications"] }>) {
  const normalized = status.toLowerCase();
  const text =
    normalized === "pending"
      ? labels.pending
      : normalized === "draft"
        ? labels.draft
        : normalized === "sent"
          ? labels.sent
          : normalized === "viewed"
            ? labels.viewed
            : normalized === "shortlisted"
              ? labels.shortlisted
              : normalized === "interview"
                ? labels.interview
                : normalized === "trial"
                  ? labels.trial
                  : normalized === "withdrawn"
                    ? labels.withdrawn
                    : normalized === "expired"
                      ? labels.expired
                      : normalized === "accepted"
                        ? labels.accepted
                        : normalized === "rejected"
                          ? labels.rejected
                          : status;
  return <Badge tone={statusTone(status)}>{text}</Badge>;
}
