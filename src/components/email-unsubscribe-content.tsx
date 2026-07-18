"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { localText, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import api from "@/services/api";

export function EmailUnsubscribeContent({ locale }: Readonly<{ locale: Locale }>) {
  const token = useSearchParams().get("token") ?? "";
  const started = useRef(false);
  const [state, setState] = useState<"loading" | "success" | "error">(token ? "loading" : "error");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) return;
    void api
      .post("/api/notification-preferences/unsubscribe", undefined, {
        params: { token },
        skipAuthRefresh: true,
      })
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token]);

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4">
      <div className="w-full rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-semibold">
          {localText(locale, "Email preferences", "Налаштування email", "Preferencje email")}
        </h1>
        <p
          className={`mt-4 text-sm ${state === "error" ? "text-destructive" : "text-muted-foreground"}`}
        >
          {state === "loading"
            ? localText(
                locale,
                "Updating preferences…",
                "Оновлюємо налаштування…",
                "Aktualizowanie preferencji…"
              )
            : state === "success"
              ? localText(
                  locale,
                  "Optional emails are off. Security and application-decision messages remain enabled.",
                  "Необов’язкові листи вимкнено. Рішення щодо заявок і безпеки залишаться увімкненими.",
                  "Opcjonalne emaile są wyłączone. Wiadomości o bezpieczeństwie i decyzjach dotyczących zgłoszeń pozostają aktywne."
                )
              : localText(
                  locale,
                  "This link is invalid or expired.",
                  "Посилання недійсне або застаріло.",
                  "Ten link jest nieprawidłowy albo wygasł."
                )}
        </p>
        <Link
          href={withLocale(locale, "/profile")}
          className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {localText(locale, "Go to profile", "До профілю", "Przejdź do profilu")}
        </Link>
      </div>
    </main>
  );
}
