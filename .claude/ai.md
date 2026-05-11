# AI SDK — kiban conventions

The AI stack lives in `apps/backend` and is driven by the Vercel AI SDK (`ai`)
with the OpenAI provider (`@ai-sdk/openai`). The web app talks to it over
plain `fetch` so there is no Next.js API route — all model traffic flows
through the Hono server.

Follow these rules whenever working on AI code.

## Provider + model resolution

- Always read the API key from `process.env.OPENAI_API_KEY` and fail fast with
  a clear error if it is missing — never paper over a missing key with a
  fallback model or mocked output.
- The single entry point for picking a model is
  `apps/backend/src/lib/ai/openai.ts`. Add new providers there (e.g. Anthropic
  via `@ai-sdk/anthropic`), keep the rest of the codebase unaware of which
  vendor it talks to.
- Default model is `gpt-4o-mini` — cheap, fast, sufficient for the starter
  endpoints. Override per-request with the `model` body field. Don't hardcode
  alternative models inside route handlers.

## Streaming routes

- Prefer `streamText` over `generateText` for any user-facing chat-style
  endpoint. Stream the response body with `hono/streaming`'s `stream` helper
  so cancellations propagate.
- Cap output with `maxTokens` on every call — runaway generation is the most
  common production bug. Size the cap to the largest legitimate response for
  that shape (chat turn, summary, JSON object) plus a small headroom.
- For structured output use `generateObject` with a Zod schema, not free-form
  text + JSON parsing. Validate `inputs` at the boundary with Zod too.

## Client wiring

- The browser hits the Hono server directly via `NEXT_PUBLIC_API_BASE_URL`.
  Do **not** add a Next.js API route to proxy AI traffic — that doubles the
  hop and breaks streaming back-pressure.
- Carry the session cookie with `credentials: "include"`. The backend's
  `authContext` middleware will gate the route unless you explicitly add it
  to `PUBLIC_PATHS` / `PUBLIC_PREFIXES`.
- For incremental UI updates, read `response.body` with a `getReader()` loop
  rather than `response.text()` — the latter waits for the full response and
  defeats streaming.

## Costs + safety

- Log token usage somewhere durable before scaling — `result.usage` from the
  AI SDK gives `{ promptTokens, completionTokens }`. Sample to Discord or
  Postgres; do not console-log in prod.
- For prompts containing user data, redact obvious PII (emails, phone
  numbers) before sending unless the feature explicitly needs it.
- Never round-trip user-provided strings as part of a system prompt without
  treating them as untrusted — they can override instructions.
