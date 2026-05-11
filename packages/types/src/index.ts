export type Plan = "free" | "pro"

export type UserRole = "user" | "admin"

export type SessionUser = {
  id: string
  email: string | null
  plan: Plan
  role: UserRole
}
