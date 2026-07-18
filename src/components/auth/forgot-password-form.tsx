"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";
import { authService } from "@/services/authService";

export function ForgotPasswordForm({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: SiteMessages["authForgot"] }>) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError(labels.invalidEmail);
      return;
    }
    setBusy(true);
    setFieldError("");
    setFormError("");
    try {
      await authService.forgotPassword(email.trim(), locale);
      setSuccess(true);
    } catch (requestError) {
      setFormError(authService.getApiErrorMessage(requestError, labels.genericError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-lg sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{labels.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{labels.hint}</p>
      {success ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-success/30 bg-success-soft p-4 text-sm leading-relaxed text-success-soft-foreground"
        >
          {labels.success}
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="mt-6 space-y-4">
          <label
            htmlFor="forgot-password-email"
            className="block text-sm font-semibold text-foreground"
          >
            {labels.email}
            <input
              id="forgot-password-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldError("");
              }}
              placeholder={labels.emailPlaceholder}
              aria-invalid={Boolean(fieldError) || undefined}
              aria-describedby={fieldError ? "forgot-password-email-error" : undefined}
              className="mt-2 h-11 w-full rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          {fieldError ? (
            <p id="forgot-password-email-error" className="text-sm text-destructive">
              {fieldError}
            </p>
          ) : null}
          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          <button
            disabled={busy}
            className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
          >
            {busy ? labels.submitting : labels.submit}
          </button>
        </form>
      )}
      <Link
        href={withLocale(locale, "/auth/login")}
        className="mt-6 inline-flex text-sm font-semibold text-primary-text hover:underline"
      >
        {labels.backToLogin}
      </Link>
    </div>
  );
}
