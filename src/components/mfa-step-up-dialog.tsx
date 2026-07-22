"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { securityService, type MfaStatusDto } from "@/services/securityService";

type GateMode = "setup_required" | "verification_required";

const copy = {
  en: {
    setupTitle: "Protect sensitive actions",
    setupBody:
      "Add a passkey or authenticator app before changing project ownership, moderation, or other sensitive settings.",
    setupAction: "Open security settings",
    verifyTitle: "Confirm this sensitive action",
    verifyBody:
      "Use a passkey or a 6-digit authenticator code. Verification remains valid for 15 minutes.",
    passkey: "Verify with passkey",
    code: "Authenticator code",
    verify: "Verify",
    cancel: "Cancel",
    success: "Identity confirmed. Repeat the action to continue.",
    error: "Could not verify your identity.",
  },
  uk: {
    setupTitle: "Захистіть чутливі дії",
    setupBody:
      "Додайте passkey або застосунок-автентифікатор перед зміною власника, модерацією чи іншими чутливими налаштуваннями.",
    setupAction: "Відкрити налаштування безпеки",
    verifyTitle: "Підтвердьте чутливу дію",
    verifyBody:
      "Скористайтеся passkey або 6-значним кодом автентифікатора. Підтвердження діє 15 хвилин.",
    passkey: "Підтвердити через passkey",
    code: "Код автентифікатора",
    verify: "Підтвердити",
    cancel: "Скасувати",
    success: "Особу підтверджено. Повторіть дію, щоб продовжити.",
    error: "Не вдалося підтвердити особу.",
  },
  pl: {
    setupTitle: "Zabezpiecz działania wrażliwe",
    setupBody:
      "Dodaj klucz dostępu lub aplikację uwierzytelniającą przed zmianą właściciela, moderacją albo innymi wrażliwymi ustawieniami.",
    setupAction: "Otwórz ustawienia bezpieczeństwa",
    verifyTitle: "Potwierdź działanie wrażliwe",
    verifyBody:
      "Użyj klucza dostępu albo 6-cyfrowego kodu z aplikacji. Potwierdzenie jest ważne przez 15 minut.",
    passkey: "Potwierdź kluczem dostępu",
    code: "Kod uwierzytelniający",
    verify: "Potwierdź",
    cancel: "Anuluj",
    success: "Tożsamość potwierdzona. Powtórz działanie, aby kontynuować.",
    error: "Nie udało się potwierdzić tożsamości.",
  },
} as const;

export function MfaStepUpDialog({ locale }: Readonly<{ locale: Locale }>) {
  const text = copy[locale];
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<GateMode>("verification_required");
  const [status, setStatus] = useState<MfaStatusDto | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const close = () => {
    if (busy) return;
    setOpen(false);
    setCode("");
    setMessage("");
  };
  const dialogRef = useDialogFocus<HTMLDivElement>(open, close);

  useEffect(() => {
    const onRequired = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: GateMode }>).detail;
      setMode(detail?.mode === "setup_required" ? "setup_required" : "verification_required");
      setMessage("");
      setCode("");
      setOpen(true);
      void securityService
        .status()
        .then(setStatus)
        .catch(() => setStatus(null));
    };
    window.addEventListener("wt:mfa-required", onRequired);
    return () => window.removeEventListener("wt:mfa-required", onRequired);
  }, []);

  if (!open) return null;

  const run = async (method: "passkey" | "totp") => {
    setBusy(method);
    setMessage("");
    try {
      if (method === "passkey") await securityService.stepUpWithPasskey();
      else await securityService.verifyTotp(code.trim());
      setMessage(text.success);
      setCode("");
      window.dispatchEvent(new Event("wt:mfa-verified"));
    } catch (error) {
      setMessage(getApiError(error, text.error).message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-foreground/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mfa-gate-title"
        tabIndex={-1}
        className="glass-panel w-full max-w-md rounded-3xl p-6"
      >
        <h2 id="mfa-gate-title" className="text-xl font-semibold">
          {mode === "setup_required" ? text.setupTitle : text.verifyTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {mode === "setup_required" ? text.setupBody : text.verifyBody}
        </p>

        {mode === "setup_required" ? (
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={close}>
              {text.cancel}
            </Button>
            <Link
              href={withLocale(locale, "/profile/security")}
              onClick={close}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold leading-snug text-primary-foreground"
            >
              {text.setupAction}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3">
              {status?.hasPasskeys ? (
                <Button
                  type="button"
                  data-dialog-initial-focus
                  disabled={Boolean(busy)}
                  onClick={() => void run("passkey")}
                >
                  {busy === "passkey" ? "…" : text.passkey}
                </Button>
              ) : null}
              {status?.totpEnabled ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void run("totp");
                  }}
                  className="grid gap-2"
                >
                  <label className="text-sm font-semibold">
                    {text.code}
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/gu, ""))}
                      className="mt-1 h-11 w-full rounded-xl border border-input bg-surface px-3 tracking-[0.3em]"
                    />
                  </label>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={Boolean(busy) || code.length !== 6}
                  >
                    {busy === "totp" ? "…" : text.verify}
                  </Button>
                </form>
              ) : null}
            </div>
            {message ? (
              <p role="status" aria-live="polite" className="mt-4 text-sm text-foreground">
                {message}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end">
              <Button type="button" variant="ghost" onClick={close}>
                {text.cancel}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
