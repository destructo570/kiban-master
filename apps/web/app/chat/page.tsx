import { ChatPlayground } from "@/components/chat-playground"

export default function ChatPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">AI playground</h1>
        <p className="text-muted-foreground text-sm">
          Streams from the Hono backend via the Vercel AI SDK.
        </p>
      </header>
      <ChatPlayground />
    </main>
  )
}
