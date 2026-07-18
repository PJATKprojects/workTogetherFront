import Link from "next/link";

import { BrandMark } from "@/components/brand/logo";
import { FooterAccountLinks } from "@/components/footer-account-links";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import { getLegalIdentity } from "@/lib/legal-config";
import type { SiteMessages } from "@/messages/types";

/**
 * App-wide footer (v1.3): brand + link columns + legal bar, a lighter cousin
 * of the landing footer (no newsletter). Reuses the same footer message keys.
 */
export function SiteFooter({
  footer,
  locale,
}: Readonly<{ footer: SiteMessages["footer"]; locale: Locale }>) {
  const legalIdentity = getLegalIdentity();
  const productLinks = [
    { href: withLocale(locale, "/projects"), label: footer.projects },
    { href: withLocale(locale, "/how-it-works"), label: footer.howItWorks },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-surface/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href={withLocale(locale, "/")}
              className="focus-ring inline-flex items-center gap-2 rounded-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-85"
            >
              <BrandMark className="size-8" rounded="rounded-lg" />
              WorkTogether
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {footer.description}
            </p>
            <p className="mt-3 text-sm font-medium text-foreground/80">{footer.tagline}</p>
          </div>

          <nav aria-label={footer.productTitle}>
            <p className="text-sm font-semibold text-foreground">{footer.productTitle}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label={footer.companyTitle}>
            <p className="text-sm font-semibold text-foreground">{footer.companyTitle}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <FooterAccountLinks
                locale={locale}
                labels={{
                  login: footer.login,
                  signUp: footer.signUp,
                  profile: footer.profile,
                  myApplications: footer.myApplications,
                }}
              />
              <a
                href={`mailto:${legalIdentity.contactEmail}`}
                className="w-fit text-muted-foreground transition-colors hover:text-foreground"
              >
                {footer.contact}
              </a>
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} WorkTogether. {footer.rights}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
            <Link
              href={withLocale(locale, "/policies")}
              className="transition-colors hover:text-foreground"
            >
              {footer.policies}
            </Link>
            <Link
              href={withLocale(locale, "/terms")}
              className="transition-colors hover:text-foreground"
            >
              {footer.terms}
            </Link>
            <Link
              href={withLocale(locale, "/privacy")}
              className="transition-colors hover:text-foreground"
            >
              {footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
