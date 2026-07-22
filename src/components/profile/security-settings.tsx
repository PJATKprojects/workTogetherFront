"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatDateTime } from "@/lib/format";
import type { SiteMessages } from "@/messages/types";
import { authService, type AuthSessionDto, type LoginMethodsDto } from "@/services/authService";
import {
  securityService,
  type MfaStatusDto,
  type TotpEnrollmentDto,
} from "@/services/securityService";

export function SecuritySettings({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: SiteMessages["security"] }>) {
  const { logout } = useAuth();
  const reauthCopy = {
    en: {
      confirmed: "Identity confirmed for 20 minutes.",
      title: "Confirm sensitive changes",
      password: "Enter your password before linking or disconnecting a sign-in method.",
      oauth:
        "This is an OAuth-only account. After 20 minutes, sign out and sign in again with a connected provider, or add a password below.",
      action: "Confirm identity",
    },
    uk: {
      confirmed: "Особу підтверджено на 20 хвилин.",
      title: "Повторне підтвердження",
      password: "Введіть пароль перед підключенням або відключенням способу входу.",
      oauth:
        "У вас OAuth-only акаунт. Через 20 хвилин вийдіть і знову увійдіть через підключеного провайдера або додайте пароль нижче.",
      action: "Підтвердити",
    },
    pl: {
      confirmed: "Tożsamość potwierdzona na 20 minut.",
      title: "Potwierdź wrażliwe zmiany",
      password: "Wpisz hasło przed połączeniem lub odłączeniem sposobu logowania.",
      oauth:
        "To konto korzysta wyłącznie z OAuth. Po 20 minutach wyloguj się i zaloguj ponownie przez połączonego dostawcę albo dodaj hasło poniżej.",
      action: "Potwierdź tożsamość",
    },
  }[locale];
  const [sessions, setSessions] = useState<AuthSessionDto[]>([]);
  const [methods, setMethods] = useState<LoginMethodsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthMessage, setReauthMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [activeSessions, loginMethods] = await Promise.all([
        authService.sessions(),
        authService.loginMethods(),
      ]);
      setSessions(activeSessions);
      setMethods(loginMethods);
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, labels.loadError));
    } finally {
      setLoading(false);
    }
  }, [labels.loadError]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const connect = async (provider: "google" | "github") => {
    setBusy(`connect-${provider}`);
    setError("");
    try {
      const url = await authService.oauthLinkStartUrl(
        provider,
        withLocale(locale, "/profile/security")
      );
      window.location.assign(url);
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, labels.genericError));
      setBusy("");
    }
  };

  const disconnect = async (provider: "google" | "github") => {
    setBusy(`disconnect-${provider}`);
    setError("");
    try {
      await authService.disconnectLoginMethod(provider);
      await load();
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, labels.genericError));
    } finally {
      setBusy("");
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage("");
    setError("");
    setPasswordErrors({});
    if (newPassword.length < 12 || !/\d/.test(newPassword)) {
      setPasswordErrors({ newPassword: labels.weakPassword });
      window.requestAnimationFrame(() => document.getElementById("security-new-password")?.focus());
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: labels.mismatch });
      window.requestAnimationFrame(() =>
        document.getElementById("security-confirm-password")?.focus()
      );
      return;
    }
    setBusy("password");
    try {
      await authService.setPassword(
        newPassword,
        confirmPassword,
        methods?.hasPassword ? currentPassword : undefined
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage(labels.passwordSaved);
      await load();
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, labels.genericError));
    } finally {
      setBusy("");
    }
  };

  const reauthenticate = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("reauth");
    setError("");
    setReauthMessage("");
    try {
      await authService.reauthenticate(reauthPassword);
      setReauthPassword("");
      setReauthMessage(reauthCopy.confirmed);
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, labels.genericError));
    } finally {
      setBusy("");
    }
  };

  const revoke = async (session: AuthSessionDto) => {
    setBusy(`session-${session.id}`);
    try {
      await authService.revokeSession(session.id);
      if (session.isCurrent) {
        await logout(withLocale(locale, "/"));
      } else {
        await load();
      }
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, labels.genericError));
    } finally {
      setBusy("");
    }
  };

  const revokeAll = async (keepCurrent: boolean) => {
    setBusy(keepCurrent ? "others" : "all");
    try {
      await authService.revokeAllSessions(keepCurrent);
      if (keepCurrent) await load();
      else {
        await logout(withLocale(locale, "/"));
      }
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, labels.genericError));
    } finally {
      setBusy("");
    }
  };

  if (loading) return <p className="py-12 text-sm text-muted-foreground">{labels.loading}</p>;

  const connected = new Map(
    methods?.methods
      .filter((method) => method.type === "oauth" && method.provider)
      .map((method) => [method.provider!, method]) ?? []
  );

  return (
    <div className="space-y-8">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">{labels.loginMethods}</h2>
        <div className="mt-4 space-y-3">
          <MethodRow
            name={labels.password}
            detail={methods?.hasPassword ? labels.connected : labels.passwordHint}
            actionLabel={methods?.hasPassword ? undefined : labels.addPassword}
          />
          {(["google", "github"] as const).map((provider) => {
            const method = connected.get(provider);
            return (
              <MethodRow
                key={provider}
                name={provider === "google" ? "Google" : "GitHub"}
                detail={
                  method?.connectedAt
                    ? replaceDate(labels.connectedOn, formatDateTime(method.connectedAt, locale))
                    : undefined
                }
                actionLabel={method ? labels.disconnect : labels.connect}
                disabled={Boolean(method && !method.canDisconnect) || busy.length > 0}
                disabledHint={method && !method.canDisconnect ? labels.cannotDisconnect : undefined}
                onAction={() => void (method ? disconnect(provider) : connect(provider))}
              />
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-muted p-4">
          <h3 className="font-semibold">{reauthCopy.title}</h3>
          <p id="security-reauth-help" className="mt-1 text-xs leading-5 text-muted-foreground">
            {methods?.hasPassword ? reauthCopy.password : reauthCopy.oauth}
          </p>
          {methods?.hasPassword ? (
            <form onSubmit={reauthenticate} className="mt-3 flex flex-wrap gap-2">
              <label htmlFor="security-reauth-password" className="sr-only">
                {reauthCopy.password}
              </label>
              <input
                id="security-reauth-password"
                type="password"
                autoComplete="current-password"
                required
                aria-describedby="security-reauth-help"
                value={reauthPassword}
                onChange={(event) => setReauthPassword(event.target.value)}
                className="h-10 min-w-56 flex-1 rounded-lg border border-input bg-surface px-3 text-sm"
              />
              <button
                disabled={busy.length > 0}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {reauthCopy.action}
              </button>
            </form>
          ) : null}
          {reauthMessage ? (
            <p role="status" className="mt-2 text-sm text-success">
              {reauthMessage}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={savePassword}
          className="mt-6 grid gap-3 rounded-xl bg-surface-muted p-4 sm:grid-cols-2"
        >
          <h3 className="sm:col-span-2 font-semibold">
            {methods?.hasPassword ? labels.changePassword : labels.addPassword}
          </h3>
          {methods?.hasPassword ? (
            <PasswordInput
              id="security-current-password"
              label={labels.currentPassword}
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
          ) : null}
          <PasswordInput
            id="security-new-password"
            label={labels.newPassword}
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              setPasswordErrors((current) => ({ ...current, newPassword: undefined }));
            }}
            error={passwordErrors.newPassword}
          />
          <PasswordInput
            id="security-confirm-password"
            label={labels.confirmPassword}
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              setPasswordErrors((current) => ({ ...current, confirmPassword: undefined }));
            }}
            error={passwordErrors.confirmPassword}
          />
          <p className="text-xs text-muted-foreground sm:col-span-2">{labels.passwordHint}</p>
          {passwordMessage ? (
            <p role="status" className="text-sm text-success sm:col-span-2">
              {passwordMessage}
            </p>
          ) : null}
          <button
            disabled={busy.length > 0}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-fit"
          >
            {labels.savePassword}
          </button>
        </form>
      </section>

      <MfaSettings locale={locale} fallbackError={labels.genericError} />

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{labels.sessions}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void revokeAll(true)}
              disabled={busy.length > 0 || sessions.length < 2}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {labels.signOutOthers}
            </button>
            <button
              onClick={() => void revokeAll(false)}
              disabled={busy.length > 0}
              className="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-50"
            >
              {labels.signOutAll}
            </button>
          </div>
        </div>
        <div className="mt-4 divide-y divide-border">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{session.deviceName}</p>
                  {session.isCurrent ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-text">
                      {labels.currentSession}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {session.region || labels.unknownRegion} · {session.ipAddress} ·{" "}
                  {session.authMethod}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {replaceDate(labels.lastSeen, formatDateTime(session.lastSeenAt, locale))} ·{" "}
                  {replaceDate(labels.expires, formatDateTime(session.expiresAt, locale))}
                </p>
              </div>
              <button
                onClick={() => void revoke(session)}
                disabled={busy.length > 0}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-50"
              >
                {labels.signOut}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MfaSettings({
  locale,
  fallbackError,
}: Readonly<{ locale: Locale; fallbackError: string }>) {
  const copy = getSecurityCopy(locale);
  const [status, setStatus] = useState<MfaStatusDto | null>(null);
  const [enrollment, setEnrollment] = useState<TotpEnrollmentDto | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [passkeyName, setPasskeyName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passkeyNameError, setPasskeyNameError] = useState("");
  const passkeyNameRef = useRef<HTMLInputElement>(null);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await securityService.status());
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, fallbackError));
    }
  }, [fallbackError]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadStatus(), 0);
    return () => window.clearTimeout(timer);
  }, [loadStatus]);

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (requestError) {
      setError(authService.getApiErrorMessage(requestError, fallbackError));
    } finally {
      setBusy("");
    }
  };

  const addPasskey = () => {
    setPasskeyNameError("");
    return run("add-passkey", async () => {
      if (!passkeyName.trim()) {
        setPasskeyNameError(copy.passkeyNameRequired);
        window.requestAnimationFrame(() => passkeyNameRef.current?.focus());
        return;
      }
      await securityService.registerPasskey(passkeyName.trim());
      setPasskeyName("");
      setMessage(copy.passkeyAdded);
      await loadStatus();
    });
  };

  const startTotp = () =>
    run("totp-start", async () => {
      setEnrollment(await securityService.startTotpEnrollment());
      setRecoveryCodes([]);
    });

  const finishTotp = () =>
    run("totp-finish", async () => {
      if (!enrollment) return;
      const result = await securityService.finishTotpEnrollment(enrollment.flowId, code);
      setRecoveryCodes(result.recoveryCodes);
      setEnrollment(null);
      setCode("");
      setMessage(copy.totpEnabled);
      await loadStatus();
    });

  const verifyTotp = () =>
    run("verify", async () => {
      await securityService.verifyTotp(code);
      setCode("");
      setMessage(copy.verified);
      await loadStatus();
    });

  const verifyPasskey = () =>
    run("verify-passkey", async () => {
      await securityService.stepUpWithPasskey();
      setMessage(copy.verified);
      await loadStatus();
    });

  const deletePasskey = (id: number) =>
    run(`delete-${id}`, async () => {
      await securityService.deletePasskey(id);
      setMessage(copy.passkeyRemoved);
      await loadStatus();
    });

  const regenerateCodes = () =>
    run("recovery", async () => {
      const result = await securityService.regenerateRecoveryCodes();
      setRecoveryCodes(result.recoveryCodes);
      await loadStatus();
    });

  const disableTotp = () =>
    run("disable-totp", async () => {
      await securityService.disableTotp();
      setMessage(copy.totpDisabled);
      setRecoveryCodes([]);
      await loadStatus();
    });

  const copyRecoveryCodes = () =>
    run("copy-codes", async () => {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));
      setMessage(copy.codesCopied);
    });

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{copy.title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>
        {status?.verifiedAt ? (
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            {copy.verifiedUntil.replace("{time}", formatDateTime(status.verifiedAt, locale))}
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <h3 className="font-semibold">{copy.passkeys}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.passkeyHint}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label
              htmlFor="security-passkey-name"
              className="flex-1 text-xs font-semibold text-muted-foreground"
            >
              {copy.passkeyName}
              <input
                ref={passkeyNameRef}
                id="security-passkey-name"
                value={passkeyName}
                maxLength={80}
                aria-invalid={Boolean(passkeyNameError)}
                aria-describedby={passkeyNameError ? "security-passkey-name-error" : undefined}
                onChange={(event) => {
                  setPasskeyName(event.target.value);
                  setPasskeyNameError("");
                }}
                placeholder={copy.passkeyPlaceholder}
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground"
              />
              {passkeyNameError ? (
                <span
                  id="security-passkey-name-error"
                  role="alert"
                  className="mt-1.5 block text-xs font-medium text-destructive"
                >
                  {passkeyNameError}
                </span>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => void addPasskey()}
              disabled={Boolean(busy) || !securityService.isPasskeySupported()}
              className="mt-auto h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {copy.addPasskey}
            </button>
          </div>
          {!securityService.isPasskeySupported() ? (
            <p className="mt-2 text-xs text-warning">{copy.passkeyUnavailable}</p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {status?.passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex flex-col justify-between gap-2 rounded-lg bg-surface-muted p-3 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold">{passkey.displayName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {copy.added.replace("{date}", formatDateTime(passkey.createdAt, locale))}
                    {passkey.isBackedUp ? ` · ${copy.synced}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void deletePasskey(passkey.id)}
                  disabled={Boolean(busy)}
                  className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-50"
                >
                  {copy.remove}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border p-4">
          <h3 className="font-semibold">{copy.authenticator}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.authenticatorHint}</p>
          {status?.totpEnabled ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                {copy.enabled}
              </span>
              <span className="text-xs text-muted-foreground">
                {copy.codesRemaining.replace("{count}", String(status.recoveryCodesRemaining))}
              </span>
              <button
                type="button"
                onClick={() => void regenerateCodes()}
                disabled={Boolean(busy)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {copy.newCodes}
              </button>
              <button
                type="button"
                onClick={() => void disableTotp()}
                disabled={Boolean(busy)}
                className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-50"
              >
                {copy.disable}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void startTotp()}
              disabled={Boolean(busy)}
              className="mt-3 rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {copy.setUp}
            </button>
          )}

          {enrollment ? (
            <div className="mt-4 rounded-lg bg-surface-muted p-3">
              <p className="text-sm font-semibold">{copy.enrollmentTitle}</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs leading-5 text-muted-foreground">
                <li>
                  <a href={enrollment.otpAuthUri} className="font-semibold text-primary-text">
                    {copy.openAuthenticator}
                  </a>
                </li>
                <li>
                  {copy.enterSecret}{" "}
                  <code className="break-all rounded bg-surface px-1.5 py-1 text-foreground">
                    {enrollment.secret}
                  </code>
                </li>
                <li>{copy.enterCode}</li>
              </ol>
              <div className="mt-3 flex gap-2">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label={copy.code}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-surface px-3 text-sm tracking-[0.25em]"
                />
                <button
                  type="button"
                  onClick={() => void finishTotp()}
                  disabled={Boolean(busy) || code.length !== 6}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {copy.confirm}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {(status?.totpEnabled || status?.hasPasskeys) && !enrollment ? (
        <div className="mt-5 rounded-xl border border-border bg-surface-muted p-4">
          <h3 className="font-semibold">{copy.stepUp}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.stepUpHint}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {status.totpEnabled ? (
              <>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.slice(0, 64))}
                  autoComplete="one-time-code"
                  aria-label={copy.codeOrRecovery}
                  placeholder={copy.codeOrRecovery}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-surface px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void verifyTotp()}
                  disabled={Boolean(busy) || code.length < 6}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {copy.verify}
                </button>
              </>
            ) : null}
            {status.hasPasskeys ? (
              <button
                type="button"
                onClick={() => void verifyPasskey()}
                disabled={Boolean(busy)}
                className="rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary-text disabled:opacity-50"
              >
                {copy.verifyPasskey}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {recoveryCodes.length > 0 ? (
        <div className="mt-5 rounded-xl border border-warning/35 bg-warning/10 p-4">
          <h3 className="font-semibold">{copy.saveCodes}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.saveCodesHint}</p>
          <ul className="mt-3 grid gap-2 font-mono text-sm sm:grid-cols-2">
            {recoveryCodes.map((recoveryCode) => (
              <li key={recoveryCode} className="rounded bg-surface px-3 py-2">
                {recoveryCode}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => void copyRecoveryCodes()}
            disabled={Boolean(busy)}
            className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold disabled:opacity-50"
          >
            {copy.copyCodes}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function getSecurityCopy(locale: Locale) {
  if (locale === "uk") {
    return {
      title: "Ключі доступу та MFA",
      description:
        "Додайте захищений від фішингу ключ доступу або застосунок-автентифікатор. Для адміністративних і критичних дій власника підтвердження діє 15 хвилин.",
      verifiedUntil: "Особу підтверджено: {time}",
      passkeys: "Ключі доступу",
      passkeyHint: "Використовуйте Touch ID, Face ID, Windows Hello або апаратний ключ.",
      passkeyName: "Назва пристрою",
      passkeyPlaceholder: "Наприклад, MacBook",
      addPasskey: "Додати ключ",
      passkeyNameRequired: "Вкажіть зрозумілу назву пристрою.",
      passkeyAdded: "Ключ доступу додано.",
      passkeyRemoved: "Ключ доступу видалено.",
      passkeyUnavailable: "Цей браузер або з’єднання не підтримує ключі доступу.",
      added: "Додано {date}",
      synced: "синхронізовано",
      remove: "Видалити",
      authenticator: "Застосунок-автентифікатор",
      authenticatorHint:
        "Працює з 1Password, Google Authenticator, Microsoft Authenticator та іншими TOTP-застосунками.",
      enabled: "Увімкнено",
      codesRemaining: "Резервних кодів: {count}",
      newCodes: "Нові коди",
      disable: "Вимкнути",
      setUp: "Налаштувати",
      enrollmentTitle: "Підключення застосунку",
      openAuthenticator: "Відкрити в застосунку-автентифікаторі",
      enterSecret: "Або введіть секрет вручну:",
      enterCode: "Введіть шестизначний код із застосунку.",
      code: "Шестизначний код",
      confirm: "Підтвердити",
      totpEnabled: "Застосунок-автентифікатор увімкнено.",
      totpDisabled: "Застосунок-автентифікатор вимкнено.",
      stepUp: "Підтвердити критичну дію",
      stepUpHint:
        "Підтвердження потрібне перед рішенням щодо заявки, видаленням проєкту, зміною команди або роботою в admin.",
      codeOrRecovery: "Код або резервний код",
      verify: "Підтвердити",
      verifyPasskey: "Підтвердити ключем",
      verified: "Особу підтверджено на 15 хвилин.",
      saveCodes: "Збережіть резервні коди зараз",
      saveCodesHint: "Кожен код одноразовий. Після закриття цього блоку ми їх більше не покажемо.",
      copyCodes: "Копіювати коди",
      codesCopied: "Резервні коди скопійовано.",
    };
  }
  if (locale === "pl") {
    return {
      title: "Klucze dostępu i MFA",
      description:
        "Dodaj odporny na phishing klucz dostępu lub aplikację uwierzytelniającą. Potwierdzenie działa przez 15 minut dla działań administratora i krytycznych działań właściciela.",
      verifiedUntil: "Tożsamość potwierdzona: {time}",
      passkeys: "Klucze dostępu",
      passkeyHint: "Użyj Touch ID, Face ID, Windows Hello lub klucza sprzętowego.",
      passkeyName: "Nazwa urządzenia",
      passkeyPlaceholder: "Na przykład MacBook",
      addPasskey: "Dodaj klucz",
      passkeyNameRequired: "Podaj rozpoznawalną nazwę urządzenia.",
      passkeyAdded: "Klucz dostępu został dodany.",
      passkeyRemoved: "Klucz dostępu został usunięty.",
      passkeyUnavailable: "Ta przeglądarka lub połączenie nie obsługuje kluczy dostępu.",
      added: "Dodano {date}",
      synced: "zsynchronizowany",
      remove: "Usuń",
      authenticator: "Aplikacja uwierzytelniająca",
      authenticatorHint:
        "Działa z 1Password, Google Authenticator, Microsoft Authenticator i innymi aplikacjami TOTP.",
      enabled: "Włączona",
      codesRemaining: "Pozostałe kody zapasowe: {count}",
      newCodes: "Nowe kody",
      disable: "Wyłącz",
      setUp: "Skonfiguruj",
      enrollmentTitle: "Połącz aplikację",
      openAuthenticator: "Otwórz w aplikacji uwierzytelniającej",
      enterSecret: "Lub wpisz sekret ręcznie:",
      enterCode: "Wpisz sześciocyfrowy kod z aplikacji.",
      code: "Kod sześciocyfrowy",
      confirm: "Potwierdź",
      totpEnabled: "Aplikacja uwierzytelniająca została włączona.",
      totpDisabled: "Aplikacja uwierzytelniająca została wyłączona.",
      stepUp: "Potwierdź działanie wrażliwe",
      stepUpHint:
        "Potwierdzenie jest wymagane przed decyzją o zgłoszeniu, usunięciem projektu, zmianą zespołu lub pracą w panelu admina.",
      codeOrRecovery: "Kod lub kod zapasowy",
      verify: "Potwierdź",
      verifyPasskey: "Potwierdź kluczem",
      verified: "Tożsamość potwierdzona na 15 minut.",
      saveCodes: "Zapisz teraz kody zapasowe",
      saveCodesHint:
        "Każdy kod jest jednorazowy. Po zamknięciu tej sekcji nie pokażemy ich ponownie.",
      copyCodes: "Kopiuj kody",
      codesCopied: "Skopiowano kody zapasowe.",
    };
  }
  return {
    title: "Passkeys and MFA",
    description:
      "Add a phishing-resistant passkey or authenticator app. Verification lasts 15 minutes for admin and owner-sensitive actions.",
    verifiedUntil: "Identity verified: {time}",
    passkeys: "Passkeys",
    passkeyHint: "Use Touch ID, Face ID, Windows Hello, or a hardware security key.",
    passkeyName: "Device name",
    passkeyPlaceholder: "For example, MacBook",
    addPasskey: "Add passkey",
    passkeyNameRequired: "Enter a recognizable device name.",
    passkeyAdded: "Passkey added.",
    passkeyRemoved: "Passkey removed.",
    passkeyUnavailable: "This browser or connection does not support passkeys.",
    added: "Added {date}",
    synced: "synced",
    remove: "Remove",
    authenticator: "Authenticator app",
    authenticatorHint:
      "Works with 1Password, Google Authenticator, Microsoft Authenticator, and other TOTP apps.",
    enabled: "Enabled",
    codesRemaining: "Recovery codes left: {count}",
    newCodes: "New codes",
    disable: "Disable",
    setUp: "Set up",
    enrollmentTitle: "Connect your app",
    openAuthenticator: "Open in an authenticator app",
    enterSecret: "Or enter this secret manually:",
    enterCode: "Enter the six-digit code shown by the app.",
    code: "Six-digit code",
    confirm: "Confirm",
    totpEnabled: "Authenticator app enabled.",
    totpDisabled: "Authenticator app disabled.",
    stepUp: "Confirm a sensitive action",
    stepUpHint:
      "Verification is required before application decisions, project deletion, team changes, or admin work.",
    codeOrRecovery: "Code or recovery code",
    verify: "Verify",
    verifyPasskey: "Verify with passkey",
    verified: "Identity verified for 15 minutes.",
    saveCodes: "Save these recovery codes now",
    saveCodesHint: "Each code works once. We will not show them again after this block is closed.",
    copyCodes: "Copy codes",
    codesCopied: "Recovery codes copied.",
  };
}

function MethodRow({
  name,
  detail,
  actionLabel,
  disabled,
  disabledHint,
  onAction,
}: Readonly<{
  name: string;
  detail?: string;
  actionLabel?: string;
  disabled?: boolean;
  disabledHint?: string;
  onAction?: () => void;
}>) {
  return (
    <div className="flex flex-col justify-between gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
      <div>
        <p className="font-semibold">{name}</p>
        {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        {disabledHint ? <p className="mt-1 text-xs text-warning">{disabledHint}</p> : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = "new-password",
  error,
}: Readonly<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: "current-password" | "new-password";
  error?: string;
}>) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="password"
        maxLength={128}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function replaceDate(template: string, date: string) {
  return template.replace("{date}", date);
}
