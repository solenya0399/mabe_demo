export function formatHourRange(startISO: string, endISO: string) {
  const s = new Date(startISO)
  const e = new Date(endISO)
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return `${fmt(s)}–${fmt(e)}`
}

export function shortDate(d: Date) {
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
}

export function addMinutesISO(startISO: string, minutes: number) {
  return new Date(new Date(startISO).getTime() + minutes * 60000).toISOString()
}

export function roundNextQuarter(d = new Date()) {
  const ms = d.getTime()
  const quarter = 15 * 60 * 1000
  const next = Math.ceil(ms / quarter) * quarter
  return new Date(next)
}
