import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalArticle } from "@/components/legal/legal-article";
import { PrivacyPreferences } from "@/components/legal/privacy-preferences";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { getLegalIdentity } from "@/lib/legal-config";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { title: "Cookies — WorkTogether" };
  const t = getMessages(locale).cookies;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={locale} nav={t.nav} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <LegalArticle doc={t.cookies} shared={t.legal} identity={getLegalIdentity()} />
        <PrivacyPreferences locale={locale} />
      </main>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
