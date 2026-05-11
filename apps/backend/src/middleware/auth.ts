import { createMiddleware } from "hono/factory"

import { auth } from "../lib/better-auth"
import type { AppEnv } from "../types"

const PUBLIC_PATHS = ["/health"]
const PUBLIC_PREFIXES = ["/api/auth/"]

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true
  return PUBLIC_PREFIXES.some((p) => path.startsWith(p))
}

export const authContext = createMiddleware<AppEnv>(async (c, next) => {
  if (isPublic(c.req.path)) {
    return next()
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    return c.json({ error: "unauthorized" }, 401)
  }

  c.set("userId", session.user.id)
  c.set("userEmail", session.user.email)
  c.set(
    "userPlan",
    (session.user as { plan?: string }).plan === "pro" ? "pro" : "free",
  )
  c.set(
    "userRole",
    (session.user as { role?: string }).role === "admin" ? "admin" : "user",
  )

  await next()
})

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get("userRole") !== "admin") {
    return c.json({ error: "forbidden" }, 403)
  }
  await next()
})
