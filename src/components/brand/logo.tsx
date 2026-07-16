import { cn } from "@/lib/cn";

/**
 * WorkTogether brand mark: two interlocking V-strokes forming a W — two people
 * joining into one team. Blue→cyan brand gradient tile with a soft top light.
 * Sized by the caller (`className`), corner radius via `rounded`.
 */
export function BrandMark({
  className = "size-8",
  rounded = "rounded-lg",
}: Readonly<{ className?: string; rounded?: string }>) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br from-primary to-secondary text-primary-foreground shadow-[0_8px_20px_-8px_var(--primary)]",
        rounded,
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_18%_0%,rgb(255_255_255/0.30),transparent_55%)]"
      />
      <svg viewBox="0 0 24 24" fill="none" className="relative size-[64%]" aria-hidden>
        <path
          d="M4.5 7.5 9 16.5l4.5-9"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 7.5 15 16.5l4.5-9"
          stroke="currentColor"
          strokeOpacity={0.7}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
