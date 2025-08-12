export interface Ticket {
  id: string
  siteId: string
  chargerId: string
  bayId?: string
  issueType: string
  severity: "low" | "medium" | "high"
  status: "open" | "in_progress" | "resolved"
  slaDue: string
}
