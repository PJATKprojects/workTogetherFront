"use client";

import { useEffect, useRef, useState } from "react";

export type DropdownOption = Readonly<{ value: string; label: string }>;

/**
 * Styled single-select (v1.3): native <select> popups can't be themed and look
 * like bare OS controls, so filter panels use this button + solid popover
 * listbox instead. Light-dismiss via outside click / Escape.
 */
export function DropdownSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  options: readonly DropdownOption[];
  ariaLabel: string;
  className?: string;
}>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground shadow-[var(--shadow-sm)] transition-colors hover:border-primary/40"
      >
        <span className="truncate">{current?.label}</span>
        <svg
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-lg)]"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  window.requestAnimationFrame(() => triggerRef.current?.focus());
                }}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100 ${
                  active
                    ? "bg-primary-soft font-semibold text-primary-soft-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {active ? (
                  <svg
                    className="size-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
