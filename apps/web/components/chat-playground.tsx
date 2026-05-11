"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { API_BASE_URL } from "@/lib/api"

type Message = { role: "user" | "assistant"; content: string }

export function ChatPlayground() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const text = input.trim()
    if (!text || pending) return

    const next: Message[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setInput("")
    setPending(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`)
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last && last.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: last.content + chunk }
          }
          return copy
        })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Say hi to start the conversation.
          </p>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rounded-md border px-3 py-2 text-sm whitespace-pre-wrap",
              m.role === "user"
                ? "bg-secondary text-secondary-foreground"
                : "bg-card",
            )}
          >
            <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">
              {m.role}
            </div>
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !input.trim()}>
          {pending ? "…" : "Send"}
        </Button>
      </form>
    </div>
  )
}
