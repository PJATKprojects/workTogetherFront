"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";
import { userService } from "@/services/userService";

export function ConfirmEmailContent({
  locale,
  labels,
}: Readonly<{ locale: Locale; labels: SiteMessages["authConfirm"] }>) {
  const params = useSearchParams();
  const token = params.get("token");
  const registered = params.get("registered") === "1";
  const [state, setState] = useState<"loading" | "success" | "error">(
    registered ? "success" : token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    registered ? labels.registered : token ? labels.confirming : labels.missing
  );

  useEffect(() => {
    if (registered || !token) return;
    void userService
      .confirmEmail(token)
      .then((response) => {
        setState("success");
        setMessage(response.message || labels.success);
      })
      .catch(() => {
        setState("error");
        setMessage(labels.invalid);
      });
  }, [labels, registered, token]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full rounded-3xl border border-border bg-surface/80 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">{labels.title}</h1>
        <p
          className={`mt-4 text-sm ${state === "error" ? "text-destructive" : "text-muted-foreground"}`}
        >
          {message}
        </p>
        <Link
          href={withLocale(locale, "/auth/login")}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-primary to-secondary px-4 text-sm font-semibold text-primary-foreground"
        >
          {labels.login}
        </Link>
      </div>
    </main>
  );
}
