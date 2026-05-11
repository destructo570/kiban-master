import { Hono } from "hono"
import { cors } from "hono/cors"

import { auth } from "./lib/better-auth"
import { authContext } from "./middleware/auth"
import { errorHandler } from "./middleware/error"
import chat from "./routes/chat"
import me from "./routes/me"
import type { AppEnv } from "./types"

const app = new Hono<AppEnv>()

app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = process.env.WEB_ORIGIN
      if (!allowed) return origin ?? null
      return origin === allowed ? origin : null
    },
    credentials: true,
    allowHeaders: ["content-type", "authorization"],
    exposeHeaders: ["X-Session-Id"],
  }),
)

// Better Auth handles its own routes — mounted before the auth gate.
app.all("/api/auth/*", (c) => auth.handler(c.req.raw))

app.use("*", authContext)

app.onError(errorHandler)

app.get("/health", (c) => c.json({ ok: true }))

const api = new Hono<AppEnv>()
api.route("/me", me)
api.route("/chat", chat)

app.route("/api", api)

export default {
  port: Number(process.env.PORT ?? 3001),
  fetch: app.fetch,
}
