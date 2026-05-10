"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <circle cx={12} cy={12} r={4} />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 14.462A9.004 9.004 0 0110.539 3a7.008 7.008 0 109.462 11.462z"
      />
    </svg>
  );
}

export function NavbarThemeToggle({ ariaLabel }: Readonly<{ ariaLabel: string }>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate for theme icons
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={() => cycleTheme()}
      aria-label={ariaLabel}
      disabled={!mounted}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-amber-200/90 dark:hover:bg-zinc-800"
    >
      {!mounted ? (
        <span className="size-4 rounded-full bg-zinc-200 dark:bg-zinc-600" aria-hidden />
      ) : resolvedTheme === "dark" ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </button>
  );
}
