<!-- BEGIN:nextjs-agent-rules -->

# WorkTogether — agent guidelines

A concise overview of how the frontend is structured and how to change it safely.

## Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Tailwind CSS** v4 (`@import "tailwindcss"` in `src/app/globals.css`)
- **axios**, **zod**
- Theming: **next-themes** (`AppThemeProvider` in the root `layout.tsx`)

## Local development

- **`npm run dev`** — development mode with HMR (code changes apply without restarting the server).
- **`npm run build`** then **`npm run start`** — production mode; without a prior `build` you may see errors about missing files under `.next/`.

## Internationalization (i18n)

### Languages and URLs

- Supported locales: **`en`** (default site language), **`uk`**.
- User-facing routes live under **`/en/...`** and **`/uk/...`**.
- **`src/middleware.ts`**: paths without a locale prefix redirect to **`/en`** + the same path (`defaultLocale`).

### Where copy lives

- **`src/messages/types.ts`** — single typed shape for all keys (`SiteMessages`). When adding copy, extend the type first, then **`en.ts`** and **`uk.ts`**.
- **`src/messages/en.ts`** — canonical English strings (source of truth for key semantics).
- **`src/messages/uk.ts`** — Ukrainian translation with the same keys.

### Using messages in code

- **`src/i18n/config.ts`**: `getMessages(locale)`, re-exports `locales`, `defaultLocale`, `isLocale`, and the `Locale` type.
- **`src/i18n/locales.ts`**: locale list and `isLocale` guard only — **no** imports of full message catalogs (keeps client bundles lean).
- In Server Components pages/layouts: `const t = getMessages(locale)` after validating with `isLocale`.

### Links with locale

- **`withLocale(locale, "/projects")`** — build an href like `/en/projects` (`src/i18n/paths.ts`).
- **`hrefForLocaleFromPathname(pathname, targetLocale)`** — swap only the first path segment (language menu / dropdown).

### New pages

- Place routes under **`src/app/[locale]/...`** (e.g. `[locale]/projects/page.tsx`).
- **`[locale]/layout.tsx`** already uses `generateStaticParams` from `locales` for static locale segments.
- Avoid hard-coding **`/en`** when you have route params — derive links from the current `locale`.

### Adding a locale later (e.g. `pl`, `es`)

1. Add the code in **`src/i18n/locales.ts`** and **`src/i18n/config.ts`** (message catalog).
2. Add **`src/messages/{code}.ts`** mirroring `en.ts`.
3. **`src/middleware.ts`** picks up new locales via `isLocale` automatically once `locales` is updated.
4. In **`navbar-locale-menu.tsx`**, extend **`localeMenuCodes`** and **`localeShort`** / aria branches.
5. In **`LocaleHtmlAttributes`**, map `document.documentElement.lang` for the new locale.

## Theme (light / dark)

- **`dark`** class on `<html>` is driven by **next-themes**.
- In **`globals.css`**, **`@variant dark (.dark &);`** wires Tailwind `dark:*` utilities to that class, not only `prefers-color-scheme`.
- **`--background` / `--foreground`** for `body` are overridden inside **`.dark`**.
- Client toggle: **`NavbarThemeToggle`**.

## Site header

- **`SiteHeader`** (`src/components/site-header.tsx`): logo left; **Projects** and **How it works** centered with absolute positioning from **`md`**; right cluster: login / sign up / language / theme (in that order).
- Language: **`NavbarLocaleMenu`** — compact dropdown labels **EN** / **UA**.
- Do not reintroduce arbitrary **`min-width`** on login/sign-up unless design explicitly requires it.

## Other areas

- **`LocaleHtmlAttributes`** — keeps `<html lang>` in sync with the active `[locale]` segment (root layout does not read `[locale]` directly).
- Domain types: **`src/types/`**. API layer: **`src/services/`** and **`api.ts`**.

## Change hygiene

- Keep PRs focused: change only what the task needs.
- After TS/React edits, run **`npm run lint`**, **`npm run typecheck`**, and **`npm run build`** when appropriate.

<!-- END:nextjs-agent-rules -->
