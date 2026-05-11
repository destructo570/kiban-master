# kiban

A pragmatic Bun + Turborepo starter for shipping AI-flavoured SaaS products.

## Stack

- **Bun** workspace, **Turborepo** task orchestration
- **Next.js 16** web app (`apps/web`, port `4004`) — no Next.js API routes
- **Hono + Bun** backend (`apps/backend`, port `3001`) — the only HTTP surface
- **Better Auth** with email/password + Google, backed by **Drizzle ORM** on
  **Supabase Postgres**
- **Vercel AI SDK** (`ai` + `@ai-sdk/openai`) with a streaming `/api/chat`
  endpoint
- **shadcn/ui** in the **new-york** style with the **zinc** base color, packaged
  as the shared `@workspace/ui` library and consumed by `apps/web`

## Layout

```
apps/
  backend/   Hono + Bun server, Better Auth, AI routes
  web/       Next.js (App Router), Better Auth client, shadcn UI
packages/
  db/        Drizzle schema + Postgres client
  types/     Shared TypeScript types
  ui/        shadcn/ui (new-york · zinc) component library
  eslint-config/       Flat ESLint configs (base, next-js, react-internal)
  typescript-config/   Shared tsconfigs (base, nextjs, react-library)
```

## Getting started

```bash
bun install

cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.local.example apps/web/.env.local

# wire up DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, OPENAI_API_KEY
bun --filter @workspace/db db:push

bun dev
```

The web app is at `http://localhost:4004`, the API is at
`http://localhost:3001`. The web app uses `NEXT_PUBLIC_API_BASE_URL` to reach
the backend — keep them in lockstep.

## Authentication

Better Auth is mounted at `/api/auth/*` on the Hono server. The web app uses
`better-auth/react` (`apps/web/lib/auth-client.ts`) and calls the backend
directly with credentials. Cookies are scoped via `BETTER_AUTH_URL` /
`WEB_ORIGIN` — set both, even in development.

The Drizzle schema in `packages/db/src/schema.ts` is shaped for Better Auth's
plural tables (`users`, `sessions`, `accounts`, `verifications`). Run
`db:push` after pulling.

## AI

The streaming chat route lives at `POST /api/chat` and streams plain text
chunks. The browser reads the response with a `ReadableStream` so the UI
updates token by token (`apps/web/components/chat-playground.tsx`).

See `.claude/ai.md` for the project's AI conventions.

## Design

`.claude/design.md` is the project's UI design language reference (loaded via
`CLAUDE.md`). The shadcn theme itself is the stock new-york / zinc preset and
lives in `packages/ui/src/styles/globals.css`. Override CSS tokens there if
you fork the theme.

## Scripts

```bash
bun dev        # turbo dev — runs web + backend
bun build      # turbo build
bun lint       # turbo lint
bun typecheck  # turbo typecheck
bun db -- db:push|db:generate|db:migrate|db:studio
```
