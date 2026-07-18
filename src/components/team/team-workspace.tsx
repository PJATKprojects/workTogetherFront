"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError } from "@/lib/api-error";
import { formatDate, formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { projectService } from "@/services/projectService";
import { teamService } from "@/services/teamService";
import type {
  ContributionConfirmation,
  ProjectDetail,
  ProjectIntegration,
  ProjectMember,
  ProjectMemberHistory,
  ProjectMilestone,
  TeamCharter,
  TrialSprint,
  WeeklyCheckIn,
} from "@/types";

const emptyCharter: TeamCharter = {
  goal: "",
  definitionOfDone: "",
  roleExpectations: "",
  weeklyHours: "",
  channels: "",
  meetingCadence: "",
  conflictProtocol: "",
};

export function TeamWorkspace({
  projectId,
  locale,
}: Readonly<{ projectId: number; locale: Locale }>) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [roster, setRoster] = useState<ProjectMember[]>([]);
  const [history, setHistory] = useState<ProjectMemberHistory[]>([]);
  const [charter, setCharter] = useState<TeamCharter>(emptyCharter);
  const [sprints, setSprints] = useState<TrialSprint[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>([]);
  const [integrations, setIntegrations] = useState<ProjectIntegration[]>([]);
  const [contributions, setContributions] = useState<ContributionConfirmation[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, r, h, c, s, m, w, i, contributionsResult, conversationResult] = await Promise.all([
        projectService.getById(projectId),
        teamService.roster(projectId),
        teamService.history(projectId),
        teamService.charter(projectId),
        teamService.trialSprints(projectId),
        teamService.milestones(projectId),
        teamService.checkIns(projectId),
        teamService.integrations(projectId),
        teamService.contributions(projectId),
        teamService.conversation(projectId),
      ]);
      setProject(p);
      setRoster(r);
      setHistory(h);
      setCharter(c);
      setSprints(s);
      setMilestones(m);
      setCheckIns(w);
      setIntegrations(i);
      setContributions(contributionsResult);
      setConversationId(conversationResult.conversationId);
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "Team workspace is unavailable.",
            "Командний простір недоступний.",
            "Przestrzeń zespołu jest niedostępna."
          )
        ).message
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, locale]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const me = roster.find((item) => item.userId === user?.id);
  const manager = me?.membershipRole === "owner" || me?.membershipRole === "co_owner";
  const hasPermission = (permission: string) =>
    Boolean(manager || me?.permissions.includes(permission));

  const action = async (key: string, callback: () => Promise<unknown>, message: string) => {
    setBusy(key);
    setError("");
    setSuccess("");
    try {
      await callback();
      setSuccess(message);
      await load();
      await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
    } catch (value) {
      setError(
        getApiError(
          value,
          localText(
            locale,
            "The action could not be completed.",
            "Дію не виконано.",
            "Nie udało się wykonać działania."
          )
        ).message
      );
    } finally {
      setBusy("");
    }
  };

  if (loading)
    return (
      <p className="py-12 text-sm text-muted-foreground">
        {localText(
          locale,
          "Loading team workspace…",
          "Завантаження командного простору…",
          "Wczytywanie przestrzeni zespołu…"
        )}
      </p>
    );
  if (!project || !me)
    return (
      <p className="rounded-2xl bg-destructive/10 p-5 text-destructive">
        {error ||
          localText(
            locale,
            "You are not an active member.",
            "Ви не є активним учасником.",
            "Nie jesteś aktywnym członkiem zespołu."
          )}
      </p>
    );

  return (
    <div className="grid gap-7">
      <header className="rounded-3xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-text">{project.projectName}</p>
            <h1 className="mt-1 text-3xl font-semibold">
              {localText(locale, "Team workspace", "Командний простір", "Przestrzeń zespołu")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {localText(
                locale,
                "A lightweight operating space—not a replacement for Jira.",
                "Невеликий операційний центр — без спроби замінити Jira.",
                "Lekka przestrzeń operacyjna — bez próby zastępowania Jiry."
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={withLocale(
                locale,
                conversationId ? `/messages?conversation=${conversationId}` : "/messages"
              )}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              {localText(locale, "Team chat", "Командний чат", "Czat zespołu")}
            </Link>
            <Link
              href={withLocale(locale, `/projects/${projectId}`)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
            >
              {localText(locale, "Project", "Проєкт", "Projekt")}
            </Link>
          </div>
        </div>
      </header>
      {error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="rounded-xl bg-success/10 p-4 text-sm text-success">
          {success}
        </p>
      ) : null}
      <Roster
        projectId={projectId}
        locale={locale}
        members={roster}
        history={history}
        me={me}
        busy={busy}
        action={action}
      />
      <Charter
        projectId={projectId}
        locale={locale}
        value={charter}
        editable={hasPermission("edit_charter")}
        setValue={setCharter}
        busy={busy}
        action={action}
      />
      <TrialAndMilestones
        projectId={projectId}
        locale={locale}
        manager={Boolean(manager)}
        canManageMilestones={hasPermission("manage_milestones")}
        sprints={sprints}
        milestones={milestones}
        busy={busy}
        action={action}
      />
      <CheckIns
        projectId={projectId}
        locale={locale}
        checkIns={checkIns}
        roster={roster}
        canCheckIn={hasPermission("write_checkin")}
        busy={busy}
        action={action}
      />
      <Integrations
        projectId={projectId}
        locale={locale}
        manager={Boolean(manager)}
        canAdd={hasPermission("manage_integrations")}
        items={integrations}
        busy={busy}
        action={action}
      />
      <Completion
        projectId={projectId}
        locale={locale}
        manager={Boolean(manager)}
        project={project}
        contributions={contributions}
        busy={busy}
        action={action}
      />
    </div>
  );
}

type Action = (key: string, callback: () => Promise<unknown>, message: string) => Promise<void>;

function Roster({
  projectId,
  locale,
  members,
  history,
  me,
  busy,
  action,
}: Readonly<{
  projectId: number;
  locale: Locale;
  members: ProjectMember[];
  history: ProjectMemberHistory[];
  me: ProjectMember;
  busy: string;
  action: Action;
}>) {
  const manager = me.membershipRole !== "member";
  return (
    <Section
      title={localText(locale, "Team roster", "Команда", "Skład zespołu")}
      subtitle={localText(
        locale,
        "Roles, ownership, and a visible join/leave history.",
        "Ролі, власність і прозора історія входу/виходу.",
        "Role, własność i przejrzysta historia dołączeń oraz odejść."
      )}
    >
      <div className="grid gap-3">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
          >
            <div>
              <Link
                href={withLocale(locale, `/users/${member.userId}`)}
                className="font-semibold hover:underline"
              >
                {member.userName}
              </Link>
              <p className="text-xs text-muted-foreground">
                {member.roleName || "—"} · {teamValue(locale, member.membershipRole)} ·{" "}
                {formatDate(member.joinedAt, locale)}
              </p>
              {member.permissions.length ? (
                <p className="mt-1 max-w-xl text-[11px] text-muted-foreground">
                  {member.permissions.map((value) => teamValue(locale, value)).join(" · ")}
                </p>
              ) : null}
            </div>
            {manager && member.membershipRole !== "owner" ? (
              <div className="flex flex-wrap gap-2">
                <select
                  value={member.membershipRole}
                  disabled={busy.length > 0}
                  onChange={(e) =>
                    void action(
                      `role-${member.userId}`,
                      () =>
                        teamService.changeRole(
                          projectId,
                          member.userId,
                          e.target.value as "member" | "co_owner"
                        ),
                      localText(
                        locale,
                        "Role updated.",
                        "Роль оновлено.",
                        "Rola została zaktualizowana."
                      )
                    )
                  }
                  className="h-9 rounded-lg border border-input bg-surface px-2 text-xs"
                >
                  <option value="member">
                    {localText(locale, "Member", "Учасник", "Członek")}
                  </option>
                  <option value="co_owner">
                    {localText(locale, "Co-owner", "Співвласник", "Współwłaściciel")}
                  </option>
                </select>
                <button
                  disabled={busy.length > 0}
                  onClick={() => {
                    const value = window.prompt(
                      localText(
                        locale,
                        "Comma-separated permissions: read_team, write_checkin, edit_charter, manage_milestones, manage_integrations",
                        "Права через кому: read_team, write_checkin, edit_charter, manage_milestones, manage_integrations",
                        "Uprawnienia rozdzielone przecinkami: read_team, write_checkin, edit_charter, manage_milestones, manage_integrations"
                      ),
                      member.permissions.join(", ")
                    );
                    if (value !== null)
                      void action(
                        `permissions-${member.userId}`,
                        () =>
                          teamService.changePermissions(
                            projectId,
                            member.userId,
                            value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                          ),
                        localText(
                          locale,
                          "Permissions updated.",
                          "Права оновлено.",
                          "Uprawnienia zostały zaktualizowane."
                        )
                      );
                  }}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold"
                >
                  {localText(locale, "Permissions", "Права", "Uprawnienia")}
                </button>
                {me.membershipRole === "owner" ? (
                  <button
                    disabled={busy.length > 0}
                    onClick={() =>
                      window.confirm(
                        localText(
                          locale,
                          "Transfer ownership?",
                          "Передати власність?",
                          "Przekazać własność?"
                        )
                      ) &&
                      void action(
                        "transfer",
                        () => teamService.transferOwnership(projectId, member.userId),
                        localText(
                          locale,
                          "Ownership transferred.",
                          "Власність передано.",
                          "Własność została przekazana."
                        )
                      )
                    }
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold"
                  >
                    {localText(locale, "Transfer", "Передати власність", "Przekaż")}
                  </button>
                ) : null}
                <button
                  disabled={busy.length > 0}
                  onClick={() => {
                    const reason = window.prompt(
                      localText(
                        locale,
                        "Reason for removal",
                        "Причина видалення з команди",
                        "Powód usunięcia z zespołu"
                      )
                    );
                    if (reason !== null)
                      void action(
                        `remove-${member.userId}`,
                        () => teamService.removeMember(projectId, member.userId, reason),
                        localText(
                          locale,
                          "Member removed.",
                          "Учасника видалено.",
                          "Osoba została usunięta z zespołu."
                        )
                      );
                  }}
                  className="rounded-lg border border-destructive/40 px-2.5 py-1.5 text-xs font-semibold text-destructive"
                >
                  {localText(locale, "Remove", "Видалити", "Usuń")}
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {me.membershipRole !== "owner" ? (
        <button
          disabled={busy.length > 0}
          onClick={() =>
            window.confirm(
              localText(locale, "Leave this project?", "Вийти з проєкту?", "Opuścić ten projekt?")
            ) &&
            void action(
              "leave",
              () => teamService.leave(projectId),
              localText(
                locale,
                "You left the project.",
                "Ви вийшли з проєкту.",
                "Opuściłeś(-aś) projekt."
              )
            )
          }
          className="mt-4 rounded-xl border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive"
        >
          {localText(locale, "Leave team", "Вийти з команди", "Opuść zespół")}
        </button>
      ) : null}
      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {localText(locale, "Team history", "Історія команди", "Historia zespołu")}
        </summary>
        <div className="mt-3 grid gap-2">
          {history.map((item) => (
            <p key={item.id} className="rounded-xl bg-surface-muted p-3 text-xs">
              {formatDateTime(item.createdAt, locale)} ·{" "}
              {localText(locale, "user", "користувач", "użytkownik")} {item.userId} ·{" "}
              {teamValue(locale, item.action)}
              {item.reason ? ` · ${item.reason}` : ""}
            </p>
          ))}
        </div>
      </details>
    </Section>
  );
}

function Charter({
  projectId,
  locale,
  value,
  editable,
  setValue,
  busy,
  action,
}: Readonly<{
  projectId: number;
  locale: Locale;
  value: TeamCharter;
  editable: boolean;
  setValue: (value: TeamCharter) => void;
  busy: string;
  action: Action;
}>) {
  const fields: Array<[keyof TeamCharter, string]> = [
    ["goal", localText(locale, "Goal", "Мета", "Cel")],
    [
      "definitionOfDone",
      localText(locale, "Definition of done", "Критерій завершення", "Definicja ukończenia"),
    ],
    [
      "roleExpectations",
      localText(locale, "Roles and expectations", "Ролі й очікування", "Role i oczekiwania"),
    ],
    ["weeklyHours", localText(locale, "Weekly hours", "Години", "Godziny tygodniowo")],
    ["channels", localText(locale, "Channels", "Канали", "Kanały")],
    ["meetingCadence", localText(locale, "Meeting cadence", "Ритм зустрічей", "Rytm spotkań")],
    [
      "conflictProtocol",
      localText(locale, "Conflict protocol", "Протокол конфліктів", "Protokół konfliktów"),
    ],
  ];
  return (
    <Section
      title={localText(locale, "Team charter", "Домовленості команди", "Karta zespołu")}
      subtitle={localText(
        locale,
        "Shared agreements to revisit when expectations drift.",
        "Домовленості, до яких можна повернутися, коли очікування розходяться.",
        "Wspólne ustalenia, do których można wrócić, gdy oczekiwania się rozchodzą."
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action(
            "charter",
            () => teamService.saveCharter(projectId, value),
            localText(
              locale,
              "Charter saved.",
              "Домовленості збережено.",
              "Karta zespołu została zapisana."
            )
          );
        }}
        className="grid gap-3 sm:grid-cols-2"
      >
        {fields.map(([key, label]) => (
          <label
            key={key}
            className={`grid gap-1 text-sm font-semibold ${key === "conflictProtocol" || key === "definitionOfDone" ? "sm:col-span-2" : ""}`}
          >
            {label}
            <textarea
              rows={key === "goal" ? 2 : 3}
              maxLength={
                key === "weeklyHours" || key === "channels" || key === "meetingCadence"
                  ? 1000
                  : 3000
              }
              value={String(value[key] ?? "")}
              disabled={!editable}
              onChange={(e) => setValue({ ...value, [key]: e.target.value })}
              className="rounded-xl border border-input bg-surface p-3 font-normal"
            />
          </label>
        ))}
        {editable ? (
          <button
            disabled={busy.length > 0}
            className="justify-self-start rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {localText(locale, "Save charter", "Зберегти домовленості", "Zapisz kartę zespołu")}
          </button>
        ) : null}
      </form>
    </Section>
  );
}

function TrialAndMilestones({
  projectId,
  locale,
  manager,
  canManageMilestones,
  sprints,
  milestones,
  busy,
  action,
}: Readonly<{
  projectId: number;
  locale: Locale;
  manager: boolean;
  canManageMilestones: boolean;
  sprints: TrialSprint[];
  milestones: ProjectMilestone[];
  busy: string;
  action: Action;
}>) {
  const [deliverable, setDeliverable] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [due, setDue] = useState("");
  return (
    <Section
      title={localText(
        locale,
        "Trial sprint and milestones",
        "Пробний спринт і етапи",
        "Sprint próbny i kamienie milowe"
      )}
      subtitle={localText(
        locale,
        "A trial sprint lasts 2–4 weeks and ends with a small verifiable deliverable.",
        "Пробний спринт триває 2–4 тижні та має маленький перевірний результат.",
        "Sprint próbny trwa 2–4 tygodnie i kończy się małym, możliwym do sprawdzenia rezultatem."
      )}
    >
      {manager ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action(
              "sprint",
              () =>
                teamService.createTrialSprint(
                  projectId,
                  deliverable,
                  new Date(start).toISOString(),
                  new Date(end).toISOString()
                ),
              localText(locale, "Sprint created.", "Спринт створено.", "Sprint został utworzony.")
            );
          }}
          className="grid gap-2 md:grid-cols-4"
        >
          <input
            required
            maxLength={3000}
            value={deliverable}
            onChange={(e) => setDeliverable(e.target.value)}
            placeholder={localText(
              locale,
              "Sprint deliverable",
              "Результат спринту",
              "Rezultat sprintu"
            )}
            className="h-11 rounded-xl border border-input bg-surface px-3 md:col-span-2"
          />
          <input
            required
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <input
            required
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <button
            disabled={busy.length > 0}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground md:col-span-4 md:justify-self-start"
          >
            {localText(
              locale,
              "Create trial sprint",
              "Створити пробний спринт",
              "Utwórz sprint próbny"
            )}
          </button>
        </form>
      ) : null}
      <div className="mt-4 grid gap-2">
        {sprints.map((item) => (
          <p key={item.id} className="rounded-xl bg-surface-muted p-3 text-sm">
            <strong>{item.deliverable}</strong>
            <br />
            <span className="text-xs text-muted-foreground">
              {formatDate(item.startsAt, locale)} – {formatDate(item.endsAt, locale)} ·{" "}
              {teamValue(locale, item.status)}
            </span>
          </p>
        ))}
      </div>
      <hr className="my-5 border-border" />
      {canManageMilestones ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action(
              "milestone",
              () =>
                teamService.createMilestone(projectId, {
                  title,
                  description,
                  linkUrl: link || undefined,
                  dueAt: due ? new Date(due).toISOString() : undefined,
                }),
              localText(
                locale,
                "Milestone created.",
                "Етап створено.",
                "Kamień milowy został utworzony."
              )
            );
          }}
          className="grid gap-2 md:grid-cols-2"
        >
          <input
            required
            value={title}
            maxLength={160}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={localText(locale, "Milestone", "Етап", "Kamień milowy")}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <input
            value={description}
            maxLength={3000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={localText(locale, "Short description", "Короткий опис", "Krótki opis")}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <button
            disabled={busy.length > 0}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold md:col-span-2 md:justify-self-start"
          >
            {localText(locale, "Add milestone", "Додати етап", "Dodaj kamień milowy")}
          </button>
        </form>
      ) : null}
      <div className="mt-4 grid gap-2">
        {milestones.map((item) => (
          <button
            key={item.id}
            disabled={!canManageMilestones}
            onClick={() =>
              void action(
                `milestone-${item.id}`,
                () => teamService.toggleMilestone(projectId, item.id),
                localText(
                  locale,
                  "Milestone updated.",
                  "Етап оновлено.",
                  "Kamień milowy został zaktualizowany."
                )
              )
            }
            className={`rounded-xl border p-3 text-left text-sm ${item.completedAt ? "border-success/40 bg-success/10 line-through" : "border-border"}`}
          >
            <strong>{item.title}</strong>
            {item.dueAt ? (
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDate(item.dueAt, locale)}
              </span>
            ) : null}
            <p className="mt-1 text-muted-foreground">{item.description}</p>
          </button>
        ))}
      </div>
    </Section>
  );
}

function CheckIns({
  projectId,
  locale,
  checkIns,
  roster,
  canCheckIn,
  busy,
  action,
}: Readonly<{
  projectId: number;
  locale: Locale;
  checkIns: WeeklyCheckIn[];
  roster: ProjectMember[];
  canCheckIn: boolean;
  busy: string;
  action: Action;
}>) {
  const [done, setDone] = useState("");
  const [blocked, setBlocked] = useState("");
  const [next, setNext] = useState("");
  const names = useMemo(() => new Map(roster.map((m) => [m.userId, m.userName])), [roster]);
  return (
    <Section
      title={localText(locale, "Weekly check-in", "Щотижневий check-in", "Cotygodniowy check-in")}
      subtitle={localText(
        locale,
        "done / blocked / next",
        "зроблено / перешкоди / далі",
        "zrobione / blokady / dalej"
      )}
    >
      {canCheckIn ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action(
              "checkin",
              () => teamService.saveCheckIn(projectId, { done, blocked, next }),
              localText(
                locale,
                "Check-in saved.",
                "Check-in збережено.",
                "Check-in został zapisany."
              )
            );
          }}
          className="grid gap-2 md:grid-cols-3"
        >
          <textarea
            required
            value={done}
            onChange={(e) => setDone(e.target.value)}
            rows={3}
            placeholder={localText(locale, "Done", "Зроблено", "Zrobione")}
            className="rounded-xl border border-input bg-surface p-3"
          />
          <textarea
            value={blocked}
            onChange={(e) => setBlocked(e.target.value)}
            rows={3}
            placeholder={localText(locale, "Blocked", "Перешкоди", "Blokady")}
            className="rounded-xl border border-input bg-surface p-3"
          />
          <textarea
            required
            value={next}
            onChange={(e) => setNext(e.target.value)}
            rows={3}
            placeholder={localText(locale, "Next", "Далі", "Dalej")}
            className="rounded-xl border border-input bg-surface p-3"
          />
          <button
            disabled={busy.length > 0}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground md:col-span-3 md:justify-self-start"
          >
            {localText(locale, "Save check-in", "Зберегти", "Zapisz check-in")}
          </button>
        </form>
      ) : null}
      <div className="mt-4 grid gap-2">
        {checkIns.map((item) => (
          <div key={item.id} className="rounded-xl bg-surface-muted p-3 text-sm">
            <p className="font-semibold">
              {names.get(item.userId) ??
                `${localText(locale, "User", "Користувач", "Użytkownik")} ${item.userId}`}{" "}
              · {item.weekOf}
            </p>
            <p className="mt-1">
              <strong>{localText(locale, "Done:", "Зроблено:", "Zrobione:")}</strong> {item.done}
            </p>
            <p>
              <strong>{localText(locale, "Blocked:", "Перешкоди:", "Blokady:")}</strong>{" "}
              {item.blocked || "—"}
            </p>
            <p>
              <strong>{localText(locale, "Next:", "Далі:", "Dalej:")}</strong> {item.next}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Integrations({
  projectId,
  locale,
  manager,
  canAdd,
  items,
  busy,
  action,
}: Readonly<{
  projectId: number;
  locale: Locale;
  manager: boolean;
  canAdd: boolean;
  items: ProjectIntegration[];
  busy: string;
  action: Action;
}>) {
  const [type, setType] = useState<ProjectIntegration["type"]>("github");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  return (
    <Section
      title={localText(
        locale,
        "Integrations and deep links",
        "Інтеграції та прямі посилання",
        "Integracje i bezpośrednie linki"
      )}
      subtitle={localText(
        locale,
        "Links to the tools your team already uses, without copying them.",
        "Посилання на інструменти, без дублювання їх функцій.",
        "Linki do narzędzi używanych przez zespół, bez kopiowania ich funkcji."
      )}
    >
      {canAdd ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action(
              "integration",
              () => teamService.addIntegration(projectId, { type, url, label: label || undefined }),
              localText(
                locale,
                "Integration added.",
                "Посилання додано.",
                "Integracja została dodana."
              )
            );
          }}
          className="grid gap-2 md:grid-cols-4"
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProjectIntegration["type"])}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          >
            {["github", "discord", "slack", "linear", "trello", "notion"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <input
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="h-11 rounded-xl border border-input bg-surface px-3 md:col-span-2"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={localText(locale, "Label", "Назва", "Etykieta")}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <button
            disabled={busy.length > 0}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold md:col-span-4 md:justify-self-start"
          >
            {localText(locale, "Add deep link", "Додати посилання", "Dodaj bezpośredni link")}
          </button>
        </form>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary-text hover:underline"
            >
              {item.label || item.type}
            </a>
            {manager ? (
              <button
                onClick={() =>
                  void action(
                    `integration-${item.id}`,
                    () => teamService.removeIntegration(projectId, item.id),
                    localText(
                      locale,
                      "Integration removed.",
                      "Посилання видалено.",
                      "Integracja została usunięta."
                    )
                  )
                }
                className="text-destructive"
              >
                ×
              </button>
            ) : null}
          </span>
        ))}
      </div>
    </Section>
  );
}

function Completion({
  projectId,
  locale,
  manager,
  project,
  contributions,
  busy,
  action,
}: Readonly<{
  projectId: number;
  locale: Locale;
  manager: boolean;
  project: ProjectDetail;
  contributions: ContributionConfirmation[];
  busy: string;
  action: Action;
}>) {
  const [outcome, setOutcome] = useState("");
  const [demo, setDemo] = useState("");
  const [repo, setRepo] = useState("");
  const [lessons, setLessons] = useState("");
  const [contribution, setContribution] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Section
      title={localText(
        locale,
        "Completion and contribution",
        "Завершення і внесок",
        "Zakończenie i wkład"
      )}
      subtitle={localText(
        locale,
        "Record the outcome, demo, repository, lessons, and each member’s contribution.",
        "Зафіксуйте результат, demo, repo, уроки та внесок кожного.",
        "Zapisz rezultat, demo, repozytorium, wnioski i wkład każdej osoby."
      )}
    >
      {project.completedAt ? (
        <div className="mb-5 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm">
          <p className="font-semibold">
            {localText(locale, "Project completed", "Проєкт завершено", "Projekt zakończony")} ·{" "}
            {formatDate(project.completedAt, locale)}
          </p>
          <p className="mt-2 whitespace-pre-wrap">{project.outcome}</p>
          {project.projectLink ? (
            <a
              href={project.projectLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-semibold text-primary-text hover:underline"
            >
              {localText(locale, "Repository / demo", "Репозиторій / demo", "Repozytorium / demo")}
            </a>
          ) : null}
          <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
            <strong>
              {localText(locale, "Lessons learned:", "Чого навчилися:", "Czego się nauczyliśmy:")}
            </strong>{" "}
            {project.lessonsLearned}
          </p>
        </div>
      ) : null}
      {manager ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action(
              "complete",
              () =>
                teamService.complete(projectId, {
                  outcome,
                  demoUrl: demo || undefined,
                  repositoryUrl: repo || undefined,
                  lessonsLearned: lessons,
                }),
              localText(
                locale,
                "Project completed.",
                "Проєкт завершено.",
                "Projekt został zakończony."
              )
            );
          }}
          className="grid gap-2 md:grid-cols-2"
        >
          <textarea
            required
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            rows={3}
            placeholder={localText(locale, "Outcome", "Результат", "Rezultat")}
            className="rounded-xl border border-input bg-surface p-3 md:col-span-2"
          />
          <input
            type="url"
            value={demo}
            onChange={(e) => setDemo(e.target.value)}
            placeholder={localText(locale, "Demo URL", "URL demo", "URL demo")}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <input
            type="url"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder={localText(locale, "Repository URL", "URL репозиторію", "URL repozytorium")}
            className="h-11 rounded-xl border border-input bg-surface px-3"
          />
          <textarea
            required
            value={lessons}
            onChange={(e) => setLessons(e.target.value)}
            rows={3}
            placeholder={localText(
              locale,
              "Lessons learned",
              "Чого навчилися",
              "Czego się nauczyliśmy"
            )}
            className="rounded-xl border border-input bg-surface p-3 md:col-span-2"
          />
          <button
            disabled={busy.length > 0}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground md:col-span-2 md:justify-self-start"
          >
            {localText(locale, "Complete project", "Завершити проєкт", "Zakończ projekt")}
          </button>
        </form>
      ) : null}
      <div className="mt-5">
        <textarea
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          rows={3}
          placeholder={localText(locale, "My contribution", "Мій внесок", "Mój wkład")}
          className="w-full rounded-xl border border-input bg-surface p-3"
        />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="accent-primary"
          />
          {localText(
            locale,
            "I confirm this contribution description",
            "Підтверджую точність опису",
            "Potwierdzam poprawność opisu wkładu"
          )}
        </label>
        <button
          disabled={busy.length > 0 || !contribution.trim()}
          onClick={() =>
            void action(
              "contribution",
              () => teamService.confirmContribution(projectId, contribution, confirmed),
              localText(
                locale,
                "Contribution saved.",
                "Внесок збережено.",
                "Wkład został zapisany."
              )
            )
          }
          className="mt-3 rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {localText(locale, "Save contribution", "Зберегти внесок", "Zapisz wkład")}
        </button>
      </div>
      {contributions.length ? (
        <div className="mt-5 grid gap-2">
          <h3 className="font-semibold">
            {localText(
              locale,
              "Team confirmations",
              "Підтвердження команди",
              "Potwierdzenia zespołu"
            )}
          </h3>
          {contributions.map((item) => (
            <div key={item.id} className="rounded-xl bg-surface-muted p-3 text-sm">
              <p className="font-semibold">
                {item.userName} ·{" "}
                {item.confirmed
                  ? localText(locale, "confirmed", "підтверджено", "potwierdzone")
                  : localText(locale, "draft", "чернетка", "wersja robocza")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.contribution}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}

function Section({
  title,
  subtitle,
  children,
}: Readonly<{ title: string; subtitle: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-3xl border border-border bg-surface/85 p-5 sm:p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">{subtitle}</p>
      {children}
    </section>
  );
}

function teamValue(locale: Locale, value: string) {
  const labels: Record<string, [string, string, string]> = {
    owner: ["Owner", "Власник", "Właściciel"],
    co_owner: ["Co-owner", "Співвласник", "Współwłaściciel"],
    member: ["Member", "Учасник", "Członek"],
    read_team: ["View team", "Перегляд команди", "Podgląd zespołu"],
    write_checkin: ["Write check-ins", "Запис check-in", "Dodawanie check-inów"],
    edit_charter: ["Edit charter", "Редагування домовленостей", "Edycja karty zespołu"],
    manage_milestones: ["Manage milestones", "Керування етапами", "Zarządzanie etapami"],
    manage_integrations: [
      "Manage integrations",
      "Керування інтеграціями",
      "Zarządzanie integracjami",
    ],
    joined: ["Joined", "Приєднався(-лася)", "Dołączono"],
    accepted: ["Accepted", "Прийнято", "Przyjęto"],
    role_changed: ["Role changed", "Роль змінено", "Zmieniono rolę"],
    permissions_changed: ["Permissions changed", "Права змінено", "Zmieniono uprawnienia"],
    ownership_transferred: ["Ownership transferred", "Власність передано", "Przekazano własność"],
    removed: ["Removed", "Видалено", "Usunięto"],
    left: ["Left", "Вийшов(-ла)", "Opuszczono"],
    active: ["Active", "Активний", "Aktywny"],
    completed: ["Completed", "Завершений", "Zakończony"],
    cancelled: ["Cancelled", "Скасований", "Anulowany"],
  };
  const match = labels[value.toLowerCase()];
  return match ? localText(locale, match[0], match[1], match[2]) : value.replaceAll("_", " ");
}
