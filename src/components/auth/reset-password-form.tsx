"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";
import { authService } from "@/services/authService";

export function ResetPasswordForm({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: SiteMessages["authReset"] }>) {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setConfirmError("");
    setFormError("");
    if (!token) return setFormError(labels.invalidToken);
    if (password.length < 12 || !/\d/.test(password)) {
      setPasswordError(labels.weakPassword);
      return;
    }
    if (password !== confirm) {
      setConfirmError(labels.mismatch);
      return;
    }
    setBusy(true);
    try {
      await authService.resetPassword(token, password, confirm);
      setSuccess(true);
    } catch {
      setFormError(labels.invalidToken);
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
          className="mt-6 rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success-soft-foreground"
        >
          {labels.success}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <PasswordField
            id="reset-password"
            label={labels.password}
            value={password}
            onChange={(value) => {
              setPassword(value);
              setPasswordError("");
            }}
            autoComplete="new-password"
            error={passwordError}
            errorId="reset-password-error"
          />
          <PasswordField
            id="reset-password-confirm"
            label={labels.confirmPassword}
            value={confirm}
            onChange={(value) => {
              setConfirm(value);
              setConfirmError("");
            }}
            autoComplete="new-password"
            error={confirmError}
            errorId="reset-password-confirm-error"
          />
          {!token || formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError || labels.invalidToken}
            </p>
          ) : null}
          <button
            disabled={busy || !token}
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

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  errorId,
}: Readonly<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error: string;
  errorId: string;
}>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-foreground">
        {label}
        <input
          id={id}
          type="password"
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-2 h-11 w-full rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
