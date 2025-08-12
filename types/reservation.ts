import type { ConnectorType } from "./connector"

export type ReservationStatus = "requested" | "confirmed" | "active" | "completed" | "canceled" | "no-show" | "expired"
export type PriorityTier = "Fleet" | "Employee" | "Guest"

export interface Reservation {
  id: string
  userId: string
  vehicleId: string
  siteId: string
  zoneId: string
  bayId?: string
  connectorType: ConnectorType
  status: ReservationStatus
  startAt: string
  endAt: string
  targetSoc: number
  priority: PriorityTier
  urgent?: boolean
  code?: string
}
