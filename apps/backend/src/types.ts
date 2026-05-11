import type { Plan, UserRole } from "@workspace/types"

export type AppEnv = {
  Variables: {
    userId: string
    userEmail: string | null
    userPlan: Plan
    userRole: UserRole
  }
}
