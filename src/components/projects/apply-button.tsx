"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApplicationMutations } from "@/hooks/use-application-mutations";
import { useAuth } from "@/hooks/use-auth";
import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getApiError, getApiStatus, getPlanLimitCode } from "@/lib/api-error";
import { proCopy } from "@/i18n/pro-copy";
import { readLocalDraft, removeLocalDraft, writeLocalDraft } from "@/lib/local-draft";
import type { SiteMessages } from "@/messages/types";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type ApplicationLocalDraft = {
  clientRequestId: string;
  link: string;
  note: string;
  whyProject: string;
  firstWeekPlan: string;
  availability: string;
};

const applicationDraftVersion = 1;
const applicationDraftMaxAge = 30 * 24 * 60 * 60 * 1000;

/**
 * Apply flow: the button expands into a small inline form asking for the
 * required CV / LinkedIn / GitHub link (prefilled from the profile when
 * available) — the owner reviews candidates through that link.
 */
export function ApplyButton({
  projectId,
  positionId,
  locale,
  labels,
  errors,
  alreadyApplied = false,
}: Readonly<{
  projectId: number;
  positionId: number;
  locale: Locale;
  labels: SiteMessages["projects"];
  errors: SiteMessages["errors"];
  /** Server-computed: the current user already has an application here. */
  alreadyApplied?: boolean;
}>) {
  const { isAuthenticated, user } = useAuth();
  const { apply } = useApplicationMutations(projectId);
  const router = useRouter();
  const inputId = useId();
  const noteId = useId();
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [whyProject, setWhyProject] = useState("");
  const [firstWeekPlan, setFirstWeekPlan] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [planLimited, setPlanLimited] = useState(false);
  const [clientRequestId, setClientRequestId] = useState(() => crypto.randomUUID());
  const [draftRestored, setDraftRestored] = useState(false);
  const hydratedDraftKey = useRef<string | null>(null);
  const draftKey = user ? `wt:draft:application:user:${user.id}:position:${positionId}` : null;

  useEffect(() => {
    if (!draftKey || hydratedDraftKey.current === draftKey) return;
    const draft = readLocalDraft<unknown>(
      draftKey,
      applicationDraftVersion,
      applicationDraftMaxAge
    );
    if (!isApplicationLocalDraft(draft)) {
      hydratedDraftKey.current = draftKey;
      return;
    }

    const timer = window.setTimeout(() => {
      if (hydratedDraftKey.current === draftKey) return;
      hydratedDraftKey.current = draftKey;
      setClientRequestId(draft.clientRequestId);
      setLink(draft.link);
      setNote(draft.note);
      setWhyProject(draft.whyProject);
      setFirstWeekPlan(draft.firstWeekPlan);
      setAvailability(draft.availability);
      setDraftRestored(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || hydratedDraftKey.current !== draftKey || !clientRequestId) {
      return;
    }
    const value: ApplicationLocalDraft = {
      clientRequestId,
      link,
      note,
      whyProject,
      firstWeekPlan,
      availability,
    };
    const persist = () => {
      if (
        !link.trim() &&
        !note.trim() &&
        !whyProject.trim() &&
        !firstWeekPlan.trim() &&
        !availability.trim()
      ) {
        removeLocalDraft(draftKey);
        return;
      }
      writeLocalDraft(draftKey, applicationDraftVersion, value);
    };
    const timer = window.setTimeout(persist, 400);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", persist);
    };
  }, [availability, clientRequestId, draftKey, firstWeekPlan, link, note, whyProject]);

  const applied = alreadyApplied || message === labels.applied;

  const onOpen = () => {
    if (!isAuthenticated) {
      const returnUrl = withLocale(locale, `/projects/${projectId}`);
      router.push(
        `${withLocale(locale, "/auth/login")}?returnUrl=${encodeURIComponent(returnUrl)}`
      );
      return;
    }

    // Prefill with the best link we know about from the user's own profile.
    if (!link) {
      setLink(user?.cv || user?.linkedInProfile || user?.githubProfile || "");
    }
    setMessage("");
    setOpen(true);
  };

  const saveApplication = async (isDraft: boolean) => {
    const trimmed = link.trim();
    if ((!isDraft || trimmed.length > 0) && !isHttpUrl(trimmed)) {
      setValidationError(labels.applyAttachInvalid);
      return;
    }

    setValidationError("");
    setMessage("");
    setPlanLimited(false);
    try {
      const trimmedNote = note.trim();
      await apply.mutateAsync({
        clientRequestId,
        projectPositionId: positionId,
        attachmentUrl: trimmed,
        ...(trimmedNote ? { message: trimmedNote } : {}),
        whyProject: whyProject.trim(),
        firstWeekPlan: firstWeekPlan.trim(),
        availability: availability.trim(),
        isDraft,
      });
      setMessage(
        isDraft
          ? localText(
              locale,
              "Draft saved in My applications.",
              "Чернетку збережено у ваших заявках.",
              "Wersja robocza została zapisana w Moich zgłoszeniach."
            )
          : labels.applied
      );
      if (draftKey) removeLocalDraft(draftKey);
      setClientRequestId(crypto.randomUUID());
      setLink("");
      setNote("");
      setWhyProject("");
      setFirstWeekPlan("");
      setAvailability("");
      setDraftRestored(false);
      setOpen(false);
    } catch (error) {
      const status = getApiStatus(error);
      if (status === 402) {
        setPlanLimited(Boolean(getPlanLimitCode(error)));
        setMessage(getApiError(error, proCopy(locale).weeklyLimit).message);
      } else if (status === 409) setMessage(labels.alreadyApplied);
      else if (status === 422) setMessage(getApiError(error, errors.businessRule).message);
      else if (status === 429) setMessage(errors.tooManyRequests);
      else setMessage(getApiError(error, errors.generic).message);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void saveApplication(false);
  };

  if (!open || applied) {
    return (
      <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
        <Button type="button" disabled={apply.isPending || applied} onClick={onOpen}>
          {apply.isPending ? labels.applying : applied ? labels.applied : labels.apply}
        </Button>
        {applied ? (
          <p className="sr-only" role="status">
            {labels.applied}
          </p>
        ) : message ? (
          <p className="max-w-xs text-xs text-destructive" role="alert">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl border border-border bg-surface-muted/70 p-4 sm:max-w-sm"
    >
      <p className="text-sm font-semibold text-foreground">{labels.applyAttachTitle}</p>
      {draftRestored ? (
        <p role="status" className="mt-2 text-xs font-medium text-success">
          {localText(
            locale,
            "Your saved application draft was restored.",
            "Вашу збережену чернетку заявки відновлено.",
            "Przywrócono zapisany szkic zgłoszenia."
          )}
        </p>
      ) : null}
      <label htmlFor={inputId} className="mt-3 block text-xs font-medium text-muted-foreground">
        {labels.applyAttachLabel}
      </label>
      <Input
        id={inputId}
        type="url"
        inputMode="url"
        required
        value={link}
        onChange={(event) => setLink(event.target.value)}
        placeholder={labels.applyAttachPlaceholder}
        className="mt-1.5"
      />
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{labels.applyAttachHint}</p>
      <label htmlFor={noteId} className="mt-3 block text-xs font-medium text-muted-foreground">
        {labels.applyMessageLabel}
      </label>
      <Textarea
        id={noteId}
        value={note}
        maxLength={2000}
        onChange={(event) => setNote(event.target.value)}
        placeholder={labels.applyMessagePlaceholder}
        className="mt-1.5 min-h-24 text-sm"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setWhyProject(
              localText(
                locale,
                "The project goal resonates with me, and my experience can help the team.",
                "Мені близька мета проєкту, і мій досвід може допомогти команді.",
                "Cel projektu jest mi bliski, a moje doświadczenie może pomóc zespołowi."
              )
            );
            setFirstWeekPlan(
              localText(
                locale,
                "In week one I will clarify requirements, set up the environment, and ship a small deliverable.",
                "У перший тиждень я уточню вимоги, налаштую середовище та зроблю невеликий deliverable.",
                "W pierwszym tygodniu doprecyzuję wymagania, skonfiguruję środowisko i dostarczę mały rezultat."
              )
            );
          }}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
        >
          {localText(locale, "Use cover template", "Заповнити шаблон", "Użyj szablonu")}
        </button>
      </div>
      <label className="mt-3 block text-xs font-medium text-muted-foreground">
        {localText(locale, "Why this project", "Чому цей проєкт", "Dlaczego ten projekt")}
      </label>
      <Textarea
        value={whyProject}
        maxLength={2000}
        onChange={(event) => setWhyProject(event.target.value)}
        placeholder={localText(
          locale,
          "What motivates you and how you complement the team",
          "Що вас мотивує і як ваш досвід доповнює команду",
          "Co Cię motywuje i w jaki sposób uzupełniasz zespół"
        )}
        className="mt-1.5 min-h-20 text-sm"
      />
      <label className="mt-3 block text-xs font-medium text-muted-foreground">
        {localText(
          locale,
          "What you can do in week one",
          "Що зробите за перший тиждень",
          "Co możesz zrobić w pierwszym tygodniu"
        )}
      </label>
      <Textarea
        value={firstWeekPlan}
        maxLength={2000}
        onChange={(event) => setFirstWeekPlan(event.target.value)}
        className="mt-1.5 min-h-20 text-sm"
      />
      <label className="mt-3 block text-xs font-medium text-muted-foreground">
        {localText(locale, "Availability", "Доступність", "Dostępność")}
      </label>
      <Input
        value={availability}
        maxLength={500}
        onChange={(event) => setAvailability(event.target.value)}
        placeholder={localText(
          locale,
          "e.g. 8 h/week, UTC+2, evenings",
          "Напр. 8 год/тиждень, UTC+2, вечори",
          "np. 8 godz./tydzień, UTC+2, wieczory"
        )}
        className="mt-1.5"
      />
      {validationError ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {validationError}
        </p>
      ) : null}
      {message && !applied ? (
        <div className="mt-2 text-xs text-destructive" role="alert">
          <p>{message}</p>
          {planLimited ? (
            <Link
              href={withLocale(locale, "/pro")}
              className="mt-1 inline-flex font-semibold underline underline-offset-2"
            >
              {proCopy(locale).upgrade}
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" disabled={apply.isPending}>
          {apply.isPending ? labels.applying : labels.applySubmit}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={apply.isPending}
          onClick={() => void saveApplication(true)}
        >
          {localText(locale, "Save draft", "Зберегти чернетку", "Zapisz wersję roboczą")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {labels.applyCancel}
        </Button>
      </div>
    </form>
  );
}

function isApplicationLocalDraft(value: unknown): value is ApplicationLocalDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<ApplicationLocalDraft>;
  return (
    typeof draft.clientRequestId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      draft.clientRequestId
    ) &&
    typeof draft.link === "string" &&
    draft.link.length <= 2048 &&
    typeof draft.note === "string" &&
    draft.note.length <= 2000 &&
    typeof draft.whyProject === "string" &&
    draft.whyProject.length <= 2000 &&
    typeof draft.firstWeekPlan === "string" &&
    draft.firstWeekPlan.length <= 2000 &&
    typeof draft.availability === "string" &&
    draft.availability.length <= 500
  );
}
