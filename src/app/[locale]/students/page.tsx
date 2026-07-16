import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudentList } from "@/components/students/student-list";
import { getMessages, isLocale } from "@/i18n/config";

export default async function StudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getMessages(raw);
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={raw} nav={t.nav} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.students.title}</h1>
        <p className="mt-3 mb-8 max-w-2xl text-muted-foreground">{t.students.subtitle}</p>
        <StudentList messages={t} locale={raw} />
      </main>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
