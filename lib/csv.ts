import { useAppStore } from "@/store/use-store"

function download(filename: string, content: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportReservationsCSV() {
  const { reservations, users, vehicles, sites } = useAppStore.getState()
  const headers = [
    "id",
    "usuario",
    "vehiculo",
    "sitio",
    "estado",
    "inicio",
    "fin",
    "conector",
    "targetSoc",
    "prioridad",
  ]
  const rows = reservations.map((r) => [
    r.id,
    users.find((u) => u.id === r.userId)?.name ?? "",
    (() => {
      const v = vehicles.find((v) => v.id === r.vehicleId)
      return v ? `${v.make} ${v.model}` : ""
    })(),
    sites.find((s) => s.id === r.siteId)?.name ?? "",
    r.status,
    r.startAt,
    r.endAt,
    r.connectorType,
    r.targetSoc,
    r.priority,
  ])
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  download("reservas.csv", csv)
}

export function exportSessionsCSV() {
  const { sessions, users, vehicles, sites } = useAppStore.getState()
  const headers = ["id", "usuario", "vehiculo", "sitio", "estado", "inicio", "fin", "kwh", "idleMin"]
  const rows = sessions.map((s) => [
    s.id,
    users.find((u) => u.id === s.userId)?.name ?? "",
    (() => {
      const v = vehicles.find((v) => v.id === s.vehicleId)
      return v ? `${v.make} ${v.model}` : ""
    })(),
    sites.find((st) => st.id === s.siteId)?.name ?? "",
    s.status,
    s.startAt,
    s.endAt ?? "",
    s.kwh,
    s.idleMinutes,
  ])
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  download("sesiones.csv", csv)
}
