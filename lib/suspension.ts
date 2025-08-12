import type { SuspensionPoint, UserSuspension } from "@/types/suspension"

export function getPointsForAction(type: SuspensionPoint["type"]): number {
  switch (type) {
    case "cancellation":
    case "overtime":
    case "user_report":
      return 1
    case "no_show":
      return 2
    default:
      return 0
  }
}

export function getSuspensionEndDate(totalPoints: number): string | null {
  if (totalPoints >= 4) {
    const suspensionDate = new Date()
    suspensionDate.setMonth(suspensionDate.getMonth() + 1)
    return suspensionDate.toISOString()
  }
  return null
}

export function isUserSuspended(suspension: UserSuspension): boolean {
  if (!suspension.suspendedUntil) return false
  return new Date(suspension.suspendedUntil) > new Date()
}
