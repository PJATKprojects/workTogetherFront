import type { LegalDoc, SiteMessages } from "@/messages/types";
import type { LegalIdentity } from "@/lib/legal-config";

/**
 * Shared renderer for legal documents (Terms, Privacy). Server component:
 * title + updated date, intro, sticky table of contents on xl, numbered
 * anchor-linked sections. Token-driven styling only.
 */
export function LegalArticle({
  doc,
  shared,
  identity,
}: Readonly<{
  doc: LegalDoc;
  shared: SiteMessages["legal"];
  identity?: LegalIdentity;
}>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {shared.updatedLabel}: {doc.updated}
        </p>
        <p className="mt-6 text-base leading-7 text-muted-foreground">{doc.intro}</p>
        {identity?.isDraft ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-foreground"
          >
            <p className="font-semibold">{shared.draftTitle}</p>
            <p className="mt-1 text-muted-foreground">{shared.draftBody}</p>
          </div>
        ) : null}
        {identity ? (
          <section
            aria-labelledby="legal-provider-title"
            className="mt-6 rounded-2xl border border-border bg-surface p-5"
          >
            <h2 id="legal-provider-title" className="text-base font-semibold">
              {shared.providerTitle}
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <ProviderField label={shared.operatorName} value={identity.operatorName} />
              <ProviderField label={shared.operatorAddress} value={identity.operatorAddress} />
              <ProviderField label={shared.operatorRegister} value={identity.operatorRegister} />
              <ProviderField label={shared.operatorTaxId} value={identity.operatorTaxId} />
              <ProviderField label={shared.contactEmail} value={identity.contactEmail} email />
            </dl>
          </section>
        ) : null}
      </header>

      <div className="mt-10 gap-12 xl:grid xl:grid-cols-[minmax(0,1fr)_260px]">
        <article className="max-w-3xl">
          {doc.sections.map((section, index) => (
            <section
              key={section.heading}
              id={`section-${index + 1}`}
              className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0"
            >
              <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-[15px] leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 space-y-2.5">
                  {section.bullets.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[15px] leading-7 text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="mt-[11px] size-1.5 shrink-0 rounded-full bg-primary/60"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>

        <nav aria-label={shared.tocTitle} className="hidden xl:block">
          <div className="sticky top-28 rounded-2xl border border-border bg-surface/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {shared.tocTitle}
            </p>
            <ul className="mt-3 space-y-1.5">
              {doc.sections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#section-${index + 1}`}
                    className="focus-ring block rounded-md px-2 py-1 text-[13px] leading-5 text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}

function ProviderField({
  label,
  value,
  email = false,
}: Readonly<{ label: string; value: string; email?: boolean }>) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-foreground">
        {email ? (
          <a className="text-primary-text hover:underline" href={`mailto:${value}`}>
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
