"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useNotificationActions, useNotifications } from "@/hooks/use-notifications";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { formatDate } from "@/lib/format";
import {
  notificationService,
  type NotificationPreferences,
  type PushConfiguration,
} from "@/services/notificationService";

export function NotificationCenter({ locale }: Readonly<{ locale: Locale }>) {
  const text = copy(locale);
  const query = useNotifications();
  const actions = useNotificationActions();
  const preferences = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: notificationService.preferences,
  });
  const push = useQuery({
    queryKey: ["push-configuration"],
    queryFn: notificationService.pushConfiguration,
  });
  const [draft, setDraft] = useState<NotificationPreferences | null>(null);
  const currentPreferences = draft ?? preferences.data ?? null;
  const save = useMutation({
    mutationFn: notificationService.updatePreferences,
    onSuccess: setDraft,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              actions.readAll.mutate(undefined, {
                onSuccess: () => void push.refetch(),
              });
            }}
          >
            {text.readAll}
          </Button>
        </div>

        {query.isLoading ? (
          <p className="py-10 text-muted-foreground">{text.loading}</p>
        ) : query.data?.items.length ? (
          <div className="mt-4 divide-y divide-border">
            {query.data.items.map((item) => {
              const href = item.actionUrl.startsWith("/")
                ? withLocale(locale, item.actionUrl)
                : withLocale(locale, "/notifications");
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={() => {
                    if (!item.readAt) {
                      actions.read.mutate(item.id, {
                        onSuccess: () => void push.refetch(),
                      });
                    }
                  }}
                  className={`block rounded-xl px-3 py-4 transition hover:bg-muted ${
                    item.readAt ? "opacity-70" : "bg-primary-soft/35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{notificationTitle(item.type, locale)}</p>
                    {!item.readAt ? (
                      <span className="size-2 rounded-full bg-primary" aria-label={text.unread} />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(item.createdAt, locale)}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="py-10 text-sm text-muted-foreground">{text.empty}</p>
        )}
      </section>

      <section className="h-fit rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">{text.channels}</h2>
        {currentPreferences ? (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate({
                ...currentPreferences,
                // Push is changed only by the explicit device flow below.
                pushEnabled: push.data?.enabled ?? false,
              });
            }}
          >
            <PreferenceToggle
              label={text.emailMessages}
              checked={currentPreferences.emailMessages}
              onChange={(value) => setDraft({ ...currentPreferences, emailMessages: value })}
            />
            <PreferenceToggle
              label={text.emailMentions}
              checked={currentPreferences.emailMentions}
              onChange={(value) => setDraft({ ...currentPreferences, emailMentions: value })}
            />
            <PreferenceToggle
              label={text.emailTeam}
              checked={currentPreferences.emailTeamUpdates}
              onChange={(value) => setDraft({ ...currentPreferences, emailTeamUpdates: value })}
            />
            <PreferenceToggle
              label={text.digest}
              checked={currentPreferences.weeklyDigest}
              onChange={(value) => setDraft({ ...currentPreferences, weeklyDigest: value })}
            />

            <PushOptIn
              locale={locale}
              configuration={push.data}
              pending={push.isFetching}
              onChanged={(value) => {
                void push.refetch();
                void preferences.refetch();
                setDraft({
                  ...currentPreferences,
                  pushEnabled: value.enabled,
                  pushValueConfirmedAt: value.valueConfirmed
                    ? (currentPreferences.pushValueConfirmedAt ?? new Date().toISOString())
                    : null,
                });
              }}
            />

            <div className="grid grid-cols-2 gap-2">
              <MinuteInput
                label={text.quietFrom}
                value={currentPreferences.quietHoursStartMinutes}
                onChange={(value) =>
                  setDraft({
                    ...currentPreferences,
                    quietHoursStartMinutes: value,
                  })
                }
              />
              <MinuteInput
                label={text.quietUntil}
                value={currentPreferences.quietHoursEndMinutes}
                onChange={(value) =>
                  setDraft({
                    ...currentPreferences,
                    quietHoursEndMinutes: value,
                  })
                }
              />
            </div>
            <Button type="submit" disabled={save.isPending}>
              {text.save}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{text.loading}</p>
        )}
      </section>
    </div>
  );
}

function PushOptIn({
  locale,
  configuration,
  pending,
  onChanged,
}: Readonly<{
  locale: Locale;
  configuration: PushConfiguration | undefined;
  pending: boolean;
  onChanged: (value: PushConfiguration) => void;
}>) {
  const text = pushCopy(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<PushConfiguration>) => {
    setBusy(true);
    setError("");
    try {
      onChanged(await action());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.genericError);
    } finally {
      setBusy(false);
    }
  };

  if (pending && !configuration) {
    return <p className="text-xs text-muted-foreground">Push…</p>;
  }
  if (!configuration?.available) {
    return (
      <div className="rounded-xl border border-border p-3">
        <p className="text-sm font-semibold">Push</p>
        <p className="mt-1 text-xs text-muted-foreground">{text.notConfigured}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{text.title}</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            {!configuration.valueConfirmed
              ? text.beforeValue
              : configuration.enabled
                ? text.enabled
                : text.beforePermission}
          </p>
        </div>
        {!configuration.valueConfirmed ? (
          <button
            type="button"
            disabled={busy || !configuration.eligibleToConfirmValue}
            onClick={() => void run(notificationService.confirmPushValue)}
            className="rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary-text disabled:opacity-50"
          >
            {text.useful}
          </button>
        ) : configuration.enabled ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(notificationService.disablePush)}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
          >
            {text.disable}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(notificationService.enablePush)}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {text.enable}
          </button>
        )}
      </div>
      {!configuration.valueConfirmed && !configuration.eligibleToConfirmValue ? (
        <p className="mt-2 text-xs text-warning">{text.locked}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: Readonly<{
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}>) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
    </label>
  );
}

function MinuteInput({
  label,
  value,
  onChange,
}: Readonly<{
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}>) {
  return (
    <label className="text-xs font-semibold text-muted-foreground">
      {label}
      <input
        type="time"
        value={minutesToTime(value)}
        onChange={(event) => onChange(timeToMinutes(event.target.value))}
        className="mt-1 h-10 w-full rounded-lg border border-input bg-surface px-2 text-sm"
      />
    </label>
  );
}

function minutesToTime(value: number | null) {
  if (value === null) return "";
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(
    2,
    "0"
  )}`;
}

function timeToMinutes(value: string) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function notificationTitle(type: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    application: {
      en: "Application update",
      uk: "Оновлення заявки",
      pl: "Aktualizacja zgłoszenia",
    },
    message: { en: "New message", uk: "Нове повідомлення", pl: "Nowa wiadomość" },
    message_request: {
      en: "Conversation request",
      uk: "Запит на розмову",
      pl: "Prośba o rozmowę",
    },
    invite: {
      en: "Project invite",
      uk: "Запрошення до проєкту",
      pl: "Zaproszenie do projektu",
    },
    mention: {
      en: "You were mentioned",
      uk: "Вас згадали",
      pl: "Wspomniano o Tobie",
    },
    deadline: {
      en: "Deadline reminder",
      uk: "Нагадування про термін",
      pl: "Przypomnienie o terminie",
    },
    team_update: {
      en: "Team update",
      uk: "Оновлення команди",
      pl: "Aktualizacja zespołu",
    },
    moderation: {
      en: "Safety decision",
      uk: "Рішення модерації",
      pl: "Decyzja moderacji",
    },
    plan_limit_applied: {
      en: "Plan limits changed",
      uk: "Ліміти плану змінилися",
      pl: "Limity planu zmieniły się",
    },
  };
  return labels[type]?.[locale] ?? type;
}

function copy(locale: Locale) {
  const values = {
    en: {
      title: "Notifications",
      readAll: "Mark all read",
      loading: "Loading…",
      empty: "No notifications yet.",
      unread: "Unread",
      channels: "Channels and quiet hours",
      emailMessages: "Email for messages",
      emailMentions: "Email for mentions",
      emailTeam: "Email for team updates",
      digest: "Weekly match digest",
      quietFrom: "Quiet from",
      quietUntil: "Quiet until",
      save: "Save preferences",
    },
    uk: {
      title: "Сповіщення",
      readAll: "Позначити все прочитаним",
      loading: "Завантаження…",
      empty: "Сповіщень поки немає.",
      unread: "Непрочитане",
      channels: "Канали й тихі години",
      emailMessages: "Email про повідомлення",
      emailMentions: "Email про згадки",
      emailTeam: "Email про оновлення команди",
      digest: "Щотижневий дайджест збігів",
      quietFrom: "Тиша від",
      quietUntil: "Тиша до",
      save: "Зберегти налаштування",
    },
    pl: {
      title: "Powiadomienia",
      readAll: "Oznacz wszystkie jako przeczytane",
      loading: "Ładowanie…",
      empty: "Nie masz jeszcze powiadomień.",
      unread: "Nieprzeczytane",
      channels: "Kanały i godziny ciszy",
      emailMessages: "Email o wiadomościach",
      emailMentions: "Email o wzmiankach",
      emailTeam: "Email o aktualizacjach zespołu",
      digest: "Cotygodniowy przegląd dopasowań",
      quietFrom: "Cisza od",
      quietUntil: "Cisza do",
      save: "Zapisz ustawienia",
    },
  };
  return values[locale];
}

function pushCopy(locale: Locale) {
  const values = {
    en: {
      title: "Push notifications",
      notConfigured: "Push is not configured on the server yet.",
      beforeValue:
        "Use the notification center first. Then explicitly confirm that browser reminders would be useful.",
      enabled: "Push is active on this device.",
      beforePermission:
        "Value is confirmed. The browser permission prompt appears only after you click Enable.",
      useful: "This would be useful",
      disable: "Disable on this device",
      enable: "Enable",
      locked: "This unlocks after you read your first in-app notification.",
      genericError: "Could not update push settings.",
    },
    uk: {
      title: "Push-сповіщення",
      notConfigured: "Push ще не налаштовано на сервері.",
      beforeValue:
        "Спочатку скористайтеся центром сповіщень. Потім свідомо підтвердьте, що браузерні нагадування будуть корисні.",
      enabled: "Push активний на цьому пристрої.",
      beforePermission:
        "Цінність підтверджено. Дозвіл браузера з’явиться лише після натискання «Увімкнути».",
      useful: "Це буде корисно",
      disable: "Вимкнути на пристрої",
      enable: "Увімкнути",
      locked: "Опція відкриється після прочитання першого сповіщення в застосунку.",
      genericError: "Не вдалося змінити налаштування push.",
    },
    pl: {
      title: "Powiadomienia push",
      notConfigured: "Push nie jest jeszcze skonfigurowany na serwerze.",
      beforeValue:
        "Najpierw korzystaj z centrum powiadomień. Potem świadomie potwierdź, że przypomnienia w przeglądarce będą przydatne.",
      enabled: "Push jest aktywny na tym urządzeniu.",
      beforePermission:
        "Wartość została potwierdzona. Pytanie przeglądarki pojawi się dopiero po kliknięciu Włącz.",
      useful: "To będzie przydatne",
      disable: "Wyłącz na tym urządzeniu",
      enable: "Włącz",
      locked: "Opcja odblokuje się po przeczytaniu pierwszego powiadomienia w aplikacji.",
      genericError: "Nie udało się zmienić ustawień push.",
    },
  };
  return values[locale];
}
