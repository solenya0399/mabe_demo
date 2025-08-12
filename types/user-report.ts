export interface UserReport {
  id: string
  reporterUserId: string
  type: "occupied_spot" | "damaged_charger" | "other"
  description: string
  siteId: string
  bayId?: string
  reportedLicensePlate?: string
  photos: string[]
  createdAt: string
  status: "pending" | "resolved" | "dismissed"
  reservationId?: string
}
