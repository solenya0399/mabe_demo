import type { Connector } from "./connector"

export type ChargerStatus = "Available" | "InUse" | "Faulted" | "Reserved" | "Unavailable"

export interface Charger {
  id: string
  siteId: string
  bayId: string
  model: string
  powerKW: number
  protocol: string
  status: ChargerStatus
  connectors: Connector[]
  lastErrors: string[]
  firmware: string
}
