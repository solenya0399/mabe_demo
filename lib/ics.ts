import type { Reservation } from "@/types/reservation"

export function generateICSAndDownload(r: Reservation) {
  const dt = (iso: string) => {
    const d = new Date(iso)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const da = String(d.getUTCDate()).padStart(2, "0")
    const h = String(d.getUTCHours()).padStart(2, "0")
    const mi = String(d.getUTCMinutes()).padStart(2, "0")
    const s = String(d.getUTCSeconds()).padStart(2, "0")
    return `${y}${m}${da}T${h}${mi}${s}Z`
  }
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mabe EV Demo//ES",
    "BEGIN:VEVENT",
    `UID:${r.id}@mabe-demo`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(r.startAt)}`,
    `DTEND:${dt(r.endAt)}`,
    `SUMMARY:Carga EV (${r.connectorType})`,
    `DESCRIPTION:Reserva confirmada. Código: ${r.code ?? "-"} Objetivo SOC: ${r.targetSoc}%`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `reserva-${r.id}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
