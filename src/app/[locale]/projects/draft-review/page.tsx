import { notFound } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ProjectDraftReviewView } from "@/components/projects/project-draft-review-view";
import { isLocale, localText } from "@/i18n/locales";

export default async function DraftReviewPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}>) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  return (
    <AuthGuard
      locale={locale}
      loadingLabel={localText(
        locale,
        "Checking access…",
        "Перевіряємо доступ…",
        "Sprawdzamy dostęp…"
      )}
    >
      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <ProjectDraftReviewView locale={locale} token={query.token ?? ""} />
      </main>
    </AuthGuard>
  );
}
