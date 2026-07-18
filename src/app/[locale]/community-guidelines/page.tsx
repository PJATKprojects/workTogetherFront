import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { localized, localText } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";

export default async function CommunityGuidelinesPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  const sections = localized<readonly GuidelineSection[]>(locale, {
    en: enSections,
    uk: ukSections,
    pl: plSections,
  });
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={locale} nav={messages.nav} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6"
      >
        <h1 className="text-4xl font-semibold tracking-tight">
          {localText(locale, "Community Guidelines", "Правила спільноти", "Zasady społeczności")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {localText(
            locale,
            "WorkTogether is a place for honest collaboration. These rules apply to profiles, projects, applications, messages, and attachments.",
            "WorkTogether — місце для чесної співпраці. Ці правила поширюються на профілі, проєкти, заявки, повідомлення та вкладення.",
            "WorkTogether jest miejscem uczciwej współpracy. Te zasady dotyczą profili, projektów, zgłoszeń, wiadomości i załączników."
          )}
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <nav
          aria-label={localText(
            locale,
            "Related policies",
            "Пов’язані політики",
            "Powiązane polityki"
          )}
          className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6"
        >
          <Link
            href={withLocale(locale, "/policies")}
            className="focus-ring rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            {localText(locale, "All policies", "Усі політики", "Wszystkie polityki")}
          </Link>
          <Link
            href={withLocale(locale, "/safety#notice-form")}
            className="focus-ring rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {localText(
              locale,
              "Report illegal content",
              "Повідомити про незаконний контент",
              "Zgłoś nielegalną treść"
            )}
          </Link>
        </nav>
      </main>
      <SiteFooter footer={messages.footer} locale={locale} />
    </div>
  );
}

type GuidelineSection = {
  readonly title: string;
  readonly items: readonly string[];
};

const enSections = [
  {
    title: "Respect and safety",
    items: [
      "No harassment, threats, hate, stalking, or sexual pressure.",
      "Do not impersonate people, plagiarize work, run scams, or send spam.",
      "Report concerning users, projects, messages, or files. Blocking prevents direct contact and hides profiles in both directions.",
    ],
  },
  {
    title: "Honest project roles",
    items: [
      "Every role must be labelled unpaid, portfolio, stipend, salary, or equity.",
      "Do not disguise employment or ongoing production work as a learning opportunity.",
      "For equity, state that equity is not guaranteed compensation and document vesting, ownership, and legal terms outside WorkTogether.",
      "For unpaid and portfolio roles, define the learning value, scope, expected hours, duration, and right to leave.",
    ],
  },
  {
    title: "Age policy",
    items: [
      "The minimum age is 18.",
      "Do not create an account for a child or invite a child to collaborate through WorkTogether.",
      "Report any suspected child-safety risk immediately through the illegal-content notice form.",
    ],
  },
  {
    title: "Enforcement and appeals",
    items: [
      "Moderators may warn, restrict, suspend, ban, or remove content based on severity and history.",
      "Every sanction records a reason and, where applicable, an end date in the audit trail.",
      "A sanctioned user can submit one appeal. A different moderator should review it when possible.",
    ],
  },
] as const;

const ukSections = [
  {
    title: "Повага та безпека",
    items: [
      "Заборонені переслідування, погрози, мова ненависті, сталкінг і сексуальний тиск.",
      "Не видавайте себе за інших, не привласнюйте чужі роботи, не шахраюйте й не надсилайте спам.",
      "Скаржтеся на небезпечних користувачів, проєкти, повідомлення чи файли. Блокування забороняє прямий контакт і ховає профілі в обидва боки.",
    ],
  },
  {
    title: "Чесні умови ролей",
    items: [
      "Кожна роль має позначку: unpaid, portfolio, stipend, salary або equity.",
      "Не маскуйте найману чи постійну production-роботу під навчальну можливість.",
      "Для equity поясніть, що частка не є гарантованою оплатою, а vesting, власність і юридичні умови оформлюються поза WorkTogether.",
      "Для unpaid і portfolio ролей вкажіть навчальну користь, обсяг, години, тривалість і право вийти з проєкту.",
    ],
  },
  {
    title: "Вікова політика",
    items: [
      "Мінімальний вік — 18 років.",
      "Не створюйте акаунт для дитини й не запрошуйте дитину до співпраці через WorkTogether.",
      "Про підозру щодо загрози безпеці дитини негайно повідомте через форму незаконного контенту.",
    ],
  },
  {
    title: "Санкції та апеляції",
    items: [
      "Модератори можуть попередити, обмежити, призупинити, заблокувати або видалити контент відповідно до тяжкості й історії порушень.",
      "Кожна санкція має причину та, за потреби, строк в audit log.",
      "Користувач може подати одну апеляцію. За можливості її розглядає інший модератор.",
    ],
  },
] as const;

const plSections = [
  {
    title: "Szacunek i bezpieczeństwo",
    items: [
      "Zakazane są nękanie, groźby, mowa nienawiści, stalking i presja seksualna.",
      "Nie podszywaj się pod inne osoby, nie przywłaszczaj cudzej pracy, nie oszukuj i nie wysyłaj spamu.",
      "Zgłaszaj niebezpiecznych użytkowników, projekty, wiadomości lub pliki. Blokada uniemożliwia bezpośredni kontakt i ukrywa profile po obu stronach.",
    ],
  },
  {
    title: "Uczciwe warunki ról",
    items: [
      "Każda rola musi być oznaczona jako bezpłatna, portfolio, stypendium, wynagrodzenie albo udziały.",
      "Nie przedstawiaj zatrudnienia ani stałej pracy produkcyjnej jako okazji edukacyjnej.",
      "Przy udziałach zaznacz, że nie są gwarantowanym wynagrodzeniem, a vesting, własność i warunki prawne ustalcie poza WorkTogether.",
      "Przy rolach bezpłatnych i portfolio opisz wartość edukacyjną, zakres, liczbę godzin, czas trwania i prawo do odejścia.",
    ],
  },
  {
    title: "Zasady dotyczące wieku",
    items: [
      "Minimalny wiek to 18 lat.",
      "Nie zakładaj konta dla dziecka ani nie zapraszaj dziecka do współpracy przez WorkTogether.",
      "Podejrzenie zagrożenia bezpieczeństwa dziecka zgłoś natychmiast przez formularz nielegalnej treści.",
    ],
  },
  {
    title: "Egzekwowanie zasad i odwołania",
    items: [
      "Moderatorzy mogą ostrzec, ograniczyć, zawiesić, zablokować albo usunąć treść zależnie od wagi i historii naruszeń.",
      "Każda sankcja ma zapisaną przyczynę i, gdy dotyczy, datę końcową w historii audytu.",
      "Osoba objęta sankcją może złożyć jedno odwołanie. Gdy to możliwe, rozpatruje je inny moderator.",
    ],
  },
] as const;
