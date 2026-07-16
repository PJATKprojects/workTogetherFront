"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/authService";

export type LoginFormLabels = Readonly<{
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  forgotPassword: string;
  submit: string;
  divider: string;
  google: string;
  github: string;
  noAccount: string;
  signUpCta: string;
  submitting: string;
  invalidCredentials: string;
  genericError: string;
}>;

type Props = Readonly<{
  labels: LoginFormLabels;
  localePrefix: string;
  /** Tighter spacing for viewport-constrained layouts (e.g. login split screen). */
  compact?: boolean;
  returnUrl?: string;
}>;

const inputShell =
  "w-full rounded-xl border border-input bg-surface text-foreground shadow-[var(--shadow-sm)] outline-none transition-[border-color,box-shadow,background-color,transform] duration-300 placeholder:text-muted-foreground/70 hover:border-primary/40 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgb(37_99_235/0.16),0_14px_28px_-18px_rgb(37_99_235/0.3)]";

const labelCls = "text-[0.76rem] font-medium tracking-tight text-muted-foreground";

export function LoginForm({ labels, localePrefix, compact = false, returnUrl }: Props) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const { login } = useAuth();
  const emailId = useId();
  const passwordId = useId();

  const h = compact ? "h-11 text-sm" : "h-12 text-base";
  const pxIcon = compact ? "pl-9" : "pl-10";

  const startOAuth = (provider: "google" | "github") => {
    window.location.assign(authService.oauthStartUrl(provider, returnUrl || `${localePrefix}/`));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push(returnUrl || `${localePrefix}/`);
      router.refresh();
    } catch (error) {
      const message = authService.getApiErrorMessage(error, labels.genericError);
      const normalized = message.toLowerCase();
      if (normalized.includes("invalid") || normalized.includes("credential")) {
        setSubmitError(labels.invalidCredentials);
      } else {
        setSubmitError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      action="#"
      method="post"
      className={`flex w-full flex-col ${compact ? "gap-4" : "gap-6"}`}
      onSubmit={onSubmit}
    >
      <div className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"}`}>
        <label htmlFor={emailId} className={labelCls}>
          {labels.emailLabel}
        </label>
        <div className="group relative">
          <span
            className={`pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary-text dark:left-3 ${compact ? "scale-90" : ""}`}
          >
            <MailIcon compact={compact} />
          </span>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailPlaceholder}
            className={`${inputShell} ${h} ${pxIcon} ${compact ? "pr-3" : "pr-4"}`}
          />
        </div>
      </div>

      <div className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"}`}>
        <label htmlFor={passwordId} className={labelCls}>
          {labels.passwordLabel}
        </label>
        <div className="group relative">
          <span
            className={`pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary-text dark:left-3 ${compact ? "scale-90" : ""}`}
          >
            <LockIcon compact={compact} />
          </span>
          <input
            id={passwordId}
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={labels.passwordPlaceholder}
            className={`${inputShell} ${h} ${pxIcon} ${compact ? "pr-10" : "pr-12"}`}
          />
          <button
            type="button"
            aria-pressed={visible}
            aria-label={visible ? labels.hidePassword : labels.showPassword}
            title={visible ? labels.hidePassword : labels.showPassword}
            onClick={() => setVisible((v) => !v)}
            className={`absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center cursor-pointer rounded-lg text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40 ${
              compact ? "size-8" : "size-10"
            }`}
          >
            {visible ? <EyeOffIcon compact={compact} /> : <EyeIcon compact={compact} />}
          </button>
        </div>
        <div className="text-right">
          <Link
            href={`${localePrefix}/auth/forgot-password`}
            className={`font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary-text ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {labels.forgotPassword}
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`cursor-pointer rounded-xl bg-linear-to-r from-primary to-secondary px-4 font-semibold text-primary-foreground shadow-[0_18px_44px_-18px_rgb(37_99_235/0.6)] transition-[transform,filter,box-shadow] duration-200 hover:scale-[1.01] hover:brightness-110 hover:shadow-[0_20px_48px_-14px_rgb(37_99_235/0.7)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(37_99_235/0.25),0_20px_48px_-14px_rgb(37_99_235/0.7)] motion-reduce:hover:scale-100 active:scale-100 disabled:cursor-not-allowed disabled:opacity-70 ${
          compact ? "h-10 text-sm" : "h-12 text-base"
        }`}
      >
        {loading ? labels.submitting : labels.submit}
      </button>
      {submitError ? (
        <p role="alert" className={`text-destructive ${compact ? "text-xs" : "text-sm"}`}>
          {submitError}
        </p>
      ) : null}

      <div className={`relative flex items-center ${compact ? "gap-2 py-0" : "gap-4 py-1"}`}>
        <span className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 sm:text-[11px]">
          {labels.divider}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className={`grid grid-cols-2 ${compact ? "gap-2" : "gap-3"}`}>
        <button
          type="button"
          onClick={() => startOAuth("google")}
          className={`focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted font-semibold text-foreground/80 transition-[transform,background-color,border-color] duration-200 hover:-translate-y-px hover:border-input hover:bg-muted motion-reduce:hover:translate-y-0 ${
            compact ? "h-9 text-xs" : "h-11 text-sm"
          }`}
        >
          <GoogleGlyph compact={compact} />
          {labels.google}
        </button>
        <button
          type="button"
          onClick={() => startOAuth("github")}
          className={`focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted font-semibold text-foreground/80 transition-[transform,background-color,border-color] duration-200 hover:-translate-y-px hover:border-input hover:bg-muted motion-reduce:hover:translate-y-0 ${
            compact ? "h-9 text-xs" : "h-11 text-sm"
          }`}
        >
          <GithubGlyph compact={compact} />
          {labels.github}
        </button>
      </div>

      <p className={`text-center text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
        {labels.noAccount}{" "}
        <Link
          href={`${localePrefix}/auth/register`}
          className="font-semibold text-primary-text underline-offset-2 transition-colors hover:underline"
        >
          {labels.signUpCta}
        </Link>
      </p>
    </form>
  );
}

function MailIcon({ compact = false }: Readonly<{ compact?: boolean }>) {
  const s = compact ? "size-[17px]" : "size-[18px]";
  return (
    <svg
      className={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7m20 0v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7m20 0-10 6L2 7"
      />
    </svg>
  );
}

function LockIcon({ compact = false }: Readonly<{ compact?: boolean }>) {
  const s = compact ? "size-[17px]" : "size-[18px]";
  return (
    <svg
      className={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V8a5 5 0 0 1 10 0v3" />
      <rect x={5} y={11} width={14} height={10} rx={2} ry={2} />
      <path strokeLinecap="round" d="M12 15v2" />
    </svg>
  );
}

function GoogleGlyph({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <svg className={compact ? "size-4" : "size-5"} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function EyeIcon({ compact = false }: Readonly<{ compact?: boolean }>) {
  const s = compact ? "size-[18px]" : "size-5";
  return (
    <svg
      className={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"
      />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

function EyeOffIcon({ compact = false }: Readonly<{ compact?: boolean }>) {
  const s = compact ? "size-[18px]" : "size-5";
  return (
    <svg
      className={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.7 10.7a3 3 0 104.6 4.6M9.88 5.09A10.94 10.94 0 0112 5c6 0 10 7 10 7a18.24 18.24 0 01-3.29 4.36M6.61 6.61A18 18 0 002 12s4 7 10 7a9.74 9.74 0 004.22-.94M2 2l20 20"
      />
    </svg>
  );
}

function GithubGlyph({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <svg
      className={`${compact ? "size-4" : "size-5"} text-foreground`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
