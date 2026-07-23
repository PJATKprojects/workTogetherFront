"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import {
  adminService,
  type AdminUser,
  type AdminUserQuery,
  type AdminUserStatus,
} from "@/services/adminService";
import type { PagedResult } from "@/types";

type UserAction =
  | { kind: "ban"; user: AdminUser }
  | { kind: "unban"; user: AdminUser }
  | { kind: "delete"; user: AdminUser }
  | null;

const initialQuery: Required<AdminUserQuery> = {
  search: "",
  status: "all",
  role: "all",
  sort: "newest",
  page: 1,
  pageSize: 25,
};

export function UsersAdmin({ locale }: Readonly<{ locale: Locale }>) {
  const labels = getLabels(locale);
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminUserStatus>("all");
  const [role, setRole] = useState<"all" | "admin" | "member">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [result, setResult] = useState<PagedResult<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [action, setAction] = useState<UserAction>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [badgeDraft, setBadgeDraft] = useState<
    Record<number, { type: "domain" | "organization"; label: string }>
  >({});

  const load = useCallback(
    async (parameters: Required<AdminUserQuery>) => {
      setLoading(true);
      setError("");
      try {
        setResult(await adminService.users(parameters));
      } catch (value) {
        setError(getApiError(value, labels.loadError).message);
      } finally {
        setLoading(false);
      }
    },
    [labels.loadError]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(query), 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  const reload = () => load(query);

  const openAction = (next: Exclude<UserAction, null>) => {
    setAction(next);
    setReason("");
    setReasonError("");
    setError("");
    setNotice("");
  };

  const confirmAction = async () => {
    if (!action) return;
    if (action.kind !== "unban" && reason.trim().length < 10) {
      setReasonError(labels.reasonError);
      return;
    }
    setBusy(`${action.kind}-${action.user.id}`);
    setReasonError("");
    try {
      if (action.kind === "ban") {
        await adminService.banUser(action.user.id, reason.trim());
        setNotice(labels.banSuccess.replace("{name}", action.user.userName));
      } else if (action.kind === "unban") {
        if (!action.user.activeRestriction) return;
        await adminService.unbanUser(action.user.activeRestriction.id);
        setNotice(labels.unbanSuccess.replace("{name}", action.user.userName));
      } else {
        await adminService.deleteUser(action.user.id, reason.trim());
        setNotice(labels.deleteSuccess.replace("{name}", action.user.userName));
      }
      setAction(null);
      setReason("");
      await reload();
    } catch (value) {
      setError(getApiError(value, labels.actionError).message);
    } finally {
      setBusy("");
    }
  };

  const grantBadge = async (user: AdminUser) => {
    const value = badgeDraft[user.id] ?? {
      type: "domain" as const,
      label: "",
    };
    if (!value.label.trim()) return;
    setBusy(`grant-${user.id}`);
    setError("");
    try {
      await adminService.grantVerification(user.id, value.type, value.label.trim());
      setBadgeDraft((current) => ({
        ...current,
        [user.id]: { ...value, label: "" },
      }));
      await reload();
    } catch (value) {
      setError(getApiError(value, labels.actionError).message);
    } finally {
      setBusy("");
    }
  };

  const revokeBadge = async (user: AdminUser, type: string) => {
    setBusy(`revoke-${user.id}-${type}`);
    setError("");
    try {
      await adminService.revokeVerification(user.id, type);
      await reload();
    } catch (value) {
      setError(getApiError(value, labels.actionError).message);
    } finally {
      setBusy("");
    }
  };

  const dialogCopy = getDialogCopy(action, labels);
  const users = result?.items ?? [];
  const totalPages = Math.max(1, result?.totalPages ?? 1);

  return (
    <section aria-labelledby="user-directory-title" className="grid gap-5">
      <div>
        <h2 id="user-directory-title" className="text-xl font-semibold">
          {labels.title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{labels.hint}</p>
      </div>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setNotice("");
          setQuery({
            search: search.trim(),
            status,
            role,
            sort,
            page: 1,
            pageSize: query.pageSize,
          });
        }}
        className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_160px_180px_auto]"
      >
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="admin-user-search">
          {labels.search}
          <input
            id="admin-user-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.searchHint}
            className="min-h-11 rounded-xl border border-input bg-background px-3 font-normal"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="admin-user-status">
          {labels.status}
          <select
            id="admin-user-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as AdminUserStatus)}
            className="min-h-11 rounded-xl border border-input bg-background px-3 font-normal"
          >
            <option value="all">{labels.allStatuses}</option>
            <option value="active">{labels.active}</option>
            <option value="banned">{labels.banned}</option>
            <option value="suspended">{labels.suspended}</option>
            <option value="inactive">{labels.inactive}</option>
            <option value="deleted">{labels.deleted}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="admin-user-role">
          {labels.role}
          <select
            id="admin-user-role"
            value={role}
            onChange={(event) => setRole(event.target.value as "all" | "admin" | "member")}
            className="min-h-11 rounded-xl border border-input bg-background px-3 font-normal"
          >
            <option value="all">{labels.allRoles}</option>
            <option value="admin">{labels.admins}</option>
            <option value="member">{labels.members}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="admin-user-sort">
          {labels.sort}
          <select
            id="admin-user-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as "newest" | "oldest" | "name")}
            className="min-h-11 rounded-xl border border-input bg-background px-3 font-normal"
          >
            <option value="newest">{labels.newest}</option>
            <option value="oldest">{labels.oldest}</option>
            <option value="name">{labels.name}</option>
          </select>
        </label>
        <Button type="submit" className="self-end">
          {labels.apply}
        </Button>
      </form>

      <div aria-live="polite" aria-atomic="true">
        {notice ? (
          <p role="status" className="rounded-xl bg-success/10 p-4 text-sm text-success">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {loading
            ? labels.loading
            : labels.resultCount.replace("{count}", String(result?.totalCount ?? 0))}
        </p>
        <p className="font-medium">
          {labels.page
            .replace("{page}", String(result?.page ?? 1))
            .replace("{total}", String(totalPages))}
        </p>
      </div>

      {!loading && users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          {labels.noUsers}
        </div>
      ) : null}

      <ul className="grid gap-4" aria-busy={loading}>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            locale={locale}
            labels={labels}
            busy={busy}
            badgeDraft={
              badgeDraft[user.id] ?? {
                type: "domain",
                label: "",
              }
            }
            onBadgeDraft={(value) =>
              setBadgeDraft((current) => ({
                ...current,
                [user.id]: value,
              }))
            }
            onGrantBadge={() => void grantBadge(user)}
            onRevokeBadge={(type) => void revokeBadge(user, type)}
            onAction={(kind) => openAction({ kind, user })}
          />
        ))}
      </ul>

      {result && result.totalPages > 1 ? (
        <nav
          aria-label={labels.pagination}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3"
        >
          <Button
            type="button"
            variant="secondary"
            disabled={!result.hasPreviousPage || loading}
            onClick={() =>
              setQuery((current) => ({
                ...current,
                page: Math.max(1, current.page - 1),
              }))
            }
          >
            {labels.previous}
          </Button>
          <span className="text-sm font-medium">
            {labels.page
              .replace("{page}", String(result.page))
              .replace("{total}", String(totalPages))}
          </span>
          <Button
            type="button"
            variant="secondary"
            disabled={!result.hasNextPage || loading}
            onClick={() =>
              setQuery((current) => ({
                ...current,
                page: current.page + 1,
              }))
            }
          >
            {labels.next}
          </Button>
        </nav>
      ) : null}

      <ConfirmDialog
        open={action !== null}
        title={dialogCopy.title}
        description={dialogCopy.description}
        confirmLabel={dialogCopy.confirm}
        cancelLabel={labels.cancel}
        danger
        pending={Boolean(busy)}
        confirmDisabled={action?.kind !== "unban" && reason.trim().length < 10}
        onCancel={() => {
          setAction(null);
          setReason("");
          setReasonError("");
        }}
        onConfirm={() => void confirmAction()}
      >
        {action?.kind !== "unban" ? (
          <label className="grid gap-2 text-sm font-medium" htmlFor="admin-user-action-reason">
            {labels.reason}
            <textarea
              id="admin-user-action-reason"
              value={reason}
              maxLength={500}
              rows={4}
              autoFocus
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError("");
              }}
              aria-invalid={Boolean(reasonError) || undefined}
              aria-describedby={
                reasonError ? "admin-user-action-reason-error" : "admin-user-action-reason-hint"
              }
              className="rounded-xl border border-input bg-background px-3 py-2 font-normal"
            />
            <span
              id="admin-user-action-reason-hint"
              className="text-xs font-normal text-muted-foreground"
            >
              {labels.reasonHint}
            </span>
            {reasonError ? (
              <span
                id="admin-user-action-reason-error"
                className="text-xs font-normal text-destructive"
              >
                {reasonError}
              </span>
            ) : null}
          </label>
        ) : null}
      </ConfirmDialog>
    </section>
  );
}

function UserCard({
  user,
  locale,
  labels,
  busy,
  badgeDraft,
  onBadgeDraft,
  onGrantBadge,
  onRevokeBadge,
  onAction,
}: Readonly<{
  user: AdminUser;
  locale: Locale;
  labels: ReturnType<typeof getLabels>;
  busy: string;
  badgeDraft: { type: "domain" | "organization"; label: string };
  onBadgeDraft: (value: { type: "domain" | "organization"; label: string }) => void;
  onGrantBadge: () => void;
  onRevokeBadge: (type: string) => void;
  onAction: (kind: "ban" | "unban" | "delete") => void;
}>) {
  const deleted = Boolean(user.anonymizedAt);
  const badges = [
    user.badges.email ? "Email" : null,
    user.badges.github ? "GitHub" : null,
    user.badges.completedCollaboration ? labels.completedCollaboration : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <li>
      <article className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">
                {deleted ? (
                  <>
                    #{user.id} · {user.userName}
                  </>
                ) : (
                  <Link
                    href={withLocale(locale, `/users/${user.id}`)}
                    className="focus-ring rounded-md hover:text-primary hover:underline"
                  >
                    #{user.id} · {user.userName}
                  </Link>
                )}
              </h3>
              <UserStatus user={user} labels={labels} />
              {user.isAdmin ? <Pill tone="warn">{labels.admin}</Pill> : null}
              {user.isCurrentUser ? <Pill tone="neutral">{labels.currentAccount}</Pill> : null}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Pill key={badge} tone="neutral">
                  {badge}
                </Pill>
              ))}
              {user.badges.attestations.map((badge) => (
                <Pill key={`${badge.type}-${badge.label}`} tone="neutral">
                  {badge.type}: {badge.label}
                </Pill>
              ))}
            </div>
            {user.activeRestriction ? (
              <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm">
                <p className="font-semibold text-destructive">
                  {labels.restriction}: {restrictionLabel(user.activeRestriction.type, labels)}
                </p>
                <p className="mt-1 text-muted-foreground">{user.activeRestriction.reason}</p>
              </div>
            ) : null}
          </div>

          <div className="grid shrink-0 gap-1 text-sm text-muted-foreground sm:grid-cols-3 lg:min-w-64 lg:grid-cols-1 lg:text-right">
            <p>
              {labels.created}: {formatDateTime(user.createdAt, locale)}
            </p>
            <p>
              {labels.sessions}: {user.activeSessions}
            </p>
            <p>
              {labels.loginMethods}: {user.loginMethods.join(", ") || "password"}
            </p>
          </div>
        </div>

        {!deleted ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {!user.isCurrentUser ? (
              user.activeRestriction ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={Boolean(busy)}
                  onClick={() => onAction("unban")}
                >
                  {labels.unban}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={Boolean(busy)}
                  onClick={() => onAction("ban")}
                >
                  {labels.ban}
                </Button>
              )
            ) : null}
            {!user.isCurrentUser ? (
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={Boolean(busy)}
                onClick={() => onAction("delete")}
              >
                {labels.deleteAccount}
              </Button>
            ) : null}
          </div>
        ) : null}

        {!deleted ? (
          <details className="mt-4 border-t border-border pt-4">
            <summary className="focus-ring w-fit cursor-pointer rounded-md text-sm font-semibold">
              {labels.manageBadges}
            </summary>
            <div className="mt-3 grid gap-3">
              {user.badges.attestations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.badges.attestations.map((badge) => (
                    <Button
                      key={`revoke-${badge.type}`}
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy === `revoke-${user.id}-${badge.type}`}
                      onClick={() => onRevokeBadge(badge.type)}
                    >
                      {labels.revoke}: {badge.label}
                    </Button>
                  ))}
                </div>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-[170px_1fr_auto]">
                <label className="grid gap-1 text-xs font-semibold">
                  {labels.badgeType}
                  <select
                    value={badgeDraft.type}
                    onChange={(event) =>
                      onBadgeDraft({
                        ...badgeDraft,
                        type: event.target.value as "domain" | "organization",
                      })
                    }
                    className="min-h-10 rounded-xl border border-input bg-background px-3 text-sm font-normal"
                  >
                    <option value="domain">{labels.domain}</option>
                    <option value="organization">{labels.organization}</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold">
                  {labels.badgeLabel}
                  <input
                    value={badgeDraft.label}
                    maxLength={160}
                    onChange={(event) =>
                      onBadgeDraft({
                        ...badgeDraft,
                        label: event.target.value,
                      })
                    }
                    className="min-h-10 rounded-xl border border-input bg-background px-3 text-sm font-normal"
                  />
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="self-end"
                  disabled={!badgeDraft.label.trim() || busy === `grant-${user.id}`}
                  onClick={onGrantBadge}
                >
                  {labels.grant}
                </Button>
              </div>
            </div>
          </details>
        ) : null}
      </article>
    </li>
  );
}

function UserStatus({
  user,
  labels,
}: Readonly<{
  user: AdminUser;
  labels: ReturnType<typeof getLabels>;
}>) {
  if (user.anonymizedAt) return <Pill tone="bad">{labels.deleted}</Pill>;
  if (user.activeRestriction?.type === "ban") return <Pill tone="bad">{labels.banned}</Pill>;
  if (user.activeRestriction?.type === "suspension")
    return <Pill tone="warn">{labels.suspended}</Pill>;
  if (!user.isActive) return <Pill tone="bad">{labels.inactive}</Pill>;
  return <Pill tone="good">{labels.active}</Pill>;
}

function Pill({
  tone,
  children,
}: Readonly<{
  tone: "good" | "warn" | "bad" | "neutral";
  children: React.ReactNode;
}>) {
  const className = {
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    bad: "border-destructive/30 bg-destructive/10 text-destructive",
    neutral: "border-border bg-muted text-muted-foreground",
  }[tone];
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function restrictionLabel(type: "ban" | "suspension", labels: ReturnType<typeof getLabels>) {
  return type === "ban" ? labels.banned : labels.suspended;
}

function getDialogCopy(action: UserAction, labels: ReturnType<typeof getLabels>) {
  if (action?.kind === "ban") {
    return {
      title: labels.banTitle.replace("{name}", action.user.userName),
      description: labels.banDescription,
      confirm: labels.confirmBan,
    };
  }
  if (action?.kind === "unban") {
    return {
      title: labels.unbanTitle.replace("{name}", action.user.userName),
      description: labels.unbanDescription,
      confirm: labels.confirmUnban,
    };
  }
  return {
    title: labels.deleteTitle.replace("{name}", action?.user.userName ?? ""),
    description: labels.deleteDescription,
    confirm: labels.confirmDelete,
  };
}

function getLabels(locale: Locale) {
  const t = (en: string, uk: string, pl: string) => localText(locale, en, uk, pl);
  return {
    title: t("User directory", "Каталог користувачів", "Lista użytkowników"),
    hint: t(
      "Search every account, filter its state and apply audited moderation actions. Account deletion immediately disables access and anonymizes personal data.",
      "Шукайте всі облікові записи, фільтруйте їхній стан і застосовуйте дії з аудитом. Видалення одразу вимикає доступ та анонімізує персональні дані.",
      "Wyszukuj wszystkie konta, filtruj ich stan i stosuj działania zapisywane w audycie. Usunięcie natychmiast blokuje dostęp i anonimizuje dane osobowe."
    ),
    search: t("Search", "Пошук", "Szukaj"),
    searchHint: t(
      "Username, user ID, or exact email",
      "Ім’я, ID або точний email",
      "Nazwa, ID lub dokładny e-mail"
    ),
    status: t("Account status", "Стан облікового запису", "Status konta"),
    role: t("Role", "Роль", "Rola"),
    sort: t("Sort", "Сортування", "Sortowanie"),
    allStatuses: t("All statuses", "Усі стани", "Wszystkie statusy"),
    active: t("Active", "Активний", "Aktywne"),
    banned: t("Banned", "Заблокований", "Zablokowane"),
    suspended: t("Suspended", "Призупинений", "Zawieszone"),
    inactive: t("Inactive", "Неактивний", "Nieaktywne"),
    deleted: t("Deleted", "Видалений", "Usunięte"),
    allRoles: t("All roles", "Усі ролі", "Wszystkie role"),
    admins: t("Administrators", "Адміністратори", "Administratorzy"),
    members: t("Members", "Користувачі", "Użytkownicy"),
    newest: t("Newest first", "Спочатку нові", "Najnowsze"),
    oldest: t("Oldest first", "Спочатку старі", "Najstarsze"),
    name: t("Name A–Z", "Ім’я А–Я", "Nazwa A–Z"),
    apply: t("Apply filters", "Застосувати фільтри", "Zastosuj filtry"),
    loading: t("Loading users…", "Завантаження користувачів…", "Wczytywanie użytkowników…"),
    loadError: t(
      "Could not load the user directory.",
      "Не вдалося завантажити каталог користувачів.",
      "Nie udało się wczytać listy użytkowników."
    ),
    actionError: t(
      "The user action failed.",
      "Не вдалося виконати дію.",
      "Działanie na koncie nie powiodło się."
    ),
    resultCount: t(
      "{count} accounts found",
      "Знайдено облікових записів: {count}",
      "Znaleziono kont: {count}"
    ),
    page: t("Page {page} of {total}", "Сторінка {page} з {total}", "Strona {page} z {total}"),
    pagination: t("User pagination", "Сторінки користувачів", "Strony użytkowników"),
    previous: t("Previous", "Назад", "Poprzednia"),
    next: t("Next", "Далі", "Następna"),
    noUsers: t(
      "No accounts match these filters.",
      "Жоден обліковий запис не відповідає фільтрам.",
      "Żadne konto nie pasuje do filtrów."
    ),
    currentAccount: t("Your account", "Ваш обліковий запис", "Twoje konto"),
    admin: t("Admin", "Адмін", "Admin"),
    restriction: t("Active restriction", "Активне обмеження", "Aktywne ograniczenie"),
    created: t("Created", "Створено", "Utworzono"),
    sessions: t("Active sessions", "Активні сесії", "Aktywne sesje"),
    loginMethods: t("Login", "Вхід", "Logowanie"),
    completedCollaboration: t(
      "Completed collaboration",
      "Завершена співпраця",
      "Ukończona współpraca"
    ),
    ban: t("Ban account", "Заблокувати", "Zablokuj konto"),
    unban: t("Remove ban", "Зняти блокування", "Odblokuj konto"),
    deleteAccount: t("Delete account", "Видалити обліковий запис", "Usuń konto"),
    manageBadges: t(
      "Manage verification badges",
      "Керувати позначками перевірки",
      "Zarządzaj odznakami weryfikacji"
    ),
    badgeType: t("Badge type", "Тип позначки", "Typ odznaki"),
    badgeLabel: t("Badge label", "Назва позначки", "Nazwa odznaki"),
    domain: t("Domain", "Домен", "Domena"),
    organization: t("Organization", "Організація", "Organizacja"),
    grant: t("Grant badge", "Додати позначку", "Nadaj odznakę"),
    revoke: t("Revoke", "Відкликати", "Cofnij"),
    banTitle: t("Ban {name}?", "Заблокувати {name}?", "Zablokować {name}?"),
    banDescription: t(
      "The account will immediately lose access except to logout and the appeal flow. The reason is visible in the moderation record.",
      "Обліковий запис одразу втратить доступ, крім виходу та подання апеляції. Причина зберігається в записі модерації.",
      "Konto natychmiast straci dostęp poza wylogowaniem i odwołaniem. Powód zostanie zapisany w moderacji."
    ),
    unbanTitle: t(
      "Remove the ban from {name}?",
      "Зняти блокування з {name}?",
      "Odblokować {name}?"
    ),
    unbanDescription: t(
      "The active restriction will be revoked and the account can use the service again.",
      "Активне обмеження буде відкликано, і обліковий запис знову матиме доступ.",
      "Aktywne ograniczenie zostanie cofnięte, a konto odzyska dostęp."
    ),
    deleteTitle: t(
      "Permanently delete {name}?",
      "Назавжди видалити {name}?",
      "Trwale usunąć {name}?"
    ),
    deleteDescription: t(
      "This immediately revokes every session and anonymizes personal data. Team and audit history stays as a deleted-user record. This cannot be undone.",
      "Це одразу відкликає всі сесії та анонімізує персональні дані. Історія команд і аудиту зберігається як запис видаленого користувача. Дію не можна скасувати.",
      "Wszystkie sesje zostaną natychmiast cofnięte, a dane osobowe zanonimizowane. Historia zespołów i audytu pozostanie jako zapis usuniętego użytkownika. Tej operacji nie można cofnąć."
    ),
    reason: t("Reason", "Причина", "Powód"),
    reasonHint: t(
      "Enter at least 10 characters. The reason is stored in the audit trail.",
      "Введіть щонайменше 10 символів. Причина зберігається в аудиті.",
      "Wpisz co najmniej 10 znaków. Powód zostanie zapisany w audycie."
    ),
    reasonError: t(
      "Enter a reason of at least 10 characters.",
      "Введіть причину щонайменше з 10 символів.",
      "Wpisz powód zawierający co najmniej 10 znaków."
    ),
    cancel: t("Cancel", "Скасувати", "Anuluj"),
    confirmBan: t("Ban account", "Заблокувати", "Zablokuj konto"),
    confirmUnban: t("Remove ban", "Зняти блокування", "Odblokuj konto"),
    confirmDelete: t("Delete permanently", "Видалити назавжди", "Usuń trwale"),
    banSuccess: t("{name} was banned.", "{name} заблоковано.", "Konto {name} zostało zablokowane."),
    unbanSuccess: t(
      "The ban was removed from {name}.",
      "Блокування з {name} знято.",
      "Konto {name} zostało odblokowane."
    ),
    deleteSuccess: t(
      "{name} was deleted and anonymized.",
      "{name} видалено й анонімізовано.",
      "Konto {name} zostało usunięte i zanonimizowane."
    ),
  };
}
