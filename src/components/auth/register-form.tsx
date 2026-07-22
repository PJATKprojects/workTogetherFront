"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import { DateOfBirthField } from "@/components/ui/date-of-birth-field";
import { type Locale } from "@/i18n/locales";
import { isAdultBirthDate } from "@/lib/date-of-birth";
import { authService } from "@/services/authService";

export type RegisterFormLabels = Readonly<{
  backHome: string;
  title: string;
  subtitle: string;
  nickname: string;
  nicknamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  dateOfBirth: string;
  ageHint: string;
  errAge: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  termsPrefix: string;
  terms: string;
  and: string;
  privacy: string;
  acceptGuidelines: string;
  communityGuidelines: string;
  submit: string;
  submitting: string;
  success: string;
  divider: string;
  google: string;
  github: string;
  haveAccount: string;
  signIn: string;
  pwdWeak: string;
  pwdFair: string;
  pwdGood: string;
  pwdStrong: string;
  errNickname: string;
  errEmail: string;
  errPassword: string;
  errConfirm: string;
  genericError: string;
}>;

type Props = Readonly<{
  labels: RegisterFormLabels;
  localePrefix: string;
}>;

type Field = "nickname" | "email" | "dateOfBirth" | "password" | "confirm";

const inputBase =
  "h-10 w-full rounded-xl border border-input bg-surface pl-11 pr-11 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/70 transition-all duration-200 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgb(37_99_235/0.16)] sm:h-[42px] sm:text-[15px]";

const iconBase =
  "pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground/70";

export function RegisterForm({ labels, localePrefix }: Props) {
  const router = useRouter();
  const locale: Locale = localePrefix.endsWith("/uk")
    ? "uk"
    : localePrefix.endsWith("/pl")
      ? "pl"
      : "en";
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptGuidelines, setAcceptGuidelines] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    nickname: false,
    email: false,
    dateOfBirth: false,
    password: false,
    confirm: false,
  });

  const passwordScore = useMemo(() => getPasswordScore(password), [password]);

  // OAuth-provisioned accounts land on their (fresh) profile to fill in details.
  const startOAuth = (provider: "google" | "github") => {
    window.location.assign(authService.oauthStartUrl(provider, `${localePrefix}/profile`));
  };
  const passwordIsValid = useMemo(() => isPasswordValid(password), [password]);

  const errors = useMemo(() => {
    const e: Record<Field, string> = {
      nickname: "",
      email: "",
      dateOfBirth: "",
      password: "",
      confirm: "",
    };
    if (nickname.trim().length < 2) e.nickname = labels.errNickname;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = labels.errEmail;
    if (!isAdultBirthDate(dateOfBirth)) e.dateOfBirth = labels.errAge;
    if (!passwordIsValid) e.password = labels.errPassword;
    if (!confirm || confirm !== password) e.confirm = labels.errConfirm;
    return e;
  }, [confirm, dateOfBirth, email, labels, nickname, password, passwordIsValid]);

  const validMap = {
    nickname: !errors.nickname,
    email: !errors.email,
    dateOfBirth: !errors.dateOfBirth,
    password: !errors.password,
    confirm: !errors.confirm,
  };

  const formValid =
    validMap.nickname &&
    validMap.email &&
    validMap.dateOfBirth &&
    validMap.password &&
    validMap.confirm &&
    acceptGuidelines;

  const pwdStrength = getPasswordStrengthMeta(passwordScore, labels);
  const titleParts = getTitleParts(labels.title);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ nickname: true, email: true, dateOfBirth: true, password: true, confirm: true });
    if (!formValid) return;
    setSubmitError("");
    setSubmitMessage("");
    setLoading(true);
    try {
      await authService.register({
        userName: nickname.trim(),
        email: email.trim(),
        password,
        confirmPassword: confirm,
        dateOfBirth,
        locale,
        acceptCommunityGuidelines: acceptGuidelines,
      });
      setSubmitMessage(labels.success);
      router.push(
        `${localePrefix}/auth/confirm-email?registered=1&email=${encodeURIComponent(email.trim())}`
      );
    } catch (error) {
      const message = authService.getApiErrorMessage(error, labels.genericError);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-card register-fade-up glass-panel relative mx-auto w-full max-w-[560px] rounded-3xl p-4 sm:p-5 lg:p-6 min-[1800px]:max-w-[680px] min-[1800px]:p-7">
      <Link
        href={`${localePrefix}/`}
        className="absolute right-6 top-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:right-8 sm:top-8"
      >
        {labels.backHome}
      </Link>

      <h1 className="pr-28 text-[22px] font-bold leading-tight text-foreground sm:pr-32 sm:text-[28px] min-[1800px]:text-[34px]">
        {titleParts.before}
        <span className="text-primary-text">{titleParts.accent}</span>
        {titleParts.after}
      </h1>
      <p className="mt-0.5 text-[14px] text-muted-foreground sm:text-[15px] min-[1800px]:text-base">
        {labels.subtitle}
      </p>

      <form onSubmit={onSubmit} className="mt-3 space-y-2.5">
        <div className="register-fade-up-delay-4 mt-0.5 flex gap-2 max-sm:flex-col">
          <button
            type="button"
            onClick={() => startOAuth("google")}
            className="focus-ring inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted text-sm font-medium text-foreground/80 transition-all duration-200 hover:-translate-y-px hover:border-input hover:bg-muted max-sm:w-full sm:h-[42px]"
          >
            <GoogleGlyph />
            {labels.google}
          </button>
          <button
            type="button"
            onClick={() => startOAuth("github")}
            className="focus-ring inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted text-sm font-medium text-foreground/80 transition-all duration-200 hover:-translate-y-px hover:border-input hover:bg-muted max-sm:w-full sm:h-[42px]"
          >
            <GithubGlyph />
            {labels.github}
          </button>
        </div>

        <div className="register-fade-up-delay-4 relative mt-0.5 flex items-center gap-2">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold tracking-[0.05em] text-muted-foreground/80">
            {labels.divider}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <FieldWrap
          htmlFor="register-nickname"
          errorId="register-nickname-error"
          label={labels.nickname}
          error={touched.nickname ? errors.nickname : ""}
          valid={touched.nickname && validMap.nickname}
          delayMs={0}
        >
          <span className={iconBase}>
            <UserIcon />
          </span>
          <input
            id="register-nickname"
            name="userName"
            autoComplete="username"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={() => setTouched((v) => ({ ...v, nickname: true }))}
            placeholder={labels.nicknamePlaceholder}
            aria-invalid={(touched.nickname && Boolean(errors.nickname)) || undefined}
            aria-describedby={
              touched.nickname && errors.nickname ? "register-nickname-error" : undefined
            }
            className={getInputClass(
              inputBase,
              touched.nickname,
              !!errors.nickname,
              validMap.nickname
            )}
          />
        </FieldWrap>

        <DateOfBirthField
          idPrefix="register-date-of-birth"
          label={labels.dateOfBirth}
          locale={locale}
          onChange={setDateOfBirth}
          onBlur={() => setTouched((value) => ({ ...value, dateOfBirth: true }))}
          hint={!touched.dateOfBirth ? labels.ageHint : undefined}
          error={touched.dateOfBirth ? errors.dateOfBirth : ""}
          valid={touched.dateOfBirth && validMap.dateOfBirth}
          compact
          className="register-fade-up space-y-px"
        />

        <FieldWrap
          htmlFor="register-email"
          errorId="register-email-error"
          label={labels.email}
          error={touched.email ? errors.email : ""}
          valid={touched.email && validMap.email}
          delayMs={90}
        >
          <span className={iconBase}>
            <MailIcon />
          </span>
          <input
            id="register-email"
            name="email"
            value={email}
            type="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((v) => ({ ...v, email: true }))}
            placeholder={labels.emailPlaceholder}
            aria-invalid={(touched.email && Boolean(errors.email)) || undefined}
            aria-describedby={touched.email && errors.email ? "register-email-error" : undefined}
            className={getInputClass(inputBase, touched.email, !!errors.email, validMap.email)}
          />
        </FieldWrap>

        <FieldWrap
          htmlFor="register-password"
          errorId="register-password-error"
          label={labels.password}
          error={touched.password ? errors.password : ""}
          valid={false}
          delayMs={180}
        >
          <div className="relative">
            <span className={iconBase}>
              <LockIcon />
            </span>
            <input
              id="register-password"
              name="password"
              value={password}
              type={showPwd ? "text" : "password"}
              maxLength={128}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((v) => ({ ...v, password: true }))}
              placeholder={labels.passwordPlaceholder}
              aria-invalid={(touched.password && Boolean(errors.password)) || undefined}
              aria-describedby={
                touched.password && errors.password
                  ? "register-password-error"
                  : password.length > 0
                    ? "register-password-strength"
                    : undefined
              }
              className={getInputClass(
                inputBase,
                touched.password,
                !!errors.password,
                validMap.password
              )}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute inset-y-0 right-3.5 flex cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPwd ? "Hide password" : "Show password"}
              aria-controls="register-password"
              aria-pressed={showPwd}
            >
              {showPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            {touched.password && validMap.password ? (
              <span className="pointer-events-none absolute inset-y-0 right-9 flex items-center text-success">
                <CheckIcon />
              </span>
            ) : null}
          </div>
          {password.length > 0 ? (
            <PasswordMeter
              id="register-password-strength"
              score={passwordScore}
              label={pwdStrength.label}
              color={pwdStrength.color}
            />
          ) : null}
        </FieldWrap>

        <FieldWrap
          htmlFor="register-confirm-password"
          errorId="register-confirm-password-error"
          label={labels.confirmPassword}
          error={touched.confirm ? errors.confirm : ""}
          valid={touched.confirm && validMap.confirm}
          delayMs={270}
        >
          <div className="relative">
            <span className={iconBase}>
              <LockIcon />
            </span>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              value={confirm}
              type={showConfirmPwd ? "text" : "password"}
              maxLength={128}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched((v) => ({ ...v, confirm: true }))}
              placeholder={labels.confirmPasswordPlaceholder}
              aria-invalid={(touched.confirm && Boolean(errors.confirm)) || undefined}
              aria-describedby={
                touched.confirm && errors.confirm ? "register-confirm-password-error" : undefined
              }
              className={getInputClass(
                inputBase,
                touched.confirm,
                !!errors.confirm,
                validMap.confirm
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd((v) => !v)}
              className="absolute inset-y-0 right-3.5 flex cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showConfirmPwd ? "Hide confirm password" : "Show confirm password"}
              aria-controls="register-confirm-password"
              aria-pressed={showConfirmPwd}
            >
              {showConfirmPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            {touched.confirm && validMap.confirm ? (
              <span className="pointer-events-none absolute inset-y-0 right-9 flex items-center text-success">
                <CheckIcon />
              </span>
            ) : null}
          </div>
        </FieldWrap>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-surface-muted/70 p-3 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={acceptGuidelines}
            onChange={(event) => setAcceptGuidelines(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>
            {labels.acceptGuidelines}{" "}
            <Link
              href={`${localePrefix}/community-guidelines`}
              className="font-semibold text-primary-text hover:underline"
            >
              {labels.communityGuidelines}
            </Link>
            , {labels.terms.toLocaleLowerCase()} {labels.and} {labels.privacy.toLocaleLowerCase()}.
          </span>
        </label>

        <button
          disabled={!formValid || loading}
          type="submit"
          className="register-fade-up-delay-5 relative mt-0.5 inline-flex h-[44px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[14px] bg-linear-to-r from-primary to-secondary text-[14px] font-semibold text-primary-foreground transition-all duration-200 enabled:hover:-translate-y-px enabled:hover:brightness-110 enabled:hover:shadow-[0_8px_25px_rgb(37_99_235/0.35)] enabled:active:translate-y-0 enabled:active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:text-[15px]"
        >
          {loading ? (
            <Spinner />
          ) : (
            <span className="inline-flex items-center gap-1.5">
              {labels.submit}
              <span aria-hidden>→</span>
            </span>
          )}
          <span className="sr-only">{loading ? labels.submitting : labels.submit}</span>
        </button>
        {submitError ? (
          <p
            role="alert"
            className="text-center text-[11px] leading-relaxed text-destructive sm:text-xs"
          >
            {submitError}
          </p>
        ) : null}
        {submitMessage ? (
          <p className="text-center text-[11px] leading-relaxed text-success sm:text-xs">
            {submitMessage}
          </p>
        ) : null}

        <p className="register-fade-up-delay-6 mt-0.5 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          {labels.termsPrefix}{" "}
          <Link
            href={`${localePrefix}/terms`}
            className="font-medium text-primary-text hover:underline"
          >
            {labels.terms}
          </Link>{" "}
          {labels.and}{" "}
          <Link
            href={`${localePrefix}/privacy`}
            className="font-medium text-primary-text hover:underline"
          >
            {labels.privacy}
          </Link>
        </p>

        <p className="register-fade-up-delay-6 mt-1 text-center text-[13px] text-muted-foreground sm:text-sm">
          {labels.haveAccount}{" "}
          <Link
            href={`${localePrefix}/auth/login`}
            className="font-semibold text-primary-text hover:underline"
          >
            {labels.signIn}
          </Link>
        </p>
      </form>
    </div>
  );
}

function FieldWrap({
  children,
  htmlFor,
  errorId,
  label,
  error,
  valid,
  delayMs,
}: Readonly<{
  children: ReactNode;
  htmlFor: string;
  errorId: string;
  label: string;
  error: string;
  valid: boolean;
  delayMs: number;
}>) {
  return (
    <div className="register-fade-up space-y-px" style={{ animationDelay: `${delayMs}ms` }}>
      <label
        htmlFor={htmlFor}
        className="text-xs leading-none font-semibold uppercase tracking-[0.08em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {children}
        {valid ? (
          <span className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-success">
            <CheckIcon />
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-[11px] leading-tight text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function getTitleParts(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) {
    return { before: "", accent: title, after: "" };
  }
  const accent = words[words.length - 1];
  const before = `${words.slice(0, -1).join(" ")} `;
  return { before, accent, after: "" };
}

function getInputClass(base: string, touched: boolean, hasError: boolean, isValid: boolean) {
  if (!touched) return base;
  if (hasError) return `${base} border-destructive/80 shadow-[0_0_0_3px_rgb(220_38_38/0.12)]`;
  if (isValid) return `${base} border-success/75 shadow-[0_0_0_3px_rgb(5_150_105/0.12)]`;
  return base;
}

function getPasswordScore(password: string) {
  if (!password) return 0;
  let score = 1;
  if (password.length >= 12) score += 1;
  if (/\d/.test(password)) score += 1;
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

function isPasswordValid(password: string) {
  return password.length >= 12 && /\d/.test(password);
}

function getPasswordStrengthMeta(score: number, labels: RegisterFormLabels) {
  if (score <= 1) return { label: labels.pwdWeak, color: "var(--destructive)" };
  if (score === 2) return { label: labels.pwdFair, color: "var(--warning)" };
  if (score === 3) return { label: labels.pwdGood, color: "var(--primary)" };
  return { label: labels.pwdStrong, color: "var(--success)" };
}

function PasswordMeter({
  id,
  score,
  label,
  color,
}: Readonly<{ id: string; score: number; label: string; color: string }>) {
  return (
    <div id={id} className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className="h-[3px] flex-1 rounded-[2px]"
            style={{ background: n <= score ? color : "var(--border)" }}
          />
        ))}
      </div>
      <p className="mt-1 text-xs" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block size-5 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground" />
  );
}

function MailIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-10 6L2 7" />
      <rect x={2} y={5} width={20} height={14} rx={2} />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <circle cx={12} cy={7} r={4} />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V8a5 5 0 0 1 10 0v3" />
      <rect x={5} y={11} width={14} height={10} rx={2} />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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

function EyeOffIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.7 10.7a3 3 0 104.6 4.6M9.88 5.09A10.94 10.94 0 0112 5c6 0 10 7 10 7a18.24 18.24 0 01-3.29 4.36M6.61 6.61A18 18 0 002 12s4 7 10 7a9.74 9.74 0 004.22-.94M2 2l20 20"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
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

function GithubGlyph() {
  return (
    <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
