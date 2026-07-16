/**
 * Uploaded files are stored as site-relative API paths ("/api/files/{name}") so the
 * database stays host-agnostic. The browser needs the API origin prepended; absolute
 * URLs (e.g. OAuth provider avatars) pass through untouched.
 */
export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/")) {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    return `${base}${url}`;
  }
  return url;
}
