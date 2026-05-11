import type { ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { ZodError } from "zod"

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Invalid request", detail: err.issues }, 400)
  }
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error("[backend] unhandled error:", err)
  const message = err instanceof Error ? err.message : "Internal server error"
  return c.json({ error: message }, 500)
}
