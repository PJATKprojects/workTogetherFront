import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProPlans } from "@/components/billing/pro-plans";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { proCopy } from "@/i18n/pro-copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const text = proCopy(locale);
  return { title: `${text.eyebrow} — WorkTogether`, description: text.subtitle };
}

export default async function ProPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const messages = getMessages(raw);
  const text = proCopy(raw);

  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={raw} nav={messages.nav} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-16"
      >
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-text">
            {text.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{text.subtitle}</p>
        </header>
        <div className="mt-10">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-muted" />}>
            <ProPlans locale={raw} />
          </Suspense>
        </div>
      </main>
      <SiteFooter footer={messages.footer} locale={raw} />
    </div>
  );
}
