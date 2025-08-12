export interface QueueItem {
  id: string
  siteId: string
  zoneId?: string
  userId: string
  vehicleId: string
  priority: "Fleet" | "Employee" | "Guest"
  requestedAt: string
}
