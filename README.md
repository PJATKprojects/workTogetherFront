# Work Together Frontend

Frontend application built with Next.js, React, and TypeScript.

## Requirements

- Node.js 22.22.1+
- npm 10+

## Setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create `.env.local` based on `.env.example`.

3. Update required env vars in `.env.local`.

4. Start development server:

   ```bash
   npm run dev
   ```

## Environment Variables

Local development:

- `NEXT_PUBLIC_API_URL` — backend origin (for example `http://localhost:8081`).

Vercel production:

- `API_PROXY_TARGET` — Azure backend origin used by same-origin `/api` rewrites;
- `API_PROXY_SECRET` — server-only proxy header secret, equal to backend `ReverseProxy__RequiredHeaderSecret`;
- `NEXT_PUBLIC_REALTIME_URL` — Azure backend origin used only for the authenticated SignalR connection;
- leave `NEXT_PUBLIC_API_URL` empty so cookies remain first-party through `/api`.
- keep `LEGAL_DOCUMENTS_STATUS=draft` until Polish legal review and operator verification;
- set `LEGAL_OPERATOR_NAME`, `LEGAL_OPERATOR_ADDRESS`, `LEGAL_OPERATOR_REGISTER`,
  `LEGAL_OPERATOR_NIP` and `LEGAL_CONTACT_EMAIL`;
- switch `LEGAL_DOCUMENTS_STATUS=published` only after every value is verified. A
  published build fails fast when any required operator field is missing.

## Scripts

- `npm run dev` - run local dev server.
- `npm run build` - build production app.
- `npm run start` - run production server.
- `npm run lint` - run ESLint.
- `npm run lint:fix` - auto-fix lint issues where possible.
- `npm run typecheck` - run TypeScript checks.
- `npm run format` - format files with Prettier.
- `npm run format:check` - validate formatting without changes.
- `npm run check` - run lint, typecheck, and format:check.
- `npm run commit` - create conventional commit message via Commitizen.

## Quality Gates

- Commit message hook validates conventional commits via commitlint.
- CI validates `lint`, `typecheck`, and `build` on pushes and pull requests.

## Team Workflow

1. Create or update `.env.local` from `.env.example`.
2. Run `npm run dev` during development.
3. Before pushing, run `npm run check`.
4. Use `npm run commit` to keep commit messages consistent.
