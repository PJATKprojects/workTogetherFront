"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Sun ↔ moon toggle. Both icons are always rendered, absolutely centered and
 * cross-faded/rotated purely via `dark:` classes — no hydration flicker, and
 * the glyph stays optically dead-center in the round button.
 */
export function NavbarThemeToggle({ ariaLabel }: Readonly<{ ariaLabel: string }>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate for the click handler
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={ariaLabel}
      disabled={!mounted}
      className="focus-ring relative flex size-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-surface/90 text-accent-soft-foreground shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
    >
      {/* Sun — visible in light, spins away in dark */}
      <svg
        className="absolute size-[19px] rotate-0 scale-100 opacity-100 transition-all duration-300 ease-out dark:-rotate-90 dark:scale-0 dark:opacity-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx={12} cy={12} r={4.2} fill="currentColor" stroke="none" opacity={0.25} />
        <circle cx={12} cy={12} r={4.2} />
        <path d="M12 3v1.6M12 19.4V21M3 12h1.6M19.4 12H21M5.7 5.7l1.1 1.1M17.2 17.2l1.1 1.1M5.7 18.3l1.1-1.1M17.2 6.8l1.1-1.1" />
      </svg>
      {/* Moon + sparkles — hidden in light, spins in for dark */}
      <svg
        className="absolute size-[19px] rotate-90 scale-0 opacity-0 transition-all duration-300 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path
          d="M20 13.2A7.8 7.8 0 0 1 10.8 4 6.9 6.9 0 1 0 20 13.2Z"
          fill="currentColor"
          opacity={0.22}
        />
        <path d="M20 13.2A7.8 7.8 0 0 1 10.8 4 6.9 6.9 0 1 0 20 13.2Z" />
        <path d="M17.2 6.4v2.4M16 7.6h2.4" strokeWidth={1.6} />
        <path d="M20.4 10.4v1.6M19.6 11.2h1.6" strokeWidth={1.3} />
      </svg>
    </button>
  );
}
