import { Hono } from "hono"
import { stream } from "hono/streaming"
import { streamText, type CoreMessage } from "ai"
import { z } from "zod"

import { chatModel } from "../lib/ai/openai"
import type { AppEnv } from "../types"

const router = new Hono<AppEnv>()

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1),
  model: z.string().optional(),
})

router.post("/", async (c) => {
  const json = bodySchema.parse(await c.req.json())
  const result = streamText({
    model: chatModel(json.model),
    messages: json.messages as CoreMessage[],
    maxTokens: 1024,
  })

  c.header("Content-Type", "text/plain; charset=utf-8")
  c.header("X-Vercel-AI-Data-Stream", "v1")
  return stream(c, async (writer) => {
    for await (const chunk of result.textStream) {
      await writer.write(chunk)
    }
  })
})

export default router
