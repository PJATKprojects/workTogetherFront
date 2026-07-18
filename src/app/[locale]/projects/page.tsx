import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectList } from "@/components/projects/project-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { withLocale } from "@/i18n/paths";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getMessages(locale).projects.metaTitle } : {};
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ savedSearch?: string }>;
}) {
  const { locale: raw } = await params;
  const { savedSearch } = await searchParams;
  if (!isLocale(raw)) notFound();
  const t = getMessages(raw);
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={raw} nav={t.nav} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
      >
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.projects.title}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t.projects.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={withLocale(raw, "/matches")}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-muted"
            >
              {raw === "uk" ? "Мої рекомендації" : "My matches"}
            </Link>
            <Link
              href={withLocale(raw, "/projects/new")}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary-hover"
            >
              {t.projects.createProject}
            </Link>
          </div>
        </div>
        <ProjectList
          locale={raw}
          labels={t.projects}
          common={t.common}
          errors={t.errors}
          initialSavedSearchId={
            Number.isSafeInteger(Number(savedSearch)) ? Number(savedSearch) : undefined
          }
        />
      </main>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
