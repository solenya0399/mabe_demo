export interface EnergyPolicy {
  siteId: string
  capKW: number
  bufferMinutes: number
  graceMinutes: number
  queuePolicy: "FIFO"
}

export interface PolicyRules {
  siteId: string
  maxDurationMinutes: number
  quietHours?: { start: string; end: string; label?: string }[]
  priorityTiers?: Array<{ tier: "Fleet" | "Employee" | "Guest"; weight: number }>
}
