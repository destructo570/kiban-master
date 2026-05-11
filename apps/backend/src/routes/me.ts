import { Hono } from "hono"

import { getCurrentUserEmail, getCurrentUserId } from "../lib/auth"
import type { AppEnv } from "../types"

const router = new Hono<AppEnv>()

router.get("/", (c) => {
  return c.json({
    id: getCurrentUserId(c),
    email: getCurrentUserEmail(c),
    plan: c.get("userPlan"),
    role: c.get("userRole"),
  })
})

export default router
