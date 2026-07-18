import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { SecuritySettings } from "@/components/profile/security-settings";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { withLocale } from "@/i18n/paths";

export default async function SecurityPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={locale} nav={messages.nav} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AuthGuard locale={locale} loadingLabel={messages.common.loading}>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6"
          >
            <Link
              href={withLocale(locale, "/profile")}
              className="text-sm font-semibold text-primary-text hover:underline"
            >
              ← {messages.security.backProfile}
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {messages.security.title}
            </h1>
            <p className="mt-2 text-muted-foreground">{messages.security.subtitle}</p>
            <div className="mt-8">
              <SecuritySettings locale={locale} labels={messages.security} />
            </div>
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={messages.footer} locale={locale} />
    </div>
  );
}
