import type { Reservation } from "@/types/reservation"
import type { Role } from "@/store/use-store-types"

export function countWeeklyReservations(reservations: Reservation[], userId: string): number {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  return reservations.filter((r) => r.userId === userId && new Date(r.startAt) >= oneWeekAgo && r.status !== "canceled")
    .length
}

export function canMakeReservation(
  reservations: Reservation[],
  userId: string,
  role: Role,
  isHost = false,
): { canReserve: boolean; reason?: string } {
  const weeklyCount = countWeeklyReservations(reservations, userId)
  const baseLimit = 2
  const hostBonus = isHost ? 3 : 0
  const totalLimit = baseLimit + hostBonus

  if (weeklyCount >= totalLimit) {
    return {
      canReserve: false,
      reason: `Has alcanzado el límite de ${totalLimit} reservas por semana`,
    }
  }

  return { canReserve: true }
}
