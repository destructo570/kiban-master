# kiban

A pragmatic **Bun + Turborepo** starter for shipping AI-flavoured SaaS
products — auth, database, streaming AI, and a shadcn-based UI library wired
together with the bare minimum of glue.

The repo is deliberately small. Everything you'd normally bolt on first is
already in place; everything you don't strictly need has been left out so
forks can grow in their own direction.

## Features

- **Bun + Turborepo workspace** — single install, single dev command, parallel
  task pipelines across `apps/*` and `packages/*`.
- **Hono backend on Bun** (`apps/backend`, port `3001`) — the only HTTP
  surface in the system. The web app talks to it directly, no Next.js API
  proxy in between.
- **Next.js 16 web app** (`apps/web`, port `4004`) — App Router, React 19,
  Turbopack dev server.
- **Better Auth** with email/password + Google OAuth, session cookies scoped
  via `WEB_ORIGIN` / `BETTER_AUTH_URL`, custom `plan` and `role` fields on
  the user record.
- **Drizzle ORM + Supabase Postgres** — Better Auth's plural-table schema
  (`users`, `sessions`, `accounts`, `verifications`) lives in
  `packages/db/src/schema.ts`.
- **Vercel AI SDK streaming chat** — `POST /api/chat` runs `streamText`
  against OpenAI (`gpt-4o-mini` default) and streams plain text chunks; the
  browser reads them with a `ReadableStream` so the UI updates token by
  token.
- **shadcn/ui** in the **new-york** style with the **zinc** base color,
  packaged as the shared `@workspace/ui` library and consumed by the web
  app.
- **TanStack Query**, **next-themes**, and **sonner** preconfigured on the
  web side.
- **Shared TS, ESLint, Prettier configs** as workspace packages —
  `@workspace/typescript-config`, `@workspace/eslint-config`.

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

## Requirements

- **Bun** `1.3.9+` (the repo pins `packageManager` to this)
- **Node** `>=20` (only needed for tools that don't yet run on Bun)
- A **Postgres** database — Supabase works out of the box
- An **OpenAI API key**

## Getting started

```bash
bun install

cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.local.example apps/web/.env.local
# fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, OPENAI_API_KEY
# (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET optional — Google login is gated on both)

bun --filter @workspace/db db:push   # sync Drizzle schema to Postgres

bun dev                              # turbo dev — runs web + backend in parallel
```

The web app is at `http://localhost:4004`, the API at
`http://localhost:3001`. The web app reaches the backend via
`NEXT_PUBLIC_API_BASE_URL` — keep that and `WEB_ORIGIN` in lockstep, including
in development.

## Environment

### Backend (`apps/backend/.env`)

| Var | Purpose |
|---|---|
| `PORT` | Hono server port (default `3001`) |
| `WEB_ORIGIN` | Allowed CORS origin for the web app |
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Signing secret for sessions |
| `BETTER_AUTH_URL` | Public URL the auth server is reachable at |
| `GOOGLE_CLIENT_ID` | Optional — enables Google OAuth when both Google vars are set |
| `GOOGLE_CLIENT_SECRET` | Optional |
| `OPENAI_API_KEY` | Required by `apps/backend/src/lib/ai/openai.ts` |

### Web (`apps/web/.env.local`)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend origin the browser hits directly |

## Authentication

Better Auth is mounted at `/api/auth/*` on the Hono server and is the only
route group that runs *before* the auth-context middleware. The web app uses
`better-auth/react` (`apps/web/lib/auth-client.ts`) and calls the backend
directly with `credentials: "include"`, so the session cookie travels
cross-origin.

User records carry two custom fields on top of the Better Auth defaults —
`plan` (defaults to `"free"`) and `role` (defaults to `"user"`) — both
server-controlled (`input: false`).

Run `bun --filter @workspace/db db:push` after pulling schema changes.

## AI

The streaming chat route lives at `POST /api/chat` and accepts:

```json
{ "messages": [{ "role": "user", "content": "..." }], "model": "gpt-4o-mini" }
```

It validates with Zod, calls `streamText` from the Vercel AI SDK, caps output
at `1024` tokens, and streams plain text chunks back to the client. The
browser reads `response.body` with a `getReader()` loop so the UI updates
incrementally (see `apps/web/components/chat-playground.tsx`).

Provider/model resolution is centralized in
`apps/backend/src/lib/ai/openai.ts` — add new providers (Anthropic, etc.)
there and keep route handlers unaware of which vendor they're talking to.

See `.claude/ai.md` for the full AI conventions.

## Routes

| Method | Path | Auth | Notes |
|---|---|---|---|
| `ALL` | `/api/auth/*` | — | Better Auth (sign-in, sign-up, OAuth, etc.) |
| `GET` | `/health` | — | Liveness probe |
| `GET` | `/api/me` | required | Returns `{ id, email, plan, role }` for the current session |
| `POST` | `/api/chat` | required | Streaming chat completion |

Auth-gating is enforced globally by `authContext` middleware in
`apps/backend/src/middleware/auth.ts`; public paths are explicitly listed
there.

## Design

`.claude/design.md` is the project's UI design language reference (loaded via
`CLAUDE.md`) — an editorial, type-first, near-monochrome style. The shadcn
theme itself is the stock new-york / zinc preset and lives in
`packages/ui/src/styles/globals.css`. Override CSS tokens there if you fork
the theme.

## Scripts

```bash
bun dev        # turbo dev — runs web + backend
bun build      # turbo build
bun lint       # turbo lint
bun typecheck  # turbo typecheck
bun format     # turbo format (prettier across packages)

# Drizzle helpers, scoped to packages/db:
bun db db:push       # push schema to the database
bun db db:generate   # generate SQL migrations
bun db db:migrate    # apply migrations
bun db db:studio     # open Drizzle Studio
```
