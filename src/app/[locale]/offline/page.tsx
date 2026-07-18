import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandMark } from "@/components/brand/logo";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

export default async function OfflinePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const text = copy(locale);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <BrandMark className="size-14" rounded="rounded-2xl" />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{text.title}</h1>
      <p className="mt-3 max-w-md leading-7 text-muted-foreground">{text.body}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a
          href={withLocale(locale, "/offline")}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          {text.retry}
        </a>
        <Link
          href={withLocale(locale, "/")}
          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold"
        >
          {text.home}
        </Link>
      </div>
    </main>
  );
}

function copy(locale: Locale) {
  const values = {
    en: {
      title: "You’re offline",
      body: "The WorkTogether shell is available, but live projects, messages, and account data need a connection. Nothing you typed was sent.",
      retry: "Try again",
      home: "Open cached home",
    },
    uk: {
      title: "Немає з’єднання",
      body: "Оболонка WorkTogether доступна, але для актуальних проєктів, повідомлень і даних акаунта потрібен інтернет. Введені дані не надсилалися.",
      retry: "Спробувати знову",
      home: "Відкрити збережену головну",
    },
    pl: {
      title: "Brak połączenia",
      body: "Powłoka WorkTogether jest dostępna, ale aktualne projekty, wiadomości i dane konta wymagają internetu. Wpisane dane nie zostały wysłane.",
      retry: "Spróbuj ponownie",
      home: "Otwórz zapisaną stronę główną",
    },
  };
  return values[locale];
}
