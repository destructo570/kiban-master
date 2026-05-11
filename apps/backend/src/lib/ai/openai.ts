import { openai } from "@ai-sdk/openai"

export const DEFAULT_MODEL_ID = "gpt-4o-mini"

export function chatModel(modelId: string = DEFAULT_MODEL_ID) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set")
  }
  return openai(modelId)
}
