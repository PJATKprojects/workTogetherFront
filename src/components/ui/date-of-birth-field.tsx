"use client";

import { useState, type FocusEvent } from "react";

import { localText, type Locale } from "@/i18n/locales";
import {
  dateOfBirthPartsFromIso,
  isoDateFromDateOfBirthParts,
  type DateOfBirthParts,
} from "@/lib/date-of-birth";

type Props = Readonly<{
  idPrefix: string;
  label: string;
  locale: Locale;
  initialValue?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hint?: string;
  error?: string;
  valid?: boolean;
  compact?: boolean;
  className?: string;
}>;

type PartName = keyof DateOfBirthParts;

export function DateOfBirthField({
  idPrefix,
  label,
  locale,
  initialValue = "",
  onChange,
  onBlur,
  hint,
  error,
  valid = false,
  compact = false,
  className = "",
}: Props) {
  const [parts, setParts] = useState(() => dateOfBirthPartsFromIso(initialValue));
  const dayLabel = localText(locale, "Day", "День", "Dzień");
  const monthLabel = localText(locale, "Month", "Місяць", "Miesiąc");
  const yearLabel = localText(locale, "Year", "Рік", "Rok");
  const feedbackId = error ? `${idPrefix}-error` : hint ? `${idPrefix}-hint` : undefined;
  const stateClass = error
    ? "border-destructive/80 shadow-[0_0_0_3px_rgb(220_38_38/0.12)]"
    : valid
      ? "border-success/75 shadow-[0_0_0_3px_rgb(5_150_105/0.12)]"
      : "border-input";
  const inputClass = `focus-ring w-full rounded-xl border bg-surface px-2 text-center font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground/60 ${compact ? "h-10 text-sm sm:h-[42px]" : "h-11 text-base"} ${stateClass}`;

  const updatePart = (part: PartName, rawValue: string) => {
    const limit = part === "year" ? 4 : 2;
    const next = {
      ...parts,
      [part]: rawValue.replace(/\D/gu, "").slice(0, limit),
    };
    setParts(next);
    onChange(isoDateFromDateOfBirthParts(next));
  };

  const leaveGroup = (event: FocusEvent<HTMLFieldSetElement>) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    onBlur?.();
  };

  const fields = [
    { part: "day" as const, label: dayLabel, placeholder: "DD", maxLength: 2 },
    { part: "month" as const, label: monthLabel, placeholder: "MM", maxLength: 2 },
    { part: "year" as const, label: yearLabel, placeholder: "YYYY", maxLength: 4 },
  ];

  return (
    <fieldset className={className} onBlur={leaveGroup} aria-describedby={feedbackId}>
      <legend
        className={
          compact
            ? "mb-1 text-xs leading-none font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            : "mb-2 text-sm font-semibold"
        }
      >
        {label}
      </legend>
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.25fr)] gap-2">
        {fields.map((field, index) => (
          <label key={field.part} className="grid min-w-0 gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">{field.label}</span>
            <input
              id={`${idPrefix}-${field.part}`}
              name={`dateOfBirth${field.part[0].toUpperCase()}${field.part.slice(1)}`}
              type="text"
              inputMode="numeric"
              autoComplete={`bday-${field.part}`}
              enterKeyHint={index === fields.length - 1 ? "done" : "next"}
              required
              maxLength={field.maxLength}
              value={parts[field.part]}
              placeholder={field.placeholder}
              aria-label={field.label}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={feedbackId}
              className={inputClass}
              onChange={(event) => updatePart(field.part, event.target.value)}
            />
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${idPrefix}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${idPrefix}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}
