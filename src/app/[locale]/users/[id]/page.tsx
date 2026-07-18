import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackLink } from "@/components/ui/back-link";
import { PublicProfileView } from "@/components/users/public-profile-view";
import { getMessages, isLocale } from "@/i18n/config";

type Props = Readonly<{ params: Promise<{ locale: string; id: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return { title: "Profile — WorkTogether" };
  }
  return { title: getMessages(locale).publicProfile.metaTitle };
}

export default async function PublicUserPage({ params }: Props) {
  const { locale, id } = await params;
  const userId = Number(id);
  if (!isLocale(locale) || !Number.isInteger(userId) || userId < 1) notFound();
  const t = getMessages(locale);

  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={locale} nav={t.nav} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
      >
        <BackLink href={`/${locale}/students`} label={t.common.back} />
        <PublicProfileView userId={userId} locale={locale} messages={t} />
      </main>
      <SiteFooter footer={t.footer} locale={locale} />
    </div>
  );
}
