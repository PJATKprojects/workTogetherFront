"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { resolveFileUrl } from "@/lib/files";

/**
 * Profile photo with a gradient-initial fallback. `avatarUrl` may be an uploaded
 * file ("/api/files/…", resolved against the API origin) or an absolute URL from
 * an OAuth provider. Size/typography come from the caller via `className`.
 */
export function UserAvatar({
  name,
  avatarUrl,
  className,
}: Readonly<{ name: string; avatarUrl?: string | null; className?: string }>) {
  const src = resolveFileUrl(avatarUrl);
  const [failedSrc, setFailedSrc] = useState("");

  if (src && failedSrc !== src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user content from arbitrary hosts (uploads + OAuth pictures); next/image would need per-host config
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailedSrc(src)}
        className={cn("shrink-0 rounded-2xl object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary font-semibold text-primary-foreground",
        className
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
