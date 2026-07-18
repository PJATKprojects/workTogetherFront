"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import {
  moderationService,
  type AdminSanction,
  type AppealItem,
  type AuditItem,
  type IllegalContentNoticeItem,
  type ReportItem,
  type UserSanction,
} from "@/services/moderationService";

export function ModerationAdmin({ locale }: Readonly<{ locale: Locale }>) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [illegalContentNotices, setIllegalContentNotices] = useState<IllegalContentNoticeItem[]>(
    []
  );
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [sanctions, setSanctions] = useState<AdminSanction[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [resolution, setResolution] = useState<Record<string, string>>({});
  const [sanctionUserId, setSanctionUserId] = useState("");
  const [sanctionType, setSanctionType] = useState<UserSanction["type"]>("warning");
  const [sanctionReason, setSanctionReason] = useState("");
  const [sanctionEnd, setSanctionEnd] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState<ReportItem["status"] | "all">("open");
  const [illegalNoticeFilter, setIllegalNoticeFilter] = useState<
    IllegalContentNoticeItem["status"] | "all"
  >("open");
  const [appealFilter, setAppealFilter] = useState<AppealItem["status"] | "all">("open");
  const [sanctionFilter, setSanctionFilter] = useState<"active" | "revoked" | "expired" | "all">(
    "active"
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [revokeSanctionId, setRevokeSanctionId] = useState<number | null>(null);

  const load = useCallback(
    async (showLoading = true) => {
      setError("");
      if (showLoading) setLoading(true);
      try {
        const [r, n, a, s, l] = await Promise.all([
          moderationService.adminReports("all"),
          moderationService.adminIllegalContentNotices("all"),
          moderationService.adminAppeals("all"),
          moderationService.adminSanctions(sanctionFilter),
          moderationService.audit(),
        ]);
        setReports(r);
        setIllegalContentNotices(n);
        setAppeals(a);
        setSanctions(s);
        setAudit(l);
      } catch (value) {
        setError(
          getApiError(
            value,
            localText(
              locale,
              "Access denied or moderation data unavailable.",
              "Немає доступу або дані недоступні.",
              "Brak dostępu albo dane moderacji są niedostępne."
            )
          ).message
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [locale, sanctionFilter]
  );
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const decideReport = async (id: number, status: "reviewing" | "resolved" | "dismissed") => {
    const text = (
      resolution[`report-${id}`] ??
      reports.find((item) => item.id === id)?.resolution ??
      ""
    ).trim();
    if (status !== "reviewing" && !text) {
      setFieldErrors((current) => ({
        ...current,
        [`report-${id}`]: localText(
          locale,
          "Add a written resolution before closing the report.",
          "Додайте письмове рішення перед закриттям скарги.",
          "Dodaj pisemne uzasadnienie przed zamknięciem zgłoszenia."
        ),
      }));
      document.getElementById(`report-resolution-${id}`)?.focus();
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await moderationService.resolveReport(id, status, text);
      await load(false);
      setNotice(
        localText(
          locale,
          `Report #${id} updated.`,
          `Скаргу #${id} оновлено.`,
          `Zgłoszenie #${id} zaktualizowano.`
        )
      );
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not update the report.",
            "Не вдалося оновити скаргу.",
            "Nie udało się zaktualizować zgłoszenia."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };

  const decideIllegalContentNotice = async (
    id: number,
    status: "reviewing" | "actioned" | "dismissed"
  ) => {
    const key = `illegal-notice-${id}`;
    const text = (
      resolution[key] ??
      illegalContentNotices.find((item) => item.id === id)?.decision ??
      ""
    ).trim();
    if (status !== "reviewing" && !text) {
      setFieldErrors((current) => ({
        ...current,
        [key]: localText(
          locale,
          "Add the statement of reasons before making a final DSA decision.",
          "Додайте обґрунтування перед остаточним рішенням DSA.",
          "Dodaj uzasadnienie przed wydaniem ostatecznej decyzji DSA."
        ),
      }));
      document.getElementById(`${key}-decision`)?.focus();
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await moderationService.resolveIllegalContentNotice(id, status, text);
      await load(false);
      setNotice(
        localText(
          locale,
          "Illegal-content notice updated and the final decision was queued for delivery.",
          "Повідомлення про незаконний контент оновлено, остаточне рішення додано до черги доставки.",
          "Zawiadomienie zaktualizowano, a ostateczną decyzję dodano do kolejki wysyłki."
        )
      );
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not update the illegal-content notice.",
            "Не вдалося оновити повідомлення про незаконний контент.",
            "Nie udało się zaktualizować zawiadomienia o nielegalnej treści."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };

  const revokeSanction = async () => {
    if (revokeSanctionId === null) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await moderationService.revokeSanction(revokeSanctionId);
      setNotice(
        localText(locale, "Sanction revoked.", "Санкцію відкликано.", "Sankcja została cofnięta.")
      );
      setRevokeSanctionId(null);
      await load(false);
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not revoke the sanction.",
            "Не вдалося відкликати санкцію.",
            "Nie udało się cofnąć sankcji."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };
  const decideAppeal = async (id: number, status: "accepted" | "rejected") => {
    const text = resolution[`appeal-${id}`]?.trim() ?? "";
    if (!text) {
      setFieldErrors((current) => ({
        ...current,
        [`appeal-${id}`]: localText(
          locale,
          "Add a decision reason.",
          "Додайте причину рішення.",
          "Dodaj uzasadnienie decyzji."
        ),
      }));
      document.getElementById(`appeal-resolution-${id}`)?.focus();
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`appeal-${id}`];
      return next;
    });
    try {
      await moderationService.resolveAppeal(id, status, text);
      await load(false);
      setNotice(
        localText(
          locale,
          `Appeal #${id} updated.`,
          `Апеляцію #${id} оновлено.`,
          `Odwołanie #${id} zaktualizowano.`
        )
      );
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not update the appeal.",
            "Не вдалося оновити апеляцію.",
            "Nie udało się zaktualizować odwołania."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };
  const sanction = async () => {
    const errors: Record<string, string> = {};
    if (!Number(sanctionUserId)) {
      errors.sanctionUser = localText(
        locale,
        "Enter a valid user ID.",
        "Введіть коректний ID користувача.",
        "Wpisz prawidłowy ID użytkownika."
      );
    }
    if (!sanctionReason.trim()) {
      errors.sanctionReason = localText(
        locale,
        "Add the evidence-based reason.",
        "Додайте обґрунтовану причину.",
        "Dodaj uzasadniony powód."
      );
    }
    if (
      sanctionType === "suspension" &&
      (!sanctionEnd || Number.isNaN(new Date(sanctionEnd).getTime()))
    ) {
      errors.sanctionEnd = localText(
        locale,
        "Choose when the suspension ends.",
        "Оберіть час завершення призупинення.",
        "Wybierz koniec zawieszenia."
      );
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      document
        .getElementById(
          errors.sanctionUser
            ? "sanction-user"
            : errors.sanctionReason
              ? "sanction-reason"
              : "sanction-end"
        )
        ?.focus();
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await moderationService.createSanction(
        Number(sanctionUserId),
        sanctionType,
        sanctionReason,
        sanctionType === "suspension" ? new Date(sanctionEnd).toISOString() : undefined
      );
      setSanctionReason("");
      await load(false);
      setNotice(localText(locale, "Sanction created.", "Санкцію створено.", "Sankcję utworzono."));
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Could not create sanction.",
            "Не вдалося створити санкцію.",
            "Nie udało się utworzyć sankcji."
          )
        ).message
      );
    } finally {
      setBusy(false);
    }
  };

  const visibleReports =
    reportFilter === "all" ? reports : reports.filter((item) => item.status === reportFilter);
  const visibleIllegalContentNotices =
    illegalNoticeFilter === "all"
      ? illegalContentNotices
      : illegalContentNotices.filter((item) => item.status === illegalNoticeFilter);
  const visibleAppeals =
    appealFilter === "all" ? appeals : appeals.filter((item) => item.status === appealFilter);

  return (
    <div className="grid gap-7">
      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <section className="rounded-3xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">
          {localText(locale, "Create sanction", "Нова санкція", "Utwórz sankcję")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {localText(
            locale,
            "Sensitive actions require recent MFA and are written to the audit log.",
            "Чутливі дії вимагають нещодавнього MFA і записуються до журналу аудиту.",
            "Działania wrażliwe wymagają świeżego MFA i trafiają do dziennika audytu."
          )}
        </p>
        <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void sanction();
          }}
          noValidate
        >
          <div className="grid gap-4 md:grid-cols-3">
            <label htmlFor="sanction-user" className="grid gap-1.5 text-sm font-medium">
              {localText(locale, "User ID", "ID користувача", "ID użytkownika")}
              <input
                id="sanction-user"
                type="number"
                min="1"
                value={sanctionUserId}
                onChange={(event) => {
                  setSanctionUserId(event.target.value);
                  setFieldErrors((current) => ({ ...current, sanctionUser: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.sanctionUser) || undefined}
                aria-describedby={fieldErrors.sanctionUser ? "sanction-user-error" : undefined}
                className="h-11 rounded-xl border border-input bg-surface px-3"
              />
              <FieldError id="sanction-user-error" message={fieldErrors.sanctionUser} />
            </label>
            <label htmlFor="sanction-type" className="grid gap-1.5 text-sm font-medium">
              {localText(locale, "Sanction type", "Тип санкції", "Typ sankcji")}
              <select
                id="sanction-type"
                value={sanctionType}
                onChange={(event) => setSanctionType(event.target.value as UserSanction["type"])}
                className="h-11 rounded-xl border border-input bg-surface px-3"
              >
                <option value="warning">
                  {localText(locale, "Warning", "Попередження", "Ostrzeżenie")}
                </option>
                <option value="suspension">
                  {localText(locale, "Suspension", "Призупинення", "Zawieszenie")}
                </option>
                <option value="ban">{localText(locale, "Ban", "Блокування", "Blokada")}</option>
                <option value="content_removal">
                  {localText(locale, "Content removal", "Видалення контенту", "Usunięcie treści")}
                </option>
              </select>
            </label>
            {sanctionType === "suspension" ? (
              <label htmlFor="sanction-end" className="grid gap-1.5 text-sm font-medium">
                {localText(locale, "Suspension ends", "Кінець призупинення", "Koniec zawieszenia")}
                <input
                  id="sanction-end"
                  type="datetime-local"
                  value={sanctionEnd}
                  onChange={(event) => {
                    setSanctionEnd(event.target.value);
                    setFieldErrors((current) => ({ ...current, sanctionEnd: "" }));
                  }}
                  aria-invalid={Boolean(fieldErrors.sanctionEnd) || undefined}
                  aria-describedby={fieldErrors.sanctionEnd ? "sanction-end-error" : undefined}
                  className="h-11 rounded-xl border border-input bg-surface px-3"
                />
                <FieldError id="sanction-end-error" message={fieldErrors.sanctionEnd} />
              </label>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
          <label htmlFor="sanction-reason" className="grid gap-1.5 text-sm font-medium">
            {localText(locale, "Reason and evidence", "Причина та докази", "Powód i dowody")}
            <textarea
              id="sanction-reason"
              value={sanctionReason}
              onChange={(event) => {
                setSanctionReason(event.target.value);
                setFieldErrors((current) => ({ ...current, sanctionReason: "" }));
              }}
              maxLength={2000}
              rows={3}
              aria-invalid={Boolean(fieldErrors.sanctionReason) || undefined}
              aria-describedby={fieldErrors.sanctionReason ? "sanction-reason-error" : undefined}
              className="w-full rounded-xl border border-input bg-surface p-3"
            />
            <FieldError id="sanction-reason-error" message={fieldErrors.sanctionReason} />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="focus-ring min-h-11 w-fit rounded-xl bg-destructive px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {localText(locale, "Apply sanction", "Застосувати санкцію", "Zastosuj sankcję")}
          </button>
        </form>
      </section>
      <section className="rounded-3xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {localText(
                locale,
                "DSA illegal-content notices",
                "Повідомлення DSA про незаконний контент",
                "Zawiadomienia DSA o nielegalnych treściach"
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {localText(
                locale,
                `${illegalContentNotices.filter((item) => item.status === "open").length} notices await review`,
                `${illegalContentNotices.filter((item) => item.status === "open").length} повідомлень очікують розгляду`,
                `${illegalContentNotices.filter((item) => item.status === "open").length} zawiadomień oczekuje na rozpatrzenie`
              )}
            </p>
          </div>
          <label
            htmlFor="illegal-notice-status-filter"
            className="grid gap-1 text-xs font-semibold"
          >
            {localText(locale, "Status filter", "Фільтр статусу", "Filtr statusu")}
            <select
              id="illegal-notice-status-filter"
              value={illegalNoticeFilter}
              onChange={(event) =>
                setIllegalNoticeFilter(
                  event.target.value as IllegalContentNoticeItem["status"] | "all"
                )
              }
              className="h-10 rounded-xl border border-input bg-surface px-3 text-sm"
            >
              <option value="open">{moderationValue(locale, "open")}</option>
              <option value="reviewing">{moderationValue(locale, "reviewing")}</option>
              <option value="actioned">{moderationValue(locale, "actioned")}</option>
              <option value="dismissed">{moderationValue(locale, "dismissed")}</option>
              <option value="all">{localText(locale, "All", "Усі", "Wszystkie")}</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3">
          {loading ? (
            <p role="status" className="py-8 text-sm text-muted-foreground">
              {localText(
                locale,
                "Loading illegal-content notices…",
                "Завантажуємо повідомлення про незаконний контент…",
                "Wczytywanie zawiadomień o nielegalnych treściach…"
              )}
            </p>
          ) : visibleIllegalContentNotices.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              {localText(
                locale,
                "No notices match this status.",
                "Немає повідомлень із цим статусом.",
                "Brak zawiadomień o tym statusie."
              )}
            </p>
          ) : null}
          {visibleIllegalContentNotices.map((item) => {
            const key = `illegal-notice-${item.id}`;
            const final = item.status === "actioned" || item.status === "dismissed";
            return (
              <article key={item.id} className="rounded-2xl border border-border p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {item.reference} · {moderationValue(locale, item.category)}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt, locale)} · {item.locale.toUpperCase()} ·{" "}
                      correlation {item.correlationId}
                    </p>
                  </div>
                  <ModerationStatus status={item.status} locale={locale} />
                </div>

                <dl className="mt-4 grid gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {localText(locale, "Reporter", "Заявник", "Zgłaszający")}
                    </dt>
                    <dd className="mt-1 break-words">
                      {item.reporterName || "—"}
                      {item.reporterEmail ? ` · ${item.reporterEmail}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {localText(locale, "Content URL", "Адреса контенту", "URL treści")}
                    </dt>
                    <dd className="mt-1 break-all">
                      <a
                        href={item.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-primary-text hover:underline"
                      >
                        {item.contentUrl}
                      </a>
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 whitespace-pre-wrap leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {localText(
                      locale,
                      "Alleged illegality",
                      "Ймовірна незаконність",
                      "Uzasadnienie nielegalności"
                    )}
                    :
                  </span>{" "}
                  {item.legalReason}
                </p>

                <label htmlFor={`${key}-decision`} className="mt-4 grid gap-1.5 font-medium">
                  {localText(
                    locale,
                    "Statement of reasons sent with the final decision",
                    "Обґрунтування, що надсилається з остаточним рішенням",
                    "Uzasadnienie wysyłane z ostateczną decyzją"
                  )}
                  <textarea
                    id={`${key}-decision`}
                    value={resolution[key] ?? item.decision ?? ""}
                    onChange={(event) => {
                      setResolution((current) => ({ ...current, [key]: event.target.value }));
                      setFieldErrors((current) => ({ ...current, [key]: "" }));
                    }}
                    disabled={final}
                    rows={3}
                    maxLength={3000}
                    aria-invalid={Boolean(fieldErrors[key]) || undefined}
                    aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
                    className="w-full rounded-xl border border-input bg-surface p-3 font-normal disabled:opacity-70"
                  />
                  <FieldError id={`${key}-error`} message={fieldErrors[key]} />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminButton
                    disabled={busy || final}
                    onClick={() => void decideIllegalContentNotice(item.id, "reviewing")}
                  >
                    {localText(locale, "Mark reviewing", "Позначити на розгляді", "Oznacz w toku")}
                  </AdminButton>
                  <AdminButton
                    disabled={busy || final}
                    onClick={() => void decideIllegalContentNotice(item.id, "actioned")}
                  >
                    {localText(locale, "Action taken", "Заходів вжито", "Podjęto działanie")}
                  </AdminButton>
                  <AdminButton
                    disabled={busy || final}
                    onClick={() => void decideIllegalContentNotice(item.id, "dismissed")}
                  >
                    {localText(locale, "Dismiss", "Відхилити", "Oddal")}
                  </AdminButton>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="rounded-3xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {localText(locale, "Sanctions", "Санкції", "Sankcje")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {localText(
                locale,
                "Review active restrictions and revoke them with an audited decision.",
                "Переглядайте активні обмеження та відкликайте їх із записом в аудиті.",
                "Przeglądaj aktywne ograniczenia i cofaj je z zapisem w dzienniku audytu."
              )}
            </p>
          </div>
          <label htmlFor="sanction-status-filter" className="grid gap-1 text-xs font-semibold">
            {localText(locale, "State filter", "Фільтр стану", "Filtr stanu")}
            <select
              id="sanction-status-filter"
              value={sanctionFilter}
              onChange={(event) =>
                setSanctionFilter(event.target.value as "active" | "revoked" | "expired" | "all")
              }
              className="h-10 rounded-xl border border-input bg-surface px-3 text-sm"
            >
              <option value="active">{localText(locale, "Active", "Активні", "Aktywne")}</option>
              <option value="revoked">
                {localText(locale, "Revoked", "Відкликані", "Cofnięte")}
              </option>
              <option value="expired">
                {localText(locale, "Expired", "Завершені", "Wygasłe")}
              </option>
              <option value="all">{localText(locale, "All", "Усі", "Wszystkie")}</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3">
          {loading ? (
            <p role="status" className="py-8 text-sm text-muted-foreground">
              {localText(
                locale,
                "Loading sanctions…",
                "Завантажуємо санкції…",
                "Wczytywanie sankcji…"
              )}
            </p>
          ) : sanctions.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              {localText(
                locale,
                "No sanctions match this state.",
                "Немає санкцій із цим станом.",
                "Brak sankcji o tym stanie."
              )}
            </p>
          ) : (
            sanctions.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      #{item.id} · {moderationValue(locale, item.type)}
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      <Link
                        href={withLocale(locale, `/users/${item.userId}`)}
                        className="font-semibold text-primary-text hover:underline"
                      >
                        {item.userName}
                      </Link>{" "}
                      · ID {item.userId}
                    </p>
                  </div>
                  <ModerationStatus
                    status={item.isActive ? "active" : item.revokedAt ? "revoked" : "expired"}
                    locale={locale}
                  />
                </div>
                <p className="mt-3 whitespace-pre-wrap leading-6">{item.reason}</p>
                <dl className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>
                    <dt className="sr-only">
                      {localText(locale, "Started", "Початок", "Początek")}
                    </dt>
                    <dd>
                      {localText(locale, "Started", "Початок", "Początek")}:{" "}
                      {formatDateTime(item.startsAt, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">{localText(locale, "Ends", "Завершення", "Koniec")}</dt>
                    <dd>
                      {localText(locale, "Ends", "Завершення", "Koniec")}:{" "}
                      {item.endsAt
                        ? formatDateTime(item.endsAt, locale)
                        : localText(locale, "No automatic end", "Без автозавершення", "Bez końca")}
                    </dd>
                  </div>
                </dl>
                {item.isActive ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setRevokeSanctionId(item.id)}
                    className="focus-ring mt-4 min-h-10 rounded-xl border border-destructive/40 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-40"
                  >
                    {localText(locale, "Revoke sanction", "Відкликати санкцію", "Cofnij sankcję")}
                  </button>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
      <section className="rounded-3xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {localText(locale, "Report queue", "Черга скарг", "Kolejka zgłoszeń")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {localText(
                locale,
                `${reports.filter((item) => item.status === "open").length} open reports`,
                `${reports.filter((item) => item.status === "open").length} відкритих скарг`,
                `${reports.filter((item) => item.status === "open").length} otwartych zgłoszeń`
              )}
            </p>
          </div>
          <label htmlFor="report-status-filter" className="grid gap-1 text-xs font-semibold">
            {localText(locale, "Status filter", "Фільтр статусу", "Filtr statusu")}
            <select
              id="report-status-filter"
              value={reportFilter}
              onChange={(event) =>
                setReportFilter(event.target.value as ReportItem["status"] | "all")
              }
              className="h-10 rounded-xl border border-input bg-surface px-3 text-sm"
            >
              <option value="open">{moderationValue(locale, "open")}</option>
              <option value="reviewing">{moderationValue(locale, "reviewing")}</option>
              <option value="resolved">{moderationValue(locale, "resolved")}</option>
              <option value="dismissed">{moderationValue(locale, "dismissed")}</option>
              <option value="all">{localText(locale, "All", "Усі", "Wszystkie")}</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3">
          {loading ? (
            <p role="status" className="py-8 text-sm text-muted-foreground">
              {localText(
                locale,
                "Loading reports…",
                "Завантажуємо скарги…",
                "Wczytywanie zgłoszeń…"
              )}
            </p>
          ) : visibleReports.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              {localText(
                locale,
                "No reports match this status.",
                "Немає скарг із цим статусом.",
                "Brak zgłoszeń o tym statusie."
              )}
            </p>
          ) : null}
          {visibleReports.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    #{item.id} {item.category} · {item.targetType} {item.targetId}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {localText(locale, "Reported by", "Автор скарги", "Zgłoszone przez")}:{" "}
                    {item.reporterName || `#${item.reporterUserId}`} ·{" "}
                    {formatDateTime(item.createdAt, locale)}
                  </p>
                </div>
                <ModerationStatus status={item.status} locale={locale} />
              </div>
              <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {localText(locale, "Reported target", "Об’єкт скарги", "Zgłoszony obiekt")}
                </p>
                <p className="mt-1 font-semibold">
                  {item.targetType === "user" || item.targetType === "project" ? (
                    <Link
                      href={withLocale(
                        locale,
                        item.targetType === "user"
                          ? `/users/${item.targetId}`
                          : `/projects/${item.targetId}`
                      )}
                      className="text-primary-text hover:underline"
                    >
                      {item.targetLabel || `${item.targetType} #${item.targetId}`}
                    </Link>
                  ) : (
                    item.targetLabel || `${item.targetType} #${item.targetId}`
                  )}
                </p>
                {item.targetExcerpt ? (
                  <blockquote className="mt-2 whitespace-pre-wrap border-l-2 border-border pl-3 text-muted-foreground">
                    {item.targetExcerpt}
                  </blockquote>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {localText(locale, "Reporter details", "Деталі скарги", "Szczegóły zgłoszenia")}:
                </span>{" "}
                {item.details || "—"}
              </p>
              <label
                htmlFor={`report-resolution-${item.id}`}
                className="mt-3 grid gap-1.5 font-medium"
              >
                {localText(
                  locale,
                  "Internal resolution note",
                  "Внутрішнє рішення",
                  "Wewnętrzna decyzja"
                )}
                <textarea
                  id={`report-resolution-${item.id}`}
                  value={resolution[`report-${item.id}`] ?? item.resolution ?? ""}
                  onChange={(event) => {
                    setResolution((current) => ({
                      ...current,
                      [`report-${item.id}`]: event.target.value,
                    }));
                    setFieldErrors((errors) => ({
                      ...errors,
                      [`report-${item.id}`]: "",
                    }));
                  }}
                  rows={2}
                  maxLength={2000}
                  aria-invalid={Boolean(fieldErrors[`report-${item.id}`]) || undefined}
                  aria-describedby={
                    fieldErrors[`report-${item.id}`] ? `report-${item.id}-error` : undefined
                  }
                  className="w-full rounded-xl border border-input bg-surface p-2 font-normal"
                />
                <FieldError
                  id={`report-${item.id}-error`}
                  message={fieldErrors[`report-${item.id}`]}
                />
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <AdminButton
                  disabled={busy}
                  onClick={() => void decideReport(item.id, "reviewing")}
                >
                  {localText(locale, "Reviewing", "На розгляді", "W trakcie")}
                </AdminButton>
                <AdminButton disabled={busy} onClick={() => void decideReport(item.id, "resolved")}>
                  {localText(locale, "Resolve", "Вирішити", "Rozwiąż")}
                </AdminButton>
                <AdminButton
                  disabled={busy}
                  onClick={() => void decideReport(item.id, "dismissed")}
                >
                  {localText(locale, "Dismiss", "Відхилити", "Oddal")}
                </AdminButton>
                {item.targetType === "user" ? (
                  <button
                    type="button"
                    onClick={() => setSanctionUserId(String(item.targetId))}
                    className="focus-ring rounded-lg border border-destructive/40 px-3 py-1.5 font-semibold text-destructive"
                  >
                    {localText(
                      locale,
                      "Use user for sanction",
                      "Обрати користувача для санкції",
                      "Użyj użytkownika w sankcji"
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {localText(locale, "Appeals", "Апеляції", "Odwołania")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {localText(
                locale,
                "Every decision requires a written reason.",
                "Кожне рішення потребує письмової причини.",
                "Każda decyzja wymaga pisemnego uzasadnienia."
              )}
            </p>
          </div>
          <label htmlFor="appeal-status-filter" className="grid gap-1 text-xs font-semibold">
            {localText(locale, "Status filter", "Фільтр статусу", "Filtr statusu")}
            <select
              id="appeal-status-filter"
              value={appealFilter}
              onChange={(event) =>
                setAppealFilter(event.target.value as AppealItem["status"] | "all")
              }
              className="h-10 rounded-xl border border-input bg-surface px-3 text-sm"
            >
              <option value="open">{moderationValue(locale, "open")}</option>
              <option value="accepted">{moderationValue(locale, "accepted")}</option>
              <option value="rejected">{moderationValue(locale, "rejected")}</option>
              <option value="all">{localText(locale, "All", "Усі", "Wszystkie")}</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3">
          {!loading && visibleAppeals.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              {localText(
                locale,
                "No appeals match this status.",
                "Немає апеляцій із цим статусом.",
                "Brak odwołań o tym statusie."
              )}
            </p>
          ) : null}
          {visibleAppeals.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold">
                  {localText(locale, "Appeal", "Апеляція", "Odwołanie")} #{item.id} ·{" "}
                  {localText(locale, "sanction", "санкція", "sankcja")} #{item.sanctionId} ·{" "}
                  {localText(locale, "user", "користувач", "użytkownik")} {item.userId}
                </p>
                <ModerationStatus status={item.status} locale={locale} />
              </div>
              <p className="mt-2">{item.message}</p>
              <label
                htmlFor={`appeal-resolution-${item.id}`}
                className="mt-3 grid gap-1.5 font-medium"
              >
                {localText(locale, "Decision reason", "Причина рішення", "Uzasadnienie decyzji")}
                <textarea
                  id={`appeal-resolution-${item.id}`}
                  value={resolution[`appeal-${item.id}`] ?? item.resolution ?? ""}
                  onChange={(event) => {
                    setResolution((current) => ({
                      ...current,
                      [`appeal-${item.id}`]: event.target.value,
                    }));
                    setFieldErrors((current) => ({
                      ...current,
                      [`appeal-${item.id}`]: "",
                    }));
                  }}
                  rows={2}
                  maxLength={2000}
                  aria-invalid={Boolean(fieldErrors[`appeal-${item.id}`]) || undefined}
                  aria-describedby={
                    fieldErrors[`appeal-${item.id}`] ? `appeal-${item.id}-error` : undefined
                  }
                  className="w-full rounded-xl border border-input bg-surface p-2 font-normal"
                />
                <FieldError
                  id={`appeal-${item.id}-error`}
                  message={fieldErrors[`appeal-${item.id}`]}
                />
              </label>
              <div className="mt-2 flex gap-2">
                <AdminButton
                  disabled={busy || item.status !== "open"}
                  onClick={() => void decideAppeal(item.id, "accepted")}
                >
                  {localText(locale, "Accept", "Прийняти", "Uwzględnij")}
                </AdminButton>
                <AdminButton
                  disabled={busy || item.status !== "open"}
                  onClick={() => void decideAppeal(item.id, "rejected")}
                >
                  {localText(locale, "Reject", "Відхилити", "Odrzuć")}
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">
          {localText(locale, "Audit log", "Журнал аудиту", "Dziennik audytu")}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <caption className="sr-only">
              {localText(
                locale,
                "Recent moderation actions",
                "Останні дії модерації",
                "Ostatnie działania moderacyjne"
              )}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="p-2">
                  {localText(locale, "Time", "Час", "Czas")}
                </th>
                <th scope="col">{localText(locale, "Actor", "Виконавець", "Wykonawca")}</th>
                <th scope="col">{localText(locale, "Action", "Дія", "Działanie")}</th>
                <th scope="col">{localText(locale, "Entity", "Об’єкт", "Obiekt")}</th>
                <th scope="col">{localText(locale, "Metadata", "Метадані", "Metadane")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.map((item) => (
                <tr key={item.id}>
                  <td className="p-2">{formatDateTime(item.createdAt, locale)}</td>
                  <td>{item.actorUserId ?? localText(locale, "system", "система", "system")}</td>
                  <td>{item.action}</td>
                  <td>
                    {item.entityType} #{item.entityId}
                  </td>
                  <td className="max-w-sm truncate font-mono">{item.metadataJson}</td>
                </tr>
              ))}
              {!loading && audit.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    {localText(
                      locale,
                      "No audit events yet.",
                      "Подій аудиту ще немає.",
                      "Brak zdarzeń audytu."
                    )}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <ConfirmDialog
        open={revokeSanctionId !== null}
        title={localText(
          locale,
          "Revoke this sanction? The action is permanent and audited.",
          "Відкликати цю санкцію? Дія є остаточною та фіксується в аудиті.",
          "Cofnąć tę sankcję? Działanie jest trwałe i zapisywane w audycie."
        )}
        confirmLabel={localText(locale, "Revoke sanction", "Відкликати", "Cofnij sankcję")}
        cancelLabel={localText(locale, "Cancel", "Скасувати", "Anuluj")}
        danger
        pending={busy}
        onCancel={() => setRevokeSanctionId(null)}
        onConfirm={() => void revokeSanction()}
      />
    </div>
  );
}

function AdminButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="focus-ring rounded-lg border border-border px-3 py-1.5 font-semibold hover:bg-muted disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function FieldError({ id, message }: Readonly<{ id: string; message?: string }>) {
  if (!message) return null;
  return (
    <span id={id} className="text-xs font-normal text-destructive">
      {message}
    </span>
  );
}

function ModerationStatus({ status, locale }: Readonly<{ status: string; locale: Locale }>) {
  const tone =
    status === "resolved" || status === "accepted" || status === "active" || status === "actioned"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "dismissed" ||
          status === "rejected" ||
          status === "revoked" ||
          status === "expired"
        ? "border-border bg-muted text-muted-foreground"
        : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {moderationValue(locale, status)}
    </span>
  );
}

function moderationValue(locale: Locale, value: string) {
  const values: Record<string, [string, string, string]> = {
    open: ["Open", "Відкрита", "Otwarte"],
    reviewing: ["Reviewing", "На розгляді", "W trakcie"],
    resolved: ["Resolved", "Вирішена", "Rozwiązane"],
    actioned: ["Action taken", "Заходів вжито", "Podjęto działanie"],
    dismissed: ["Dismissed", "Відхилена", "Oddalone"],
    accepted: ["Accepted", "Прийнята", "Uwzględnione"],
    rejected: ["Rejected", "Відхилена", "Odrzucone"],
    active: ["Active", "Активна", "Aktywna"],
    revoked: ["Revoked", "Відкликана", "Cofnięta"],
    expired: ["Expired", "Завершена", "Wygasła"],
    warning: ["Warning", "Попередження", "Ostrzeżenie"],
    suspension: ["Suspension", "Призупинення", "Zawieszenie"],
    ban: ["Ban", "Блокування", "Blokada"],
    content_removal: ["Content removal", "Видалення контенту", "Usunięcie treści"],
    child_safety: ["Child safety", "Безпека дитини", "Bezpieczeństwo dziecka"],
    threats: ["Threats", "Погрози", "Groźby"],
    hate: ["Illegal hate", "Незаконна ненависть", "Nielegalna nienawiść"],
    fraud: ["Fraud", "Шахрайство", "Oszustwo"],
    privacy: ["Privacy", "Приватність", "Prywatność"],
    intellectual_property: [
      "Intellectual property",
      "Інтелектуальна власність",
      "Własność intelektualna",
    ],
    other: ["Other", "Інше", "Inne"],
  };
  const labels = values[value.toLowerCase()];
  if (!labels) return value.replaceAll("_", " ");
  return localText(locale, labels[0], labels[1], labels[2]);
}
