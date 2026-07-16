import Link from "next/link";

/**
 * Consistent "← Back" affordance for nested pages (v1.3). Explicit href —
 * predictable even when the page was opened from a direct link.
 */
export function BackLink({ href, label }: Readonly<{ href: string; label: string }>) {
  return (
    <Link
      href={href}
      className="focus-ring group mb-5 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <svg
        className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m12 19-7-7 7-7M5 12h14" />
      </svg>
      {label}
    </Link>
  );
}
