import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { withLocale } from "@/i18n/paths";

export default async function ModerationPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`${withLocale(locale, "/admin")}?section=moderation`);
}
