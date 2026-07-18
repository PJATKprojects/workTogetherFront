"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  moderationService,
  type AppealItem,
  type BlockedUser,
  type ReportItem,
  type UserSanction,
} from "@/services/moderationService";

export function SafetyCenter({ locale }: Readonly<{ locale: Locale }>) {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sanctions, setSanctions] = useState<UserSanction[]>([]);
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [appealText, setAppealText] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextBlocked, nextReports, nextSanctions, nextAppeals] = await Promise.all([
        moderationService.blockedUsers(),
        moderationService.myReports(),
        moderationService.sanctions(),
        moderationService.appeals(),
      ]);
      setBlocked(nextBlocked);
      setReports(nextReports);
      setSanctions(nextSanctions);
      setAppeals(nextAppeals);
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not load the safety center.",
            "Не вдалося завантажити центр безпеки.",
            "Nie udało się załadować centrum bezpieczeństwa."
          )
        ).message
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submitAppeal = async (sanctionId: number) => {
    const message = appealText[sanctionId]?.trim() ?? "";
    if (message.length < 20) {
      setError(
        localText(
          locale,
          "Please explain the appeal in at least 20 characters.",
          "Опишіть апеляцію щонайменше 20 символами.",
          "Opisz odwołanie w co najmniej 20 znakach."
        )
      );
      return;
    }
    setBusy(`appeal-${sanctionId}`);
    setError("");
    try {
      await moderationService.appeal(sanctionId, message);
      await load();
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not submit the appeal.",
            "Не вдалося подати апеляцію.",
            "Nie udało się wysłać odwołania."
          )
        ).message
      );
    } finally {
      setBusy("");
    }
  };

  if (loading)
    return (
      <p className="py-10 text-sm text-muted-foreground">
        {localText(locale, "Loading…", "Завантаження…", "Wczytywanie…")}
      </p>
    );

  return (
    <div className="grid gap-6">
      {error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Section
        title={localText(
          locale,
          "Sanctions and appeals",
          "Санкції та апеляції",
          "Sankcje i odwołania"
        )}
        description={localText(
          locale,
          "Reason, duration, and status for every decision.",
          "Причина, строк і стан кожного рішення.",
          "Powód, czas trwania i stan każdej decyzji."
        )}
      >
        {sanctions.length === 0 ? (
          <Empty
            text={localText(
              locale,
              "No active or past sanctions.",
              "Активних або минулих санкцій немає.",
              "Brak aktywnych i wcześniejszych sankcji."
            )}
          />
        ) : (
          sanctions.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold">{item.type.replaceAll("_", " ").toUpperCase()}</p>
                <span className="text-xs text-muted-foreground">
                  #{item.id} · {formatDate(item.startsAt, locale)}
                </span>
              </div>
              <p className="mt-2 text-sm">{item.reason}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.revokedAt
                  ? localText(locale, "Revoked", "Відкликано", "Cofnięto")
                  : item.endsAt
                    ? `${localText(locale, "Until", "До", "Do")} ${formatDateTime(item.endsAt, locale)}`
                    : localText(
                        locale,
                        "No fixed end date",
                        "Безстроково",
                        "Bez ustalonej daty końcowej"
                      )}
              </p>
              {item.canAppeal ? (
                <div className="mt-4 grid gap-2">
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={appealText[item.id] ?? ""}
                    onChange={(event) =>
                      setAppealText((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    placeholder={localText(
                      locale,
                      "Why should this decision be reviewed?",
                      "Чому рішення слід переглянути?",
                      "Dlaczego ta decyzja powinna zostać ponownie rozpatrzona?"
                    )}
                    className="rounded-xl border border-input bg-surface p-3 text-sm"
                  />
                  <button
                    disabled={busy.length > 0}
                    onClick={() => void submitAppeal(item.id)}
                    className="justify-self-start rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {localText(locale, "Submit appeal", "Подати апеляцію", "Wyślij odwołanie")}
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
        {appeals.map((item) => (
          <div key={`appeal-${item.id}`} className="rounded-2xl bg-surface-muted p-4 text-sm">
            <p className="font-semibold">
              {localText(locale, "Appeal", "Апеляція", "Odwołanie")} #{item.id} · {item.status}
            </p>
            <p className="mt-1 text-muted-foreground">{item.message}</p>
            {item.resolution ? (
              <p className="mt-2">
                <strong>{localText(locale, "Decision:", "Рішення:", "Decyzja:")}</strong>{" "}
                {item.resolution}
              </p>
            ) : null}
          </div>
        ))}
      </Section>

      <Section
        title={localText(
          locale,
          "Blocked users",
          "Заблоковані користувачі",
          "Zablokowani użytkownicy"
        )}
        description={localText(
          locale,
          "Blocking hides profiles and stops messages and invitations in both directions.",
          "Блокування приховує профілі та зупиняє повідомлення й запрошення з обох сторін.",
          "Blokada ukrywa profile oraz zatrzymuje wiadomości i zaproszenia po obu stronach."
        )}
      >
        {blocked.length === 0 ? (
          <Empty
            text={localText(
              locale,
              "No blocked users.",
              "Список порожній.",
              "Brak zablokowanych osób."
            )}
          />
        ) : (
          blocked.map((item) => (
            <div
              key={item.userId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
            >
              <div>
                <p className="font-semibold">{item.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(item.blockedAt, locale)}
                </p>
              </div>
              <button
                disabled={busy.length > 0}
                onClick={() => {
                  setBusy(`block-${item.userId}`);
                  void moderationService
                    .unblock(item.userId)
                    .then(load)
                    .finally(() => setBusy(""));
                }}
                className="rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
              >
                {localText(locale, "Unblock", "Розблокувати", "Odblokuj")}
              </button>
            </div>
          ))
        )}
      </Section>

      <Section
        title={localText(locale, "My reports", "Мої скарги", "Moje zgłoszenia")}
        description={localText(
          locale,
          "Your report history without exposing moderator-private data.",
          "Історія без розкриття приватних даних модерації.",
          "Historia zgłoszeń bez ujawniania prywatnych danych moderacji."
        )}
      >
        {reports.length === 0 ? (
          <Empty
            text={localText(
              locale,
              "You have not submitted reports.",
              "Ви ще не подавали скарг.",
              "Nie wysłałeś(-aś) jeszcze żadnych zgłoszeń."
            )}
          />
        ) : (
          reports.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4 text-sm">
              <div className="flex justify-between gap-2">
                <p className="font-semibold">
                  {item.category} · {item.targetType} #{item.targetId}
                </p>
                <span>{item.status}</span>
              </div>
              {item.resolution ? (
                <p className="mt-2 text-muted-foreground">{item.resolution}</p>
              ) : null}
            </div>
          ))
        )}
      </Section>
      <p className="text-sm text-muted-foreground">
        {localText(
          locale,
          "Rules and enforcement process: ",
          "Правила та процес розгляду: ",
          "Zasady i proces egzekwowania: "
        )}
        <Link
          href={withLocale(locale, "/community-guidelines")}
          className="font-semibold text-primary-text hover:underline"
        >
          {localText(locale, "Community Guidelines", "Правила спільноти", "Zasady społeczności")}
        </Link>
        .
      </p>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: Readonly<{ title: string; description: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-3xl border border-border bg-surface/80 p-5 sm:p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}
function Empty({ text }: Readonly<{ text: string }>) {
  return <p className="rounded-2xl bg-surface-muted p-4 text-sm text-muted-foreground">{text}</p>;
}
