import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { withLocale } from "@/i18n/paths";
import { getLegalIdentity } from "@/lib/legal-config";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { title: "Policies — WorkTogether" };
  const t = getMessages(locale).policyHub;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function PoliciesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  const t = messages.policyHub;
  const identity = getLegalIdentity();
  const cards = [
    { href: "/terms", copy: t.cards.terms },
    { href: "/privacy", copy: t.cards.privacy },
    { href: "/cookies", copy: t.cards.cookies },
    { href: "/community-guidelines", copy: t.cards.community },
    { href: "/safety", copy: t.cards.safety },
    { href: "/accessibility", copy: t.cards.accessibility },
  ] as const;

  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={locale} nav={messages.nav} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-text">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t.title}</h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{t.intro}</p>
          </header>

          {identity.isDraft ? (
            <div
              role="alert"
              className="mt-8 max-w-3xl rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6"
            >
              <p className="font-semibold">{messages.legal.draftTitle}</p>
              <p className="mt-1 text-muted-foreground">{messages.legal.draftBody}</p>
            </div>
          ) : null}

          <section
            aria-labelledby="pilot-scope"
            className="mt-8 rounded-3xl border border-primary/20 bg-primary/10 p-6 sm:p-8"
          >
            <h2 id="pilot-scope" className="text-xl font-semibold">
              {t.launchTitle}
            </h2>
            <p className="mt-3 max-w-4xl leading-7 text-muted-foreground">{t.launchBody}</p>
          </section>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ href, copy }) => (
              <Link
                key={href}
                href={withLocale(locale, href)}
                className="focus-ring group rounded-3xl border border-border bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
              >
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-text">
                  {copy.badge}
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight group-hover:text-primary-text">
                  {copy.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.description}</p>
                <span aria-hidden className="mt-5 inline-block text-lg text-primary-text">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter footer={messages.footer} locale={locale} />
    </div>
  );
}
