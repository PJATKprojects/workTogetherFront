"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { localText, type Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query/keys";
import { matchingService, type SavedSearch } from "@/services/matchingService";
import type { ProjectFilters } from "@/types";

export function SavedSearchControls({
  locale,
  filters,
  onApply,
  initialSavedSearchId,
}: Readonly<{
  locale: Locale;
  filters: ProjectFilters;
  onApply: (filters: ProjectFilters) => void;
  initialSavedSearchId?: number;
}>) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [name, setName] = useState("");
  const [digest, setDigest] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const initialApplied = useRef(false);
  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const loaded = await matchingService.savedSearches();
      setItems(loaded);
      if (!initialApplied.current && initialSavedSearchId) {
        initialApplied.current = true;
        const selected = loaded.find((item) => item.id === initialSavedSearchId);
        if (selected) onApply({ ...selected.filters, page: 1 });
      }
    } catch {
      /* optional control */
    }
  }, [initialSavedSearchId, isAuthenticated, onApply]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  if (!isAuthenticated) return null;
  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await matchingService.saveSearch(name.trim(), filters, digest);
      setName("");
      await load();
      await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not save search.",
            "Не вдалося зберегти пошук.",
            "Nie udało się zapisać wyszukiwania."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-3 rounded-2xl border border-border bg-surface-muted p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          placeholder={localText(locale, "Search name", "Назва пошуку", "Nazwa wyszukiwania")}
          className="h-10 min-w-48 flex-1 rounded-xl border border-input bg-surface px-3 text-sm"
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={digest}
            onChange={(e) => setDigest(e.target.checked)}
            className="accent-primary"
          />
          {localText(locale, "Weekly digest", "Щотижневий digest", "Podsumowanie tygodniowe")}
        </label>
        <button
          disabled={busy || !name.trim()}
          onClick={() => void save()}
          className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {localText(locale, "Save search", "Зберегти пошук", "Zapisz wyszukiwanie")}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      {items.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center overflow-hidden rounded-xl border border-border bg-surface text-xs"
            >
              <button
                onClick={() => onApply({ ...item.filters, page: 1 })}
                className="px-3 py-2 font-semibold hover:bg-muted"
              >
                {item.name}
                {item.weeklyDigest ? " · email" : ""}
              </button>
              <button
                aria-label={localText(
                  locale,
                  "Delete saved search",
                  "Видалити збережений пошук",
                  "Usuń zapisane wyszukiwanie"
                )}
                onClick={() => void matchingService.deleteSearch(item.id).then(load)}
                className="border-l border-border px-2 py-2 text-destructive hover:bg-destructive/10"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
