export interface SuspensionPoint {
  id: string
  userId: string
  type: "cancellation" | "no_show" | "overtime" | "user_report"
  points: number
  reason: string
  createdAt: string
  reservationId?: string
}

export interface UserSuspension {
  userId: string
  totalPoints: number
  suspendedUntil: string | null
  isActive: boolean
  history: SuspensionPoint[]
}
