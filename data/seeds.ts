import type { Site } from "@/types/site"
import type { Zone } from "@/types/zone"
import type { Bay } from "@/types/bay"
import type { Charger } from "@/types/charger"
import type { User } from "@/types/user"
import type { Vehicle } from "@/types/vehicle"
import type { Reservation } from "@/types/reservation"
import type { Session } from "@/types/session"
import type { Ticket } from "@/types/ticket"
import type { EnergyPolicy } from "@/types/energy"
import type { PricingPolicy } from "@/types/pricing"

export function seedSites(): Site[] {
  return [
    {
      id: "site-hq",
      name: "Mabe Sede Central",
      timezone: "America/Mexico_City",
      address: "Av. Reforma 123, Ciudad de México",
      renewablePercent: 85,
    },
    {
      id: "site-norte",
      name: "Planta Norte Monterrey",
      timezone: "America/Monterrey",
      address: "Parque Industrial Norte, Nuevo León",
      renewablePercent: 78,
    },
    {
      id: "site-bajio",
      name: "Centro Bajío",
      timezone: "America/Mexico_City",
      address: "Zona Industrial Bajío, Guanajuato",
      renewablePercent: 92,
    },
  ]
}

export function seedZones(): Zone[] {
  return [
    { id: "z-hq-a", siteId: "site-hq", name: "Estacionamiento Ejecutivo" },
    { id: "z-hq-b", siteId: "site-hq", name: "Plaza Norte" },
    { id: "z-hq-c", siteId: "site-hq", name: "Área de Visitantes" },
    { id: "z-n-a", siteId: "site-norte", name: "Zona Industrial A" },
    { id: "z-n-b", siteId: "site-norte", name: "Estacionamiento Empleados" },
    { id: "z-b-a", siteId: "site-bajio", name: "Patio Principal" },
    { id: "z-b-b", siteId: "site-bajio", name: "Zona VIP" },
  ]
}

export function seedBays(): Bay[] {
  const bays: Bay[] = []
  const zones = ["z-hq-a", "z-hq-b", "z-hq-c", "z-n-a", "z-n-b", "z-b-a", "z-b-b"]
  let idx = 1
  for (const z of zones) {
    const count = z.includes("hq") ? 8 : z.includes("n-") ? 6 : 4
    for (let i = 0; i < count; i++) {
      bays.push({
        id: `bay-${idx}`,
        siteId: z.startsWith("z-hq") ? "site-hq" : z.startsWith("z-n") ? "site-norte" : "site-bajio",
        zoneId: z,
        label: `E${idx.toString().padStart(2, "0")}`,
        chargerId: `chg-${idx}`,
      })
      idx++
    }
  }
  return bays
}

export function seedChargers(bays: Bay[]): Charger[] {
  const models = [
    { model: "Wallbox Pulsar Plus", powerKW: 7 },
    { model: "ABB Terra AC", powerKW: 11 },
    { model: "Schneider EVlink Pro", powerKW: 22 },
    { model: "ABB Terra HP", powerKW: 50 },
    { model: "Tritium Veefil-PK", powerKW: 75 },
    { model: "ABB Terra 360", powerKW: 150 },
    { model: "Kempower Satellite", powerKW: 200 },
  ]
  const types = ["CCS1", "Type2", "NACS"] as const
  return bays.map((b, i) => {
    const m = models[i % models.length]
    const statusOptions: Charger["status"][] = ["Available", "InUse", "Reserved", "Faulted", "Unavailable"]
    const weights = [60, 20, 10, 5, 5] // Más disponibles
    const randomStatus = () => {
      const rand = Math.random() * 100
      let cumulative = 0
      for (let j = 0; j < weights.length; j++) {
        cumulative += weights[j]
        if (rand <= cumulative) return statusOptions[j]
      }
      return "Available"
    }

    return {
      id: `chg-${i + 1}`,
      siteId: b.siteId,
      bayId: b.id,
      model: m.model,
      powerKW: m.powerKW,
      protocol: m.powerKW >= 50 ? "OCPP 2.0.1" : "OCPP 1.6J",
      status: randomStatus(),
      connectors: [
        { id: `conn-${i + 1}-1`, chargerId: `chg-${i + 1}`, type: types[i % types.length], maxKW: m.powerKW },
      ],
      lastErrors: i % 7 === 0 ? ["Error de comunicación", "Reinicio automático"] : [],
      firmware: m.powerKW >= 50 ? "v3.2.1" : "v2.8.4",
    }
  })
}

export function seedUsers(): User[] {
  return [
    { id: "u-ops-1", name: "Laura Martínez", department: "Ops" },
    { id: "u-ops-2", name: "Carlos Rodríguez", department: "Ops" },
    { id: "u-ing-1", name: "Ana García", department: "Ingeniería" },
    { id: "u-ing-2", name: "Miguel Torres", department: "Ingeniería" },
    { id: "u-ing-3", name: "Sofia Hernández", department: "Ingeniería" },
    { id: "u-ven-1", name: "Diego Morales", department: "Ventas" },
    { id: "u-ven-2", name: "Carmen López", department: "Ventas" },
    { id: "u-ven-3", name: "Roberto Silva", department: "Ventas" },
    { id: "u-flt-1", name: "María Jiménez", department: "Flota" },
    { id: "u-flt-2", name: "José Ramírez", department: "Flota" },
    { id: "u-flt-3", name: "Patricia Vargas", department: "Flota" },
    { id: "u-flt-4", name: "Fernando Castro", department: "Flota" },
    { id: "u-sec-1", name: "Rosa Mendoza", department: "Seguridad" },
    { id: "u-sec-2", name: "Alberto Ruiz", department: "Seguridad" },
    { id: "u-aud-1", name: "Pablo Guerrero", department: "Auditoría" },
    { id: "u-dir-1", name: "Elena Vásquez", department: "Ops" },
    { id: "u-dir-2", name: "Ricardo Peña", department: "Ingeniería" },
  ]
}

export function seedVehicles(): Vehicle[] {
  return [
    {
      id: "v-1",
      make: "Nissan",
      model: "Leaf",
      connectorType: "Type2",
      batteryKWh: 40,
      typicalChargeKW: 7,
      ownerUserId: "u-flt-1",
      nickname: "Hoja Verde",
    },
    {
      id: "v-2",
      make: "Volkswagen",
      model: "ID.4",
      connectorType: "CCS1",
      batteryKWh: 77,
      typicalChargeKW: 11,
      ownerUserId: "u-flt-1",
      nickname: "Azul Cielo",
    },
    {
      id: "v-3",
      make: "Tesla",
      model: "Model 3",
      connectorType: "NACS",
      batteryKWh: 60,
      typicalChargeKW: 11,
      ownerUserId: "u-ing-1",
      nickname: "Rayo",
    },
    {
      id: "v-4",
      make: "BYD",
      model: "Atto 3",
      connectorType: "Type2",
      batteryKWh: 60,
      typicalChargeKW: 11,
      ownerUserId: "u-ven-1",
    },
    {
      id: "v-5",
      make: "Kia",
      model: "EV6",
      connectorType: "CCS1",
      batteryKWh: 77,
      typicalChargeKW: 22,
      ownerUserId: "u-flt-2",
      nickname: "Tigre",
    },
    {
      id: "v-6",
      make: "Hyundai",
      model: "IONIQ 5",
      connectorType: "CCS1",
      batteryKWh: 72,
      typicalChargeKW: 22,
      ownerUserId: "u-ing-2",
    },
    {
      id: "v-7",
      make: "Chevrolet",
      model: "Bolt EUV",
      connectorType: "CCS1",
      batteryKWh: 65,
      typicalChargeKW: 7,
      ownerUserId: "u-ven-2",
      nickname: "Rayo Dorado",
    },
    {
      id: "v-8",
      make: "Renault",
      model: "ZOE",
      connectorType: "Type2",
      batteryKWh: 52,
      typicalChargeKW: 22,
      ownerUserId: "u-flt-3",
    },
    {
      id: "v-9",
      make: "BMW",
      model: "iX3",
      connectorType: "CCS1",
      batteryKWh: 74,
      typicalChargeKW: 11,
      ownerUserId: "u-dir-1",
      nickname: "Elegancia",
    },
    {
      id: "v-10",
      make: "Audi",
      model: "e-tron GT",
      connectorType: "CCS1",
      batteryKWh: 85,
      typicalChargeKW: 22,
      ownerUserId: "u-dir-2",
      nickname: "Potencia",
    },
    {
      id: "v-11",
      make: "Mercedes",
      model: "EQS",
      connectorType: "CCS1",
      batteryKWh: 108,
      typicalChargeKW: 22,
      ownerUserId: "u-ops-1",
    },
    {
      id: "v-12",
      make: "Polestar",
      model: "2",
      connectorType: "CCS1",
      batteryKWh: 78,
      typicalChargeKW: 11,
      ownerUserId: "u-ing-3",
      nickname: "Estrella Polar",
    },
  ]
}

export function seedEnergyPolicies(): EnergyPolicy[] {
  return [
    { siteId: "site-hq", capKW: 150, bufferMinutes: 5, graceMinutes: 8, queuePolicy: "FIFO" },
    { siteId: "site-norte", capKW: 200, bufferMinutes: 5, graceMinutes: 10, queuePolicy: "FIFO" },
    { siteId: "site-bajio", capKW: 120, bufferMinutes: 3, graceMinutes: 12, queuePolicy: "FIFO" },
  ]
}

export function seedReservations(users: User[], vehicles: Vehicle[], bays: Bay[]): Reservation[] {
  const now = new Date()
  const day = (offset: number, hour: number, min: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    d.setHours(hour, min, 0, 0)
    return d.toISOString()
  }

  const mk = (
    i: number,
    u: string,
    v: string,
    bay: Bay,
    startISO: string,
    dur: number,
    status: Reservation["status"],
  ): Reservation => ({
    id: `r-${i}`,
    userId: u,
    vehicleId: v,
    siteId: bay.siteId,
    zoneId: bay.zoneId,
    bayId: bay.id,
    connectorType: ["CCS1", "Type2", "NACS"][i % 3] as any,
    status,
    startAt: startISO,
    endAt: new Date(new Date(startISO).getTime() + dur * 60000).toISOString(),
    targetSoc: [70, 80, 85, 90, 95][i % 5],
    priority: i % 4 === 0 ? "Fleet" : i % 3 === 0 ? "Employee" : "Guest",
    urgent: i % 8 === 0,
    code: `MABE${(1000 + i).toString()}`,
  })

  const reservations: Reservation[] = []

  // Reservas de hoy
  for (let i = 0; i < 15; i++) {
    const user = users[i % users.length]
    const vehicle = vehicles.find((v) => v.ownerUserId === user.id) || vehicles[i % vehicles.length]
    const bay = bays[i % bays.length]
    const hour = 8 + ((i * 2) % 10)
    const status: Reservation["status"] =
      i < 3 ? "active" : i < 8 ? "confirmed" : i < 12 ? "requested" : i < 14 ? "completed" : "canceled"

    reservations.push(mk(i + 1, user.id, vehicle.id, bay, day(0, hour, (i * 15) % 60), 45 + i * 15, status))
  }

  // Reservas de mañana
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length]
    const vehicle = vehicles.find((v) => v.ownerUserId === user.id) || vehicles[i % vehicles.length]
    const bay = bays[i % bays.length]
    const hour = 9 + (i % 8)

    reservations.push(mk(i + 20, user.id, vehicle.id, bay, day(1, hour, (i * 20) % 60), 60, "confirmed"))
  }

  // Reservas de ayer (completadas)
  for (let i = 0; i < 8; i++) {
    const user = users[i % users.length]
    const vehicle = vehicles.find((v) => v.ownerUserId === user.id) || vehicles[i % vehicles.length]
    const bay = bays[i % bays.length]
    const hour = 10 + (i % 6)

    reservations.push(mk(i + 30, user.id, vehicle.id, bay, day(-1, hour, (i * 25) % 60), 75, "completed"))
  }

  return reservations
}

export function seedSessions(reservations: Reservation[], bays: Bay[]): Session[] {
  const activeRes = reservations.filter((r) => r.status === "active")
  const completed = reservations.filter((r) => r.status === "completed")

  const mkS = (id: string, r: Reservation, done = false): Session => ({
    id,
    reservationId: r.id,
    chargerId: bays.find((b) => b.id === r.bayId)?.chargerId ?? "",
    bayId: r.bayId ?? "",
    userId: r.userId,
    vehicleId: r.vehicleId,
    siteId: r.siteId,
    startAt: r.startAt,
    endAt: done ? r.endAt : undefined,
    kwh: done ? 15 + Math.random() * 25 : 2 + Math.random() * 8,
    status: done ? "completed" : "active",
    idleMinutes: done ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 5),
    cost: 0,
  })

  const s: Session[] = []
  activeRes.forEach((r, i) => s.push(mkS(`s-a-${i}`, r, false)))
  completed.forEach((r, i) => s.push(mkS(`s-c-${i}`, r, true)))
  return s
}

export function seedTickets(bays: Bay[]): Ticket[] {
  return [
    {
      id: "t-1",
      siteId: "site-hq",
      chargerId: bays[2].chargerId!,
      bayId: bays[2].id,
      issueType: "Conector bloqueado",
      severity: "medium",
      status: "open",
      slaDue: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "t-2",
      siteId: "site-hq",
      chargerId: bays[5].chargerId!,
      bayId: bays[5].id,
      issueType: "Fallo de comunicación OCPP",
      severity: "high",
      status: "in_progress",
      slaDue: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "t-3",
      siteId: "site-norte",
      chargerId: bays[15].chargerId!,
      bayId: bays[15].id,
      issueType: "Pantalla táctil no responde",
      severity: "low",
      status: "open",
      slaDue: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

export function seedPricingPolicies(): PricingPolicy[] {
  const touHQ = [
    { startHour: 0, endHour: 7, price: 2.8 },
    { startHour: 7, endHour: 17, price: 3.6 },
    { startHour: 17, endHour: 22, price: 5.4 }, // pico
    { startHour: 22, endHour: 24, price: 2.8 },
  ]
  const touNorte = [
    { startHour: 0, endHour: 6, price: 2.5 },
    { startHour: 6, endHour: 18, price: 3.3 },
    { startHour: 18, endHour: 22, price: 4.9 },
    { startHour: 22, endHour: 24, price: 2.5 },
  ]
  const touBajio = [
    { startHour: 0, endHour: 8, price: 2.2 },
    { startHour: 8, endHour: 16, price: 3.1 },
    { startHour: 16, endHour: 21, price: 4.5 },
    { startHour: 21, endHour: 24, price: 2.2 },
  ]

  return [
    { siteId: "site-hq", currency: "MXN", idleFeePerMinute: 0.9, tou: touHQ },
    { siteId: "site-norte", currency: "MXN", idleFeePerMinute: 0.8, tou: touNorte },
    { siteId: "site-bajio", currency: "MXN", idleFeePerMinute: 0.7, tou: touBajio },
  ]
}
