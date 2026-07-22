"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/hooks/use-auth";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { authService } from "@/services/authService";

export function CommunityOnboardingForm({ locale }: Readonly<{ locale: Locale }>) {
  const router = useRouter();
  const { refreshSession, logout } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!dateOfBirth || !accepted) return;
    setBusy(true);
    setError("");
    try {
      await authService.completeCommunityOnboarding(dateOfBirth, locale, accepted);
      await refreshSession();
      router.replace(withLocale(locale, "/profile"));
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not complete onboarding.",
            "Не вдалося завершити налаштування.",
            "Nie udało się ukończyć konfiguracji."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-surface/90 p-6 sm:p-8">
      <div className="rounded-2xl bg-primary/10 p-4 text-sm leading-6 text-foreground">
        {localText(
          locale,
          "We only ask for your date of birth to verify the 18+ minimum age. It is not shown to other users and never affects recommendations.",
          "Ми просимо лише дату народження для перевірки мінімального віку 18+. Вона не показується іншим користувачам і не впливає на рекомендації.",
          "Prosimy o datę urodzenia wyłącznie w celu sprawdzenia minimalnego wieku 18+. Nie pokazujemy jej innym osobom i nie wpływa ona na rekomendacje."
        )}
      </div>
      <label className="mt-6 grid gap-2 text-sm font-semibold">
        {localText(locale, "Date of birth", "Дата народження", "Data urodzenia")}
        <input
          type="date"
          required
          value={dateOfBirth}
          max={yearsAgo(18)}
          min={yearsAgo(120)}
          onChange={(event) => setDateOfBirth(event.target.value)}
          className="h-11 rounded-xl border border-input bg-surface px-3 font-normal"
        />
      </label>
      <label className="mt-5 flex items-start gap-3 rounded-2xl border border-border p-4 text-sm leading-6">
        <input
          type="checkbox"
          required
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1 size-4 accent-primary"
        />
        <span>
          {localText(
            locale,
            "I have read and accept the ",
            "Я прочитав(-ла) і приймаю ",
            "Przeczytałem(-am) i akceptuję "
          )}
          <Link
            className="font-semibold text-primary-text hover:underline"
            href={withLocale(locale, "/community-guidelines")}
          >
            {localText(locale, "Community Guidelines", "Правила спільноти", "Zasady społeczności")}
          </Link>
          .
        </span>
      </label>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          disabled={busy || !accepted || !dateOfBirth}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-semibold leading-snug text-primary-foreground disabled:opacity-50"
        >
          {busy
            ? localText(locale, "Saving…", "Збереження…", "Zapisywanie…")
            : localText(locale, "Continue", "Продовжити", "Kontynuuj")}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 py-2.5 text-center text-sm font-semibold leading-snug hover:bg-muted"
        >
          {localText(locale, "Sign out", "Вийти", "Wyloguj się")}
        </button>
      </div>
    </form>
  );
}

function yearsAgo(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}
