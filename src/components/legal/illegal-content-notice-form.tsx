"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import type { Locale } from "@/i18n/locales";
import { getApiError } from "@/lib/api-error";
import type { IllegalContentFormMessages } from "@/messages/types";
import {
  illegalContentService,
  type IllegalContentCategory,
} from "@/services/illegalContentService";

type Field = "name" | "email" | "contentUrl" | "legalReason" | "goodFaith";
type FieldErrors = Partial<Record<Field, string>>;

export function IllegalContentNoticeForm({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: IllegalContentFormMessages }>) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [category, setCategory] = useState<IllegalContentCategory>("other");
  const [legalReason, setLegalReason] = useState("");
  const [goodFaith, setGoodFaith] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");

  const mutation = useMutation({
    mutationFn: illegalContentService.create,
  });
  const isChildSafety = category === "child_safety";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    const nextErrors = validate({
      name,
      email,
      contentUrl,
      legalReason,
      goodFaith,
      isChildSafety,
      labels,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    try {
      await mutation.mutateAsync({
        reporterName: name.trim() || undefined,
        reporterEmail: email.trim() || undefined,
        contentUrl: contentUrl.trim(),
        category,
        legalReason: legalReason.trim(),
        goodFaithConfirmed: goodFaith,
        locale,
      });
    } catch (value) {
      setSubmitError(getApiError(value, labels.errors.generic).message);
    }
  };

  const reset = () => {
    mutation.reset();
    setName("");
    setEmail("");
    setContentUrl("");
    setCategory("other");
    setLegalReason("");
    setGoodFaith(false);
    setErrors({});
    setSubmitError("");
  };

  if (mutation.data) {
    return (
      <section
        id="notice-form"
        aria-labelledby="notice-success-title"
        className="mx-auto mb-16 w-full max-w-3xl scroll-mt-28 px-4 sm:px-6"
      >
        <div
          role="status"
          className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8"
        >
          <h2 id="notice-success-title" className="text-2xl font-semibold">
            {labels.successTitle}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">{labels.successBody}</p>
          <dl className="mt-5 rounded-2xl border border-emerald-500/30 bg-surface/80 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {labels.referenceLabel}
            </dt>
            <dd className="mt-1 break-all font-mono text-base font-semibold">
              {mutation.data.reference}
            </dd>
          </dl>
          <button
            type="button"
            onClick={reset}
            className="focus-ring mt-5 min-h-11 rounded-xl border border-border bg-surface px-5 text-sm font-semibold hover:bg-muted"
          >
            {labels.another}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="notice-form"
      aria-labelledby="notice-form-title"
      className="mx-auto mb-16 w-full max-w-3xl scroll-mt-28 px-4 sm:px-6"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-8">
        <h2 id="notice-form-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {labels.title}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">{labels.intro}</p>
        <div className="mt-5 grid gap-3">
          <p className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm leading-6">
            {labels.emergency}
          </p>
          <p className="rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm leading-6">
            {labels.childSafetyNote}
          </p>
        </div>

        <form className="mt-7 grid gap-5" onSubmit={submit} noValidate>
          {Object.keys(errors).length > 0 ? (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
            >
              <p className="font-semibold">{labels.errors.summary}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-destructive">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>
                    <a className="underline" href={`#notice-${field}`}>
                      {message}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <label htmlFor="notice-category" className="grid gap-1.5 text-sm font-semibold">
            {labels.category}
            <select
              id="notice-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as IllegalContentCategory);
                setErrors((current) => ({ ...current, name: undefined, email: undefined }));
              }}
              className="min-h-11 rounded-xl border border-input bg-surface px-3 font-normal"
            >
              <option value="child_safety">{labels.categories.childSafety}</option>
              <option value="threats">{labels.categories.threats}</option>
              <option value="hate">{labels.categories.hate}</option>
              <option value="fraud">{labels.categories.fraud}</option>
              <option value="privacy">{labels.categories.privacy}</option>
              <option value="intellectual_property">
                {labels.categories.intellectualProperty}
              </option>
              <option value="other">{labels.categories.other}</option>
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="notice-name"
              label={labels.name}
              hint={labels.nameHint}
              error={errors.name}
            >
              <input
                id="notice-name"
                autoComplete="name"
                maxLength={160}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                aria-invalid={Boolean(errors.name) || undefined}
                aria-describedby={describedBy("notice-name", errors.name)}
                className="min-h-11 rounded-xl border border-input bg-surface px-3 font-normal"
              />
            </FormField>
            <FormField
              id="notice-email"
              label={labels.email}
              hint={labels.emailHint}
              error={errors.email}
            >
              <input
                id="notice-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                }}
                aria-invalid={Boolean(errors.email) || undefined}
                aria-describedby={describedBy("notice-email", errors.email)}
                className="min-h-11 rounded-xl border border-input bg-surface px-3 font-normal"
              />
            </FormField>
          </div>

          <FormField
            id="notice-contentUrl"
            label={labels.contentUrl}
            hint={labels.contentUrlHint}
            error={errors.contentUrl}
          >
            <input
              id="notice-contentUrl"
              type="url"
              inputMode="url"
              maxLength={2048}
              value={contentUrl}
              onChange={(event) => {
                setContentUrl(event.target.value);
                setErrors((current) => ({ ...current, contentUrl: undefined }));
              }}
              aria-invalid={Boolean(errors.contentUrl) || undefined}
              aria-describedby={describedBy("notice-contentUrl", errors.contentUrl)}
              className="min-h-11 rounded-xl border border-input bg-surface px-3 font-normal"
            />
          </FormField>

          <FormField
            id="notice-legalReason"
            label={labels.legalReason}
            hint={labels.legalReasonHint}
            error={errors.legalReason}
          >
            <textarea
              id="notice-legalReason"
              rows={6}
              minLength={20}
              maxLength={5000}
              value={legalReason}
              onChange={(event) => {
                setLegalReason(event.target.value);
                setErrors((current) => ({ ...current, legalReason: undefined }));
              }}
              aria-invalid={Boolean(errors.legalReason) || undefined}
              aria-describedby={describedBy("notice-legalReason", errors.legalReason)}
              className="rounded-xl border border-input bg-surface p-3 font-normal leading-6"
            />
          </FormField>

          <div>
            <label
              htmlFor="notice-goodFaith"
              className="flex items-start gap-3 rounded-2xl border border-border p-4 text-sm leading-6"
            >
              <input
                id="notice-goodFaith"
                type="checkbox"
                checked={goodFaith}
                onChange={(event) => {
                  setGoodFaith(event.target.checked);
                  setErrors((current) => ({ ...current, goodFaith: undefined }));
                }}
                aria-invalid={Boolean(errors.goodFaith) || undefined}
                aria-describedby={errors.goodFaith ? "notice-goodFaith-error" : undefined}
                className="mt-1 size-4 shrink-0 accent-primary"
              />
              <span>{labels.goodFaith}</span>
            </label>
            <FieldError id="notice-goodFaith-error" message={errors.goodFaith} />
          </div>

          {submitError ? (
            <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="focus-ring min-h-12 w-fit rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
          >
            {mutation.isPending ? labels.submitting : labels.submit}
          </button>
        </form>
      </div>
    </section>
  );
}

function FormField({
  id,
  label,
  hint,
  error,
  children,
}: Readonly<{
  id: string;
  label: string;
  hint: string;
  error?: string;
  children: ReactNode;
}>) {
  return (
    <div className="grid gap-1.5 text-sm">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {children}
      <span id={`${id}-hint`} className="text-xs font-normal leading-5 text-muted-foreground">
        {hint}
      </span>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: Readonly<{ id: string; message?: string }>) {
  if (!message) return null;
  return (
    <span id={id} className="text-xs font-normal text-destructive">
      {message}
    </span>
  );
}

function describedBy(id: string, error?: string) {
  return error ? `${id}-hint ${id}-error` : `${id}-hint`;
}

function validate(input: {
  name: string;
  email: string;
  contentUrl: string;
  legalReason: string;
  goodFaith: boolean;
  isChildSafety: boolean;
  labels: IllegalContentFormMessages;
}) {
  const errors: FieldErrors = {};
  if (!input.isChildSafety && input.name.trim().length < 2) {
    errors.name = input.labels.errors.name;
  }
  if (
    (!input.isChildSafety || input.email.trim()) &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  ) {
    errors.email = input.labels.errors.email;
  }
  if (!isCurrentSiteUrl(input.contentUrl)) {
    errors.contentUrl = input.labels.errors.contentUrl;
  }
  if (input.legalReason.trim().length < 20) {
    errors.legalReason = input.labels.errors.legalReason;
  }
  if (!input.goodFaith) {
    errors.goodFaith = input.labels.errors.goodFaith;
  }
  return errors;
}

function isCurrentSiteUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.origin === window.location.origin &&
      !url.username &&
      !url.password &&
      !url.hash
    );
  } catch {
    return false;
  }
}
