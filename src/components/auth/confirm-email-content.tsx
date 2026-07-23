"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

export function ConfirmEmailContent({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: SiteMessages["authConfirm"] }>) {
  const params = useSearchParams();
  const token = params.get("token");
  const registered = params.get("registered") === "1";
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [state, setState] = useState<"ready" | "confirming" | "success" | "error">(
    registered ? "success" : token ? "ready" : "error"
  );
  const [message, setMessage] = useState(
    registered ? labels.registered : token ? labels.ready : labels.missing
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const confirm = async () => {
    if (!token || state === "confirming") return;
    setState("confirming");
    setMessage(labels.confirming);
    try {
      const response = await userService.confirmEmail(token);
      setState("success");
      setMessage(response.message || labels.success);
    } catch {
      setState("error");
      setMessage(labels.invalid);
    }
  };

  const resend = async () => {
    if (!email.trim() || cooldown > 0) return;
    setResending(true);
    try {
      await authService.resendConfirmation(email.trim(), locale);
      setResent(true);
      setCooldown(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-12 text-center"
    >
      <div className="w-full rounded-3xl border border-border bg-surface/80 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">{labels.title}</h1>
        <p
          role={state === "error" ? "alert" : "status"}
          aria-live={state === "error" ? "assertive" : "polite"}
          className={`mt-4 text-sm ${state === "error" ? "text-destructive" : "text-muted-foreground"}`}
        >
          {message}
        </p>
        {registered || resent ? (
          <aside className="mx-auto mt-4 max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-sm leading-6 text-amber-900 dark:text-amber-100">
            <p className="flex gap-2">
              <span aria-hidden className="mt-0.5 shrink-0">
                ✉
              </span>
              <span>{labels.spamHint}</span>
            </p>
          </aside>
        ) : null}
        {token && (state === "ready" || state === "confirming") ? (
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={state === "confirming"}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-linear-to-r from-primary to-secondary px-5 text-center text-sm font-semibold leading-snug text-primary-foreground disabled:opacity-50"
          >
            {state === "confirming" ? labels.confirming : labels.confirm}
          </button>
        ) : null}
        {registered || state === "error" ? (
          <div className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={labels.emailPlaceholder}
              className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => void resend()}
              disabled={resending || cooldown > 0 || !email.trim()}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-center text-sm font-semibold leading-snug disabled:opacity-50"
            >
              {resending
                ? labels.resending
                : cooldown > 0
                  ? `${labels.resend} (${cooldown})`
                  : labels.resend}
            </button>
          </div>
        ) : null}
        {resent ? (
          <p role="status" className="mt-3 text-sm text-success">
            {labels.resent}
          </p>
        ) : null}
        <Link
          href={withLocale(locale, "/auth/login")}
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-linear-to-r from-primary to-secondary px-4 text-center text-sm font-semibold leading-snug text-primary-foreground"
        >
          {labels.login}
        </Link>
      </div>
    </main>
  );
}
