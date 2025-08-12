import type { ConnectorType } from "./connector"

export interface Vehicle {
  id: string
  make: string
  model: string
  connectorType: ConnectorType
  batteryKWh: number
  typicalChargeKW: number
  // Nuevos campos para garaje del usuario
  ownerUserId?: string
  nickname?: string
}
