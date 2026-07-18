import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/i18n/config";
import { withLocale } from "@/i18n/paths";

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getMessages(raw);
  const steps = [
    [t.howItWorks.stepOneTitle, t.howItWorks.stepOneBody],
    [t.howItWorks.stepTwoTitle, t.howItWorks.stepTwoBody],
    [t.howItWorks.stepThreeTitle, t.howItWorks.stepThreeBody],
  ];
  return (
    <div className="flex min-h-full flex-col text-foreground">
      <SiteHeader locale={raw} nav={t.nav} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t.howItWorks.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t.howItWorks.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map(([title, body], index) => (
            <article
              key={title}
              className="glass-card rounded-3xl p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
        <section className="cta-mesh-animate relative mt-12 overflow-hidden rounded-3xl bg-linear-to-br from-primary to-secondary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="relative text-3xl font-semibold">{t.howItWorks.ctaTitle}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/85">
            {t.howItWorks.ctaBody}
          </p>
          <Link
            href={withLocale(raw, "/projects")}
            className="focus-ring relative mt-6 inline-flex rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-primary-text transition duration-200 hover:-translate-y-px hover:brightness-105"
          >
            {t.howItWorks.cta}
          </Link>
        </section>
      </main>
      <SiteFooter footer={t.footer} locale={raw} />
    </div>
  );
}
