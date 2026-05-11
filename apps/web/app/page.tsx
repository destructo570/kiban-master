import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">kiban</h1>
      <p className="text-muted-foreground text-balance">
        A Bun + Turborepo starter with Next.js, Hono, Better Auth, Drizzle
        (Supabase Postgres), the AI SDK, and shadcn/ui (new-york · zinc).
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Create account</Link>
        </Button>
      </div>
    </main>
  )
}
