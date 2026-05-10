# Work Together Frontend

Frontend application built with Next.js, React, and TypeScript.

## Requirements

- Node.js 20+
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

Required:

- `NEXT_PUBLIC_API_URL` - base URL for backend API (example: `http://localhost:3001`).

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

- Pre-commit hook runs `lint-staged` on staged files (format + eslint fix).
- Commit message hook validates conventional commits via commitlint.
- CI validates `lint`, `typecheck`, and `build` on pushes and pull requests.

## Team Workflow

1. Create or update `.env.local` from `.env.example`.
2. Run `npm run dev` during development.
3. Before pushing, run `npm run check`.
4. Use `npm run commit` to keep commit messages consistent.
