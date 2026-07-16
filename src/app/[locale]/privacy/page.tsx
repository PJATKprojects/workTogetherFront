import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalArticle } from "@/components/legal/legal-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return { title: "Privacy Policy — WorkTogether" };
  }
  const t = getMessages(locale);
  return { title: t.privacy.metaTitle, description: t.privacy.metaDescription };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);

  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={locale} nav={t.nav} />
      <main className="flex-1">
        <LegalArticle doc={t.privacy} shared={t.legal} />
      </main>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
