export interface TOUBlock {
  startHour: number // 0-23 inclusive
  endHour: number // 1-24, exclusivo
  price: number // precio por kWh
}

export interface PricingPolicy {
  siteId: string
  currency: "MXN" | "USD"
  idleFeePerMinute: number // cargo por minuto ocioso tras gracia
  tou: TOUBlock[]
}
