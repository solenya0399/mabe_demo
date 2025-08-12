export type ConnectorType = "CCS1" | "Type2" | "NACS"

export interface Connector {
  id: string
  chargerId: string
  type: ConnectorType
  maxKW: number
}
