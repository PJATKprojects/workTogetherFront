import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EmailUnsubscribeContent } from "@/components/email-unsubscribe-content";
import { isLocale } from "@/i18n/config";

export default async function UnsubscribePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <EmailUnsubscribeContent locale={locale} />
    </Suspense>
  );
}
