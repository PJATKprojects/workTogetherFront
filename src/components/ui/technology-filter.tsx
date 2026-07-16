"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useTechnologiesQuery } from "@/hooks/use-lookups-query";

export type TechnologyFilterLabels = Readonly<{
  /** Trigger prefix, e.g. "Technologies". */
  label: string;
  /** Shown when nothing is selected, e.g. "All". */
  all: string;
  searchPlaceholder: string;
  clear: string;
}>;

/**
 * Compact multi-select for the 50+ technology catalog: a select-style trigger
 * that opens a searchable checklist popover. Replaces the old wall of chips
 * on the Projects/Students filter panels.
 */
export function TechnologyFilter({
  selected,
  onChange,
  labels,
}: Readonly<{
  selected: number[];
  onChange: (ids: number[]) => void;
  labels: TechnologyFilterLabels;
}>) {
  const technologies = useTechnologiesQuery();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Light dismiss: outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const normalized = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const all = technologies.data ?? [];
    return normalized ? all.filter((item) => item.name.toLowerCase().includes(normalized)) : all;
  }, [normalized, technologies.data]);

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-input bg-surface px-3 text-sm text-foreground transition-colors hover:border-primary/40"
      >
        <span className="truncate">
          {labels.label}:{" "}
          {selected.length ? (
            <span className="font-semibold text-primary-text">{selected.length}</span>
          ) : (
            labels.all
          )}
        </span>
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
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-lg)]">
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="focus-ring h-10 w-full rounded-xl border border-input bg-surface px-3 text-sm outline-none placeholder:text-muted-foreground/70"
          />
          <div
            role="listbox"
            aria-multiselectable
            className="mt-2.5 flex max-h-56 flex-wrap content-start gap-1.5 overflow-y-auto overscroll-contain pr-1"
          >
            {visible.map((technology) => {
              const active = selected.includes(technology.id);
              return (
                <button
                  key={technology.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => toggle(technology.id)}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {technology.name}
                </button>
              );
            })}
          </div>
          {selected.length ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-2.5 cursor-pointer text-xs font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              {labels.clear}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
