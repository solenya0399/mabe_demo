export interface Session {
  id: string
  reservationId: string
  chargerId: string
  bayId: string
  userId: string
  vehicleId: string
  siteId: string
  startAt: string
  endAt?: string
  kwh: number
  status: "active" | "completed"
  idleMinutes: number
  cost: number
}
