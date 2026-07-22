/**
 * Uploaded files are stored as site-relative API paths ("/api/files/{name}") so the
 * database stays host-agnostic. The browser needs the API origin prepended; absolute
 * URLs (e.g. OAuth provider avatars) pass through untouched.
 */
export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/")) {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    // A relative API base already points at this origin. The stored URL is
    // rooted at `/api`, so prefixing `/api` again would create `/api/api/...`.
    if (!base || base.startsWith("/")) return url;
    try {
      // Stored paths already contain `/api`; only borrow the configured API
      // origin, never its path segment.
      return new URL(url, new URL(base).origin).toString();
    } catch {
      return `${base.replace(/\/api$/i, "")}${url}`;
    }
  }
  return url;
}
