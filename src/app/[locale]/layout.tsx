import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocaleHtmlAttributes } from "@/components/locale-html-attributes";
import { getMessages } from "@/i18n/config";
import { isLocale, locales, type Locale } from "@/i18n/locales";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): { locale: Locale }[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    return { title: "WorkTogether", description: "Teams for your projects." };
  }

  const m = getMessages(raw);

  return {
    title: m.meta.title,
    description: m.meta.description,
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    notFound();
  }

  return (
    <>
      <LocaleHtmlAttributes locale={raw} />
      {children}
    </>
  );
}
