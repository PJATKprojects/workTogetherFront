import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
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

  const statsItems = [
    { value: h.stats.one.value, label: h.stats.one.label },
    { value: h.stats.two.value, label: h.stats.two.label },
    { value: h.stats.three.value, label: h.stats.three.label },
  ];

  const howSteps = [h.how.steps.projectCard, h.how.steps.expectations, h.how.steps.applications];

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[20%] -top-[10%] h-[min(520px,55vw)] w-[min(520px,55vw)] rounded-full bg-indigo-500/25 blur-3xl dark:bg-indigo-500/18" />
        <div className="absolute right-[-15%] top-[35%] h-[min(480px,50vw)] w-[min(480px,50vw)] rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/14" />
        <div className="absolute bottom-[-20%] left-[35%] h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-500/12" />
      </div>

      <SiteHeader locale={locale} nav={t.nav} />

      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {h.heroPill}
            </p>
            <h1 className="bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl md:text-6xl md:leading-[1.08] dark:from-white dark:via-zinc-100 dark:to-zinc-400">
              {h.heroTitle}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              {h.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href={withLocale(locale, "/projects/new")}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {h.ctaPublish}
              </Link>
              <Link
                href={withLocale(locale, "/projects")}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-8 text-base font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                {h.ctaBrowse}
              </Link>
            </div>
            <dl className="mt-14 grid gap-6 text-left sm:grid-cols-3">
              {statsItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/50"
                >
                  <dt className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {item.value}
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-y border-zinc-200/80 bg-white/50 py-16 dark:border-zinc-800/80 dark:bg-zinc-900/40 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{h.paths.title}</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">{h.paths.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-linear-to-br from-white to-zinc-50 p-8 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 dark:hover:border-indigo-500/40">
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
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
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {h.paths.founder.body}
                </p>
                <Link
                  href={withLocale(locale, "/projects/new")}
                  className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition group-hover:gap-2 dark:text-indigo-400"
                >
                  {h.paths.founder.link}
                  <span aria-hidden>→</span>
                </Link>
              </article>
              <article className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-linear-to-br from-white to-zinc-50 p-8 shadow-sm transition hover:border-violet-200 hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 dark:hover:border-violet-500/40">
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
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
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {h.paths.teammate.body}
                </p>
                <Link
                  href={withLocale(locale, "/projects")}
                  className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-violet-600 transition group-hover:gap-2 dark:text-violet-400"
                >
                  {h.paths.teammate.link}
                  <span aria-hidden>→</span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{h.how.title}</h2>
              <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">{h.how.subtitle}</p>
              <ul className="mt-10 space-y-5">
                {howSteps.map((step) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                      ✓
                    </span>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-linear-to-tr from-indigo-500/10 via-transparent to-violet-500/10 blur-2xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {h.sampleCard.label}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{h.sampleCard.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {h.sampleCard.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {h.sampleCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-700">
                  <span className="text-sm text-zinc-500">{h.sampleCard.replies}</span>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {h.sampleCard.details}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-zinc-900 to-indigo-950 px-8 py-14 text-center text-white sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl"
            />
            <h2 className="relative text-2xl font-semibold tracking-tight sm:text-3xl">
              {h.ctaBanner.title}
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              {h.ctaBanner.subtitle}
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={withLocale(locale, "/auth/register")}
                className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              >
                {h.ctaBanner.primary}
              </Link>
              <Link
                href={withLocale(locale, "/projects")}
                className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl border border-white/25 bg-transparent px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {h.ctaBanner.secondary}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 bg-white/60 py-10 dark:border-zinc-800/80 dark:bg-zinc-950/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row sm:px-6">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} WorkTogether. {t.footer.tagline}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              className="hover:text-zinc-800 dark:hover:text-zinc-200"
              href={withLocale(locale, "/projects")}
            >
              {t.footer.projects}
            </Link>
            <Link
              className="hover:text-zinc-800 dark:hover:text-zinc-200"
              href={withLocale(locale, "/auth/login")}
            >
              {t.footer.login}
            </Link>
            <Link
              className="hover:text-zinc-800 dark:hover:text-zinc-200"
              href={withLocale(locale, "/auth/register")}
            >
              {t.footer.signUp}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
