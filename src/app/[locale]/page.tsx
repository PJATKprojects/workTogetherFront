import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandMark } from "@/components/brand/logo";
import { FooterAccountLinks } from "@/components/footer-account-links";
import { SiteHeader } from "@/components/site-header";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { getMessages, isLocale } from "@/i18n/config";
import { withLocale } from "@/i18n/paths";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;

  if (!isLocale(raw)) {
    notFound();
  }

  const locale = raw;
  const t = getMessages(locale);
  const h = t.home;
  const highlightedHeroTitle = getHighlightedHeroTitle(h.heroTitle, locale);

  const statsItems = [
    { value: h.stats.one.value, label: h.stats.one.label },
    { value: h.stats.two.value, label: h.stats.two.label },
    { value: h.stats.three.value, label: h.stats.three.label },
  ];

  const howSteps = [h.how.steps.projectCard, h.how.steps.expectations, h.how.steps.applications];

  return (
    <div className="relative flex min-h-full flex-col text-foreground">
      {/* Landing washes ride the scroll at different speeds (parallax). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="parallax-sink absolute -left-[20%] -top-[10%] h-[min(520px,55vw)] w-[min(520px,55vw)] rounded-full bg-primary/15 blur-3xl" />
        <div className="parallax-rise absolute right-[-15%] top-[35%] h-[min(480px,50vw)] w-[min(480px,50vw)] rounded-full bg-secondary/12 blur-3xl" />
        <div className="parallax-rise absolute bottom-[-20%] left-[35%] h-[420px] w-[420px] rounded-full bg-warning/10 blur-3xl" />
      </div>

      <SiteHeader locale={locale} nav={t.nav} />

      <main className="flex flex-1 flex-col">
        <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 md:pt-20">
          {/* Floating decorative chips framing the hero (desktop only). */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
            <span className="gentle-float absolute left-2 top-24 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-primary-text shadow-[var(--shadow-sm)] backdrop-blur">
              ⚛ React
            </span>
            <span
              className="gentle-float absolute right-4 top-36 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-secondary shadow-[var(--shadow-sm)] backdrop-blur"
              style={{ animationDelay: "1.4s" }}
            >
              ✦ Figma
            </span>
            <span
              className="gentle-float absolute left-10 top-72 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-accent-soft-foreground shadow-[var(--shadow-sm)] backdrop-blur"
              style={{ animationDelay: "2.6s" }}
            >
              {"</>"} API
            </span>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-sm font-medium text-foreground/80 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              {h.heroPill}
            </p>
            <h1 className="fade-up text-3xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl md:leading-[1.08]">
              {highlightedHeroTitle.before}
              {highlightedHeroTitle.accent ? (
                <span className="relative inline-block whitespace-nowrap">
                  <span className="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    {highlightedHeroTitle.accent}
                  </span>
                  {/* Hand-drawn underline that sketches itself in. */}
                  <svg
                    className="hero-squiggle"
                    viewBox="0 0 110 10"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      d="M3 7c18-5 34 3 52-2 18-5 34 3 52-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              ) : null}
              {highlightedHeroTitle.after}
            </h1>
            <p className="fade-up-delayed mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {h.heroSubtitle}
            </p>
            <div className="fade-up-delayed mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href={withLocale(locale, "/projects/new")}
                className="btn-shine focus-ring inline-flex h-12 items-center justify-center rounded-xl bg-linear-to-r from-primary to-secondary px-8 text-base font-semibold text-primary-foreground shadow-[0_16px_38px_-14px_rgb(37_99_235/0.6)] transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-px hover:brightness-110 hover:shadow-[0_20px_46px_-14px_rgb(37_99_235/0.7)]"
              >
                {h.ctaPublish}
              </Link>
              <Link
                href={withLocale(locale, "/projects")}
                className="focus-ring inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface px-8 text-base font-semibold text-foreground transition-[transform,background-color,border-color] duration-200 hover:-translate-y-px hover:border-input hover:bg-muted"
              >
                {h.ctaBrowse}
              </Link>
            </div>
            <dl className="mt-10 grid gap-4 text-left sm:mt-14 sm:grid-cols-3 sm:gap-6">
              {statsItems.map((item, index) => (
                <RevealOnScroll
                  key={item.label}
                  delayMs={index * 70}
                  className="glass-card rounded-2xl p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_35px_-24px_rgb(37_99_235/0.5)]"
                >
                  <dt className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
                      <StatIcon index={index} />
                    </span>
                    {item.value}
                  </dt>
                  <dd className="mt-2 text-base text-muted-foreground">{item.label}</dd>
                </RevealOnScroll>
              ))}
            </dl>
          </div>
        </section>

        {/* Decorative tech ticker — the catalog breadth at a glance. */}
        <div aria-hidden className="marquee border-y border-border bg-surface/40 py-3.5">
          <div className="marquee-track gap-3 pr-3">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-3">
                {MARQUEE_TECH.map((name) => (
                  <span
                    key={`${copy}-${name}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-surface/80 px-3.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <span className="size-1.5 rounded-full bg-linear-to-r from-primary to-secondary" />
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="border-b border-border bg-surface/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <RevealOnScroll className="mx-auto max-w-2xl text-center">
              <h2 className="heading-underline text-2xl font-semibold tracking-tight sm:text-3xl">
                {h.paths.title}
              </h2>
              <p className="mt-3 text-muted-foreground">{h.paths.subtitle}</p>
            </RevealOnScroll>
            <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] md:gap-6">
              <RevealOnScroll>
                <article className="glass-card group relative overflow-hidden rounded-3xl p-8 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-text">
                    <svg
                      className="size-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.176 7.176 0 00-1.97-1.193.75.75 0 11-.375 1.456 4.089 4.089 0 00-1.135 3.317c0 .986.626 1.81 1.428 2.056m4.741.52a24.041 24.041 0 01-5.951 0m5.951 0a3.846 3.846 0 00-1.043-4.801 3.756 3.756 0 00-5.306 0 3.846 3.846 0 00-1.043 4.801m9.918 0c.299.679.921 1.128 1.652 1.128h4.072c1.086 0 1.957-.827 2-1.913.06-2.093.06-6.176 0-8.269-.043-1.086-.914-1.913-2-1.913h-4.072a2.056 2.056 0 01-1.652 1.128m-9.918 0a2.056 2.056 0 00-1.652-1.128h-4.072c-1.086 0-1.957.827-2 1.913-.06 2.093-.06 6.176 0 8.269.043 1.086.914 1.913 2 1.913h4.072a2.056 2.056 0 001.652-1.128"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{h.paths.founder.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {h.paths.founder.body}
                  </p>
                  <Link
                    href={withLocale(locale, "/projects/new")}
                    className="link-underline-anim mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary-text transition group-hover:gap-2"
                  >
                    {h.paths.founder.link}
                    <span aria-hidden>→</span>
                  </Link>
                </article>
              </RevealOnScroll>
              <div className="hidden items-center justify-center md:flex">
                <div className="h-32 w-px bg-linear-to-b from-transparent via-border to-transparent" />
              </div>
              <RevealOnScroll delayMs={120}>
                <article className="glass-card group relative overflow-hidden rounded-3xl p-8 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-lg">
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-info-soft text-secondary">
                    <svg
                      className="size-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{h.paths.teammate.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {h.paths.teammate.body}
                  </p>
                  <Link
                    href={withLocale(locale, "/projects")}
                    className="link-underline-anim mt-8 inline-flex items-center gap-1 text-sm font-semibold text-secondary transition group-hover:gap-2"
                  >
                    {h.paths.teammate.link}
                    <span aria-hidden>→</span>
                  </Link>
                </article>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <RevealOnScroll>
              <h2 className="heading-underline heading-underline-left text-2xl font-semibold tracking-tight sm:text-3xl">
                {h.how.title}
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">{h.how.subtitle}</p>
              <ul className="mt-10 space-y-5">
                {howSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="reveal-on-scroll is-visible flex gap-4"
                    style={{ transitionDelay: `${index * 90}ms` }}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
            <RevealOnScroll delayMs={140} className="relative">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-linear-to-tr from-primary/10 via-transparent to-secondary/10 blur-2xl"
                aria-hidden
              />
              <div className="glass-card sample-card-float relative overflow-hidden rounded-3xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {h.sampleCard.label}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{h.sampleCard.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{h.sampleCard.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {h.sampleCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-soft-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <span className="text-sm text-muted-foreground">{h.sampleCard.replies}</span>
                  <span className="text-sm font-semibold text-primary-text">
                    {h.sampleCard.details}
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
          <RevealOnScroll>
            <div className="cta-mesh-animate relative overflow-hidden rounded-3xl border border-border bg-surface px-5 py-10 text-center text-foreground shadow-[0_24px_56px_-32px_rgb(15_23_42/0.35)] sm:px-12 sm:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/18 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/14 blur-3xl"
              />
              <h2 className="relative text-2xl font-semibold tracking-tight sm:text-3xl">
                {h.ctaBanner.title}
              </h2>
              <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                {h.ctaBanner.subtitle}
              </p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={withLocale(locale, "/auth/register")}
                  className="btn-shine focus-ring inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_26px_-12px_var(--accent)] transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-accent-hover"
                >
                  {h.ctaBanner.primary}
                </Link>
                <Link
                  href={withLocale(locale, "/projects")}
                  className="focus-ring inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl border border-border bg-surface/70 px-6 text-sm font-semibold text-foreground transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-muted"
                >
                  {h.ctaBanner.secondary}
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      <footer className="border-t border-border bg-surface/60 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
            <div>
              <Link
                href={withLocale(locale, "/")}
                className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-85"
              >
                <BrandMark className="size-8" rounded="rounded-lg" />
                <span>{t.nav.brandWordmark}</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t.footer.description}
              </p>
              <p className="mt-4 text-sm font-medium text-foreground/80">{t.footer.tagline}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">{t.footer.productTitle}</p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm">
                <Link
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href={withLocale(locale, "/projects")}
                >
                  {t.footer.projects}
                </Link>
                <Link
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href={withLocale(locale, "/how-it-works")}
                >
                  {t.footer.howItWorks}
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">{t.footer.companyTitle}</p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm">
                <FooterAccountLinks
                  locale={locale}
                  labels={{
                    login: t.footer.login,
                    signUp: t.footer.signUp,
                    profile: t.footer.profile,
                    myApplications: t.footer.myApplications,
                  }}
                />
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href="mailto:hello@worktogether.app"
                >
                  {t.footer.contact}
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">{t.footer.newsletterTitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t.footer.newsletterHint}
              </p>
              <Link
                href={withLocale(locale, "/projects")}
                className="focus-ring mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-12px_var(--primary)] transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-primary-hover"
              >
                {t.footer.newsletterCta}
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-5">
              <p className="text-center sm:text-left">
                © {new Date().getFullYear()} WorkTogether. {t.footer.rights}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={withLocale(locale, "/terms")}
                  className="transition-colors hover:text-foreground"
                >
                  {t.footer.terms}
                </Link>
                <Link
                  href={withLocale(locale, "/privacy")}
                  className="transition-colors hover:text-foreground"
                >
                  {t.footer.privacy}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/PJATKprojects"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-input hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Decorative only (aria-hidden): a taste of the technology catalog.
const MARQUEE_TECH = [
  "React",
  "TypeScript",
  "Next.js",
  ".NET",
  "Python",
  "Figma",
  "Node.js",
  "Docker",
  "PostgreSQL",
  "Flutter",
  "Unity",
  "TensorFlow",
  "Go",
  "Kotlin",
  "GraphQL",
];

function getHighlightedHeroTitle(title: string, locale: string) {
  if (locale !== "en") {
    return { before: title, accent: "", after: "" };
  }

  const match = title.match(/(crew|project)/i);
  if (!match || match.index == null) {
    return { before: title, accent: "", after: "" };
  }

  return {
    before: title.slice(0, match.index),
    accent: match[0],
    after: title.slice(match.index + match[0].length),
  };
}

function StatIcon({ index }: Readonly<{ index: number }>) {
  if (index === 0) {
    return (
      <svg
        className="size-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx={12} cy={13} r={8} />
        <path strokeLinecap="round" d="M12 9v4l2.5 1.5" />
        <path strokeLinecap="round" d="M9 3h6" />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg
        className="size-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx={12} cy={8} r={3.5} />
        <path strokeLinecap="round" d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h8v8" />
    </svg>
  );
}
