"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTechnologiesQuery } from "@/hooks/use-lookups-query";
import { getApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query/keys";
import { lookupService } from "@/services/lookupService";
import type { Technology } from "@/types";

export type TechnologyPickerLabels = Readonly<{
  /** Trigger placeholder when nothing is selected. */
  placeholder: string;
  searchPlaceholder: string;
  /** "{name}" is replaced with the typed value. */
  addNew: string;
  adding: string;
  genericError: string;
}>;

/**
 * Form-side technology multi-select (v1.3): a select-style trigger opening a
 * SOLID searchable popover; unknown names can be created inline (the API
 * dedupes case-insensitively). Selected technologies render as removable
 * chips under the trigger. Used by the profile editor and position forms.
 */
export function TechnologyPicker({
  selected,
  onChange,
  labels,
}: Readonly<{
  selected: number[];
  onChange: (ids: number[]) => void;
  labels: TechnologyPickerLabels;
}>) {
  const technologies = useTechnologiesQuery();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  const byId = useMemo(() => {
    const map = new Map<number, Technology>();
    for (const item of technologies.data ?? []) map.set(item.id, item);
    return map;
  }, [technologies.data]);

  const normalized = query.trim().toLowerCase();
  const { visible, exactMatch } = useMemo(() => {
    const all = technologies.data ?? [];
    return {
      visible: normalized
        ? all.filter((item) => item.name.toLowerCase().includes(normalized))
        : all,
      exactMatch: all.some((item) => item.name.toLowerCase() === normalized),
    };
  }, [normalized, technologies.data]);

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const createTechnology = async () => {
    const name = query.trim();
    if (!name || creating) return;
    setCreating(true);
    setError("");
    try {
      const created = await lookupService.createTechnology(name);
      queryClient.setQueryData<Technology[]>(queryKeys.lookups.technologies(), (current) =>
        current?.some((item) => item.id === created.id) ? current : [...(current ?? []), created]
      );
      if (!selected.includes(created.id)) {
        onChange([...selected, created.id]);
      }
      setQuery("");
    } catch (cause) {
      setError(getApiError(cause, labels.genericError).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground shadow-[var(--shadow-sm)] transition-colors hover:border-primary/40"
      >
        <span className={selected.length ? "" : "text-muted-foreground/80"}>
          {selected.length ? (
            <span className="font-medium">
              {labels.placeholder}{" "}
              <span className="font-semibold text-primary-text">({selected.length})</span>
            </span>
          ) : (
            labels.placeholder
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
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (normalized && !exactMatch) void createTechnology();
              }
            }}
            placeholder={labels.searchPlaceholder}
            className="focus-ring h-10 w-full rounded-xl border border-input bg-surface-muted/60 px-3 text-sm outline-none placeholder:text-muted-foreground/70"
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
            {normalized && !exactMatch ? (
              <button
                type="button"
                onClick={() => void createTechnology()}
                disabled={creating}
                className="cursor-pointer rounded-full border border-dashed border-primary/60 px-2.5 py-1 text-xs font-semibold text-primary-text transition-colors duration-150 hover:bg-primary-soft disabled:cursor-wait disabled:opacity-60"
              >
                {creating ? labels.adding : labels.addNew.replace("{name}", query.trim())}
              </button>
            ) : null}
          </div>
          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
        </div>
      ) : null}

      {selected.length ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {selected.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-3 pr-1.5 text-xs font-medium text-primary-soft-foreground"
            >
              {byId.get(id)?.name ?? `#${id}`}
              <button
                type="button"
                aria-label={`× ${byId.get(id)?.name ?? id}`}
                onClick={() => toggle(id)}
                className="flex size-4.5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-primary/20"
              >
                <svg
                  className="size-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
