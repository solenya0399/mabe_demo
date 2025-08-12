export interface Guest {
  id: string
  hostUserId: string
  name: string
  email: string
  phone: string
  licensePlate: string
  vehicleMake: string
  vehicleModel: string
  connectorType: "Type1" | "Type2" | "CCS" | "CHAdeMO"
  createdAt: string
  monthlyReservations: number
}

export interface GuestReservation {
  id: string
  guestId: string
  hostUserId: string
  siteId: string
  zoneId: string
  bayId: string
  startAt: string
  endAt: string
  status: "requested" | "confirmed" | "active" | "completed" | "canceled"
  code: string
  urgent: boolean
}
