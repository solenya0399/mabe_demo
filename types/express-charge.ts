export interface ExpressCharge {
  id: string
  userId: string
  siteId: string
  bayId: string
  startAt: string
  endAt: string
  maxDuration: number // minutes
  status: "active" | "completed" | "canceled"
  photos: {
    chargerBefore: string[]
    initialCharge: string
  }
}
