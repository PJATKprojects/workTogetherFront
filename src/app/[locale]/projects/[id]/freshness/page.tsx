import { notFound } from "next/navigation";

import { ProjectFreshnessConfirmation } from "@/components/projects/project-freshness-confirmation";
import { isLocale } from "@/i18n/locales";

export default async function ProjectFreshnessPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ token?: string }>;
}>) {
  const [{ locale, id }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale) || !Number.isInteger(Number(id))) notFound();

  return (
    <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <ProjectFreshnessConfirmation
        locale={locale}
        projectId={Number(id)}
        token={query.token ?? ""}
      />
    </main>
  );
}
