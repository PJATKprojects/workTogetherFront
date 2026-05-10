"use client";

import Link from "next/link";
import { useId, useState } from "react";

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
  oauthSoon: string;
  noAccount: string;
  signUpCta: string;
}>;

type Props = Readonly<{
  labels: LoginFormLabels;
  localePrefix: string;
  /** Tighter spacing for viewport-constrained layouts (e.g. login split screen). */
  compact?: boolean;
}>;

const inputShell =
  "w-full rounded-xl border border-zinc-200/90 bg-white text-zinc-900 shadow-inner outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 focus-visible:border-indigo-500 focus-visible:shadow-[0_0_0_3px_rgb(99_102_241/0.22)] dark:border-white/[0.08] dark:bg-zinc-950/55 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:border-teal-400/90 dark:focus-visible:shadow-[0_0_0_3px_rgb(45_212_191/0.18)]";

const labelCls =
  "text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400";

export function LoginForm({ labels, localePrefix, compact = false }: Props) {
  const [visible, setVisible] = useState(false);
  const emailId = useId();
  const passwordId = useId();

  const h = compact ? "h-10 text-sm" : "h-12 text-base";
  const pxIcon = compact ? "pl-9" : "pl-10";

  return (
    <form
      action="#"
      method="post"
      className={`flex w-full flex-col ${compact ? "gap-4" : "gap-6"}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"}`}>
        <label htmlFor={emailId} className={labelCls}>
          {labels.emailLabel}
        </label>
        <div className="group relative">
          <span
            className={`pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500 dark:left-3 dark:text-zinc-500 dark:group-focus-within:text-teal-400 ${compact ? "scale-90" : ""}`}
          >
            <MailIcon compact={compact} />
          </span>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
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
            className={`pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500 dark:left-3 dark:text-zinc-500 dark:group-focus-within:text-teal-400 ${compact ? "scale-90" : ""}`}
          >
            <LockIcon compact={compact} />
          </span>
          <input
            id={passwordId}
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder={labels.passwordPlaceholder}
            className={`${inputShell} ${h} ${pxIcon} ${compact ? "pr-10" : "pr-12"}`}
          />
          <button
            type="button"
            aria-pressed={visible}
            aria-label={visible ? labels.hidePassword : labels.showPassword}
            title={visible ? labels.hidePassword : labels.showPassword}
            onClick={() => setVisible((v) => !v)}
            className={`absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 outline-none transition hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100 dark:focus-visible:ring-teal-400/35 ${
              compact ? "size-8" : "size-10"
            }`}
          >
            {visible ? <EyeOffIcon compact={compact} /> : <EyeIcon compact={compact} />}
          </button>
        </div>
        <div className="text-right">
          <Link
            href={`${localePrefix}/auth/forgot-password`}
            className={`font-medium text-zinc-500 underline-offset-2 transition-colors hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {labels.forgotPassword}
          </Link>
        </div>
      </div>

      <button
        type="submit"
        className={`rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 font-semibold text-white shadow-[0_20px_60px_-20px_rgb(99_102_241/0.58)] transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-px hover:brightness-[1.04] motion-reduce:hover:translate-y-0 active:translate-y-0 sm:hover:shadow-[0_22px_64px_-18px_rgb(99_102_241/0.62)] ${
          compact ? "h-10 text-sm" : "h-12 text-base"
        }`}
      >
        {labels.submit}
      </button>

      <div className={`relative flex items-center ${compact ? "gap-2 py-0" : "gap-4 py-1"}`}>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700/80" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:text-[11px]">
          {labels.divider}
        </span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700/80" />
      </div>

      <div className={`grid grid-cols-2 ${compact ? "gap-2" : "gap-3"}`}>
        <button
          type="button"
          disabled
          title={labels.oauthSoon}
          className={`flex items-center justify-center gap-2 rounded-xl border border-zinc-200/75 bg-zinc-950/[0.035] font-semibold text-zinc-700 transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-zinc-950/[0.065] disabled:cursor-not-allowed disabled:hover:translate-y-0 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06] motion-reduce:hover:translate-y-0 ${
            compact ? "h-9 text-xs" : "h-11 text-sm"
          }`}
        >
          <GoogleGlyph compact={compact} />
          {labels.google}
        </button>
        <button
          type="button"
          disabled
          title={labels.oauthSoon}
          className={`flex items-center justify-center gap-2 rounded-xl border border-zinc-200/75 bg-zinc-950/[0.035] font-semibold text-zinc-700 transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-zinc-950/[0.065] disabled:cursor-not-allowed disabled:hover:translate-y-0 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06] motion-reduce:hover:translate-y-0 ${
            compact ? "h-9 text-xs" : "h-11 text-sm"
          }`}
        >
          <GithubGlyph compact={compact} />
          {labels.github}
        </button>
      </div>

      <p
        className={`text-center text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
      >
        {labels.noAccount}{" "}
        <Link
          href={`${localePrefix}/auth/register`}
          className="font-semibold text-teal-600 underline-offset-2 transition-colors hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300"
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
      className={`${compact ? "size-4" : "size-5"} text-zinc-900 dark:text-white`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
