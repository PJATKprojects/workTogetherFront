import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ConfirmEmailContent } from "@/components/auth/confirm-email-content";
import { getMessages, isLocale } from "@/i18n/config";

export default async function ConfirmEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getMessages(raw);
  return (
    <Suspense
      fallback={
        <main id="main-content" tabIndex={-1} className="grid min-h-[70vh] place-items-center">
          {t.authConfirm.preparing}
        </main>
      }
    >
      <ConfirmEmailContent locale={raw} labels={t.authConfirm} />
    </Suspense>
  );
}
