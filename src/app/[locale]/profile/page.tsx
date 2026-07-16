import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ProfileContent } from "@/components/profile-content";
import { ProfileLogoutButton } from "@/components/profile-logout-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);

  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={locale} nav={t.nav} />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AuthGuard locale={locale} loadingLabel={t.common.loading}>
          <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <section className="rounded-3xl border border-border bg-surface/75 p-6 sm:p-10">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">{t.profile.title}</h1>
                  <p className="mt-2 text-muted-foreground">{t.profile.subtitle}</p>
                </div>
                <ProfileLogoutButton locale={locale} label={t.profile.logout} />
              </div>
              <ProfileContent locale={locale} messages={t} />
            </section>
          </main>
        </AuthGuard>
      </Suspense>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
