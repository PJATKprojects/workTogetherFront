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
      : normalized === "accepted"
        ? labels.accepted
        : normalized === "rejected"
          ? labels.rejected
          : status;
  return <Badge tone={statusTone(status)}>{text}</Badge>;
}
