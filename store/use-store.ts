"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Site } from "@/types/site"
import type { Zone } from "@/types/zone"
import type { Bay } from "@/types/bay"
import type { Charger } from "@/types/charger"
import type { User } from "@/types/user"
import type { Vehicle } from "@/types/vehicle"
import type { Reservation, ReservationStatus } from "@/types/reservation"
import type { Session } from "@/types/session"
import type { QueueItem } from "@/types/queue"
import type { Ticket } from "@/types/ticket"
import type { EnergyPolicy } from "@/types/energy"
import type { PricingPolicy } from "@/types/pricing"
import type { Guest, GuestReservation } from "@/types/guest"
import type { ExpressCharge } from "@/types/express-charge"
import type { UserReport } from "@/types/user-report"
import type { SuspensionPoint, UserSuspension } from "@/types/suspension"
import type { VehicleDocument } from "@/types/document"
import {
  seedBays,
  seedChargers,
  seedEnergyPolicies,
  seedReservations,
  seedSessions,
  seedSites,
  seedTickets,
  seedUsers,
  seedVehicles,
  seedZones,
  seedPricingPolicies,
} from "@/data/seeds"
import type { Role } from "./use-store-types"
import { estimateSessionCost } from "@/lib/pricing"
import { getPointsForAction, getSuspensionEndDate, isUserSuspended } from "@/lib/suspension"
import { canMakeReservation, countWeeklyReservations } from "@/lib/reservation-limits"
import { addMinutesISO } from "@/lib/date"

export type { Role } from "./use-store-types"

export function hasOpsPermission(role: Role) {
  return ["Operator", "Site Manager", "Admin-lite", "Technician"].includes(role)
}

type UIState = {
  role: Role
  currentSiteId: string
  currentUserId: string
  currentVehicleId: string
  theme: "light" | "dark"
}

type AppState = {
  sites: Site[]
  zones: Zone[]
  bays: Bay[]
  chargers: Charger[]
  users: User[]
  vehicles: Vehicle[]
  reservations: Reservation[]
  sessions: Session[]
  queue: QueueItem[]
  tickets: Ticket[]
  energyPolicies: EnergyPolicy[]
  pricingPolicies: PricingPolicy[]

  // Nuevas funcionalidades AutoCharge
  guests: Guest[]
  guestReservations: GuestReservation[]
  expressCharges: ExpressCharge[]
  userReports: UserReport[]
  suspensions: UserSuspension[]
  vehicleDocuments: VehicleDocument[]
  hostUsers: string[]

  ui: UIState

  // actions
  resetDemo: () => void
  setRole: (r: Role) => void
  setTheme: (t: "light" | "dark") => void
  setCurrentSite: (siteId: string) => void
  setCurrentUser: (userId: string) => void
  setCurrentVehicle: (vehicleId: string) => void

  // Vehículos
  addVehicle: (input: {
    make: string
    model: string
    connectorType: Vehicle["connectorType"]
    batteryKWh: number
    typicalChargeKW: number
    nickname?: string
  }) => string
  updateVehicle: (id: string, patch: Partial<Omit<Vehicle, "id" | "ownerUserId">>) => void
  removeVehicle: (id: string) => void

  // Reservas/sesiones
  quickBook: (input: {
    zoneId: string
    connectorType: Reservation["connectorType"]
    startAt: string
    endAt: string
    bayId: string
  }) => void
  bookReservation: (r: Omit<Reservation, "id" | "status" | "code"> & { status?: ReservationStatus }) => string
  confirmReservation: (id: string) => void
  updateReservationWindow: (id: string, startAt: string, endAt: string) => void
  cancelReservation: (id: string) => void
  startSession: (reservationId: string) => void
  endSession: (sessionId: string) => void
  reassignBay: (args: { sessionId: string; newBayId: string }) => void
  findReservationByCode: (code: string) => Reservation | undefined
  endSessionByCode: (code: string) => boolean

  // Políticas
  updateEnergyPolicy: (siteId: string, patch: Partial<EnergyPolicy>) => void

  // Nuevas funciones AutoCharge
  addGuest: (guest: Omit<Guest, "id" | "createdAt" | "monthlyReservations">) => string
  canUserHostGuests: (userId: string) => boolean
  bookGuestReservation: (reservation: Omit<GuestReservation, "id" | "status" | "code">) => string
  addSuspensionPoint: (userId: string, type: SuspensionPoint["type"], reason: string, reservationId?: string) => void
  getUserSuspension: (userId: string) => UserSuspension | undefined
  isUserSuspended: (userId: string) => boolean
  clearUserSuspension: (userId: string) => void
  startExpressCharge: (params: { userId: string; siteId: string; bayId: string; duration: number }) => string
  endExpressCharge: (id: string) => void
  submitUserReport: (report: Omit<UserReport, "id" | "createdAt" | "status">) => string
  canUserMakeReservation: (userId: string) => { canReserve: boolean; reason?: string }
  getUserWeeklyReservations: (userId: string) => number

  // selectors/helpers
  kpisForSite: (siteId: string) => { active: number; today: number; capKW: number; renewable: number }
  dlmForSite: (siteId: string) => {
    siteCapKW: number
    sessions: Array<{
      sessionId: string
      userName: string
      vehicle: string
      bayLabel: string
      assignedKW: number
      maxKW: number
    }>
    throttledCount: number
    totalAssignedKW: number
  }
}

const defaultSeeds = () => {
  const sites = seedSites()
  const zones = seedZones()
  const bays = seedBays()
  const chargers = seedChargers(bays)
  const users = seedUsers()
  const vehicles = seedVehicles()
  const reservations = seedReservations(users, vehicles, bays)
  const sessions = seedSessions(reservations, bays)
  const tickets = seedTickets(bays)
  const energyPolicies = seedEnergyPolicies()
  const pricingPolicies = seedPricingPolicies()
  return {
    sites,
    zones,
    bays,
    chargers,
    users,
    vehicles,
    reservations,
    sessions,
    tickets,
    energyPolicies,
    pricingPolicies,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultSeeds(),
      queue: [],
      guests: [],
      guestReservations: [],
      expressCharges: [],
      userReports: [],
      suspensions: [],
      vehicleDocuments: [],
      hostUsers: ["u-flt-1", "u-ops-1", "u-ing-1"],

      ui: {
        role: "Driver",
        currentSiteId: "site-hq",
        currentUserId: "u-flt-1",
        currentVehicleId: "v-2",
        theme: "light",
      },

      resetDemo: () => {
        const seeds = defaultSeeds()
        set({
          ...seeds,
          queue: [],
          guests: [],
          guestReservations: [],
          expressCharges: [],
          userReports: [],
          suspensions: [],
          vehicleDocuments: [],
          hostUsers: ["u-flt-1", "u-ops-1", "u-ing-1"],
          ui: {
            role: "Driver",
            currentSiteId: "site-hq",
            currentUserId: "u-flt-1",
            currentVehicleId: "v-2",
            theme: "light",
          },
        })
        try {
          localStorage.removeItem("mabe-ev")
        } catch {}
      },

      setRole: (r) => set((s) => ({ ui: { ...s.ui, role: r } })),
      setTheme: (t) => set((s) => ({ ui: { ...s.ui, theme: t } })),
      setCurrentSite: (siteId) => set((s) => ({ ui: { ...s.ui, currentSiteId: siteId } })),
      setCurrentUser: (userId) => set((s) => ({ ui: { ...s.ui, currentUserId: userId } })),
      setCurrentVehicle: (vehicleId) => set((s) => ({ ui: { ...s.ui, currentVehicleId: vehicleId } })),

      addVehicle: (input) => {
        const id = `v-${Math.random().toString(36).slice(2, 9)}`
        const owner = get().ui.currentUserId
        const v: Vehicle = { id, ownerUserId: owner, ...input }
        set((s) => ({ vehicles: [...s.vehicles, v], ui: { ...s.ui, currentVehicleId: id } }))
        return id
      },

      updateVehicle: (id, patch) => {
        const user = get().ui.currentUserId
        set((s) => ({
          vehicles: s.vehicles.map((v) => (v.id === id && v.ownerUserId === user ? { ...v, ...patch } : v)),
        }))
      },

      removeVehicle: (id) => {
        const user = get().ui.currentUserId
        set((s) => {
          const toRemove = s.vehicles.find((v) => v.id === id && v.ownerUserId === user)
          if (!toRemove) return s as any
          const vehicles = s.vehicles.filter((v) => v.id !== id)
          const newCurrent =
            s.ui.currentVehicleId === id
              ? (vehicles.find((v) => v.ownerUserId === user)?.id ?? vehicles[0]?.id ?? "")
              : s.ui.currentVehicleId
          return { vehicles, ui: { ...s.ui, currentVehicleId: newCurrent } }
        })
      },

      quickBook: ({ zoneId, connectorType, startAt, endAt, bayId }) => {
        const state = get()
        const id = get().bookReservation({
          userId: state.ui.currentUserId,
          vehicleId: state.ui.currentVehicleId,
          siteId: state.ui.currentSiteId,
          zoneId,
          bayId,
          connectorType,
          startAt,
          endAt,
          targetSoc: 80,
          priority: "Employee",
        })
        get().confirmReservation(id)
      },

      bookReservation: (r) => {
        const id = `r-${Math.random().toString(36).slice(2, 9)}`
        const code = `MABE-${Math.floor(1000 + Math.random() * 9000)}`
        const res: Reservation = { id, code, status: "requested", urgent: false, ...r }
        set((s) => ({ reservations: [...s.reservations, res] }))
        return id
      },

      confirmReservation: (id) => {
        set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r)) }))
      },

      updateReservationWindow: (id, startAt, endAt) => {
        set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, startAt, endAt } : r)) }))
      },

      cancelReservation: (id) => {
        set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, status: "canceled" } : r)) }))
      },

      startSession: (reservationId) => {
        const s = get()
        const r = s.reservations.find((x) => x.id === reservationId)
        if (!r) return
        let bayId = r.bayId
        if (!bayId) {
          const available = s.bays.filter((b) => b.siteId === r.siteId && b.zoneId === r.zoneId)
          bayId = available[0]?.id
        }
        const session: Session = {
          id: `s-${Math.random().toString(36).slice(2, 8)}`,
          reservationId: r.id,
          chargerId: s.bays.find((b) => b.id === (bayId ?? ""))?.chargerId ?? "",
          bayId: bayId ?? "",
          userId: r.userId,
          vehicleId: r.vehicleId,
          siteId: r.siteId,
          startAt: new Date().toISOString(),
          kwh: 0.5,
          status: "active",
          idleMinutes: 0,
          cost: 0,
        }
        set({
          reservations: s.reservations.map((rr) => (rr.id === r.id ? { ...rr, status: "active", bayId: bayId } : rr)),
          sessions: [...s.sessions, session],
        })
      },

      endSession: (sessionId) => {
        const s = get()
        const sess = s.sessions.find((x) => x.id === sessionId)
        if (!sess) return
        const pricing = s.pricingPolicies.find((p) => p.siteId === sess.siteId)
        const energyPolicy = s.energyPolicies.find((p) => p.siteId === sess.siteId)
        const { total } = estimateSessionCost({ session: sess, pricing, energyPolicy })
        set({
          sessions: s.sessions.map((x) =>
            x.id === sessionId
              ? {
                  ...x,
                  status: "completed",
                  endAt: new Date().toISOString(),
                  kwh: x.kwh + 16,
                  cost: Number(total.toFixed(2)),
                }
              : x,
          ),
          reservations: s.reservations.map((r) => (r.id === sess.reservationId ? { ...r, status: "completed" } : r)),
        })
      },

      reassignBay: ({ sessionId, newBayId }) => {
        const s = get()
        const sess = s.sessions.find((x) => x.id === sessionId)
        const newBay = s.bays.find((b) => b.id === newBayId)
        if (!sess || !newBay) return
        const newChargerId = newBay.chargerId ?? ""
        set({
          sessions: s.sessions.map((x) =>
            x.id === sessionId ? { ...x, bayId: newBayId, chargerId: newChargerId } : x,
          ),
          reservations: s.reservations.map((r) => (r.id === sess.reservationId ? { ...r, bayId: newBayId } : r)),
        })
      },

      findReservationByCode: (code: string) => {
        const clean = code.trim().toUpperCase()
        return get().reservations.find((r) => (r.code ?? "").toUpperCase() === clean)
      },

      endSessionByCode: (code: string) => {
        const r = get().findReservationByCode(code)
        if (!r) return false
        const sess = get().sessions.find((s) => s.reservationId === r.id && s.status === "active")
        if (!sess) return false
        get().endSession(sess.id)
        return true
      },

      updateEnergyPolicy: (siteId, patch) => {
        set((s) => ({
          energyPolicies: s.energyPolicies.map((p) => (p.siteId === siteId ? { ...p, ...patch, siteId } : p)),
        }))
      },

      // Nuevas funciones AutoCharge
      addGuest: (guestData) => {
        const id = `g-${Math.random().toString(36).slice(2, 9)}`
        const guest: Guest = {
          id,
          ...guestData,
          createdAt: new Date().toISOString(),
          monthlyReservations: 0,
        }
        set((s) => ({ guests: [...s.guests, guest] }))
        return id
      },

      canUserHostGuests: (userId) => {
        return get().hostUsers.includes(userId)
      },

      bookGuestReservation: (reservationData) => {
        const id = `gr-${Math.random().toString(36).slice(2, 9)}`
        const code = `GUEST-${Math.floor(1000 + Math.random() * 9000)}`
        const reservation: GuestReservation = {
          id,
          code,
          status: "requested",
          urgent: false,
          ...reservationData,
        }
        set((s) => ({ guestReservations: [...s.guestReservations, reservation] }))
        return id
      },

      addSuspensionPoint: (userId, type, reason, reservationId) => {
        const points = getPointsForAction(type)
        const suspensionPoint: SuspensionPoint = {
          id: `sp-${Math.random().toString(36).slice(2, 9)}`,
          userId,
          type,
          points,
          reason,
          createdAt: new Date().toISOString(),
          reservationId,
        }

        set((s) => {
          const existingSuspension = s.suspensions.find((sus) => sus.userId === userId)
          const newHistory = existingSuspension ? [...existingSuspension.history, suspensionPoint] : [suspensionPoint]
          const totalPoints = newHistory.reduce((sum, point) => sum + point.points, 0)
          const suspendedUntil = getSuspensionEndDate(totalPoints)

          const updatedSuspension: UserSuspension = {
            userId,
            totalPoints,
            suspendedUntil,
            isActive: !!suspendedUntil && new Date(suspendedUntil) > new Date(),
            history: newHistory,
          }

          const updatedSuspensions = existingSuspension
            ? s.suspensions.map((sus) => (sus.userId === userId ? updatedSuspension : sus))
            : [...s.suspensions, updatedSuspension]

          return { suspensions: updatedSuspensions }
        })
      },

      getUserSuspension: (userId) => {
        return get().suspensions.find((s) => s.userId === userId)
      },

      isUserSuspended: (userId) => {
        const suspension = get().getUserSuspension(userId)
        return suspension ? isUserSuspended(suspension) : false
      },

      clearUserSuspension: (userId) => {
        set((s) => ({
          suspensions: s.suspensions.filter((sus) => sus.userId !== userId),
        }))
      },

      startExpressCharge: ({ userId, siteId, bayId, duration }) => {
        const id = `ec-${Math.random().toString(36).slice(2, 9)}`
        const startAt = new Date().toISOString()
        const endAt = addMinutesISO(startAt, duration)

        const expressCharge: ExpressCharge = {
          id,
          userId,
          siteId,
          bayId,
          startAt,
          endAt,
          maxDuration: duration,
          status: "active",
          photos: {
            chargerBefore: [],
            initialCharge: "",
          },
        }

        set((s) => ({ expressCharges: [...s.expressCharges, expressCharge] }))
        return id
      },

      endExpressCharge: (id) => {
        set((s) => ({
          expressCharges: s.expressCharges.map((ec) =>
            ec.id === id ? { ...ec, status: "completed", endAt: new Date().toISOString() } : ec,
          ),
        }))
      },

      submitUserReport: (reportData) => {
        const id = `ur-${Math.random().toString(36).slice(2, 9)}`
        const report: UserReport = {
          id,
          ...reportData,
          createdAt: new Date().toISOString(),
          status: "pending",
        }
        set((s) => ({ userReports: [...s.userReports, report] }))
        return id
      },

      canUserMakeReservation: (userId) => {
        const state = get()
        const user = state.users.find((u) => u.id === userId)
        if (!user) return { canReserve: false, reason: "Usuario no encontrado" }

        if (get().isUserSuspended(userId)) {
          return { canReserve: false, reason: "Tu cuenta está suspendida" }
        }

        const isHost = get().canUserHostGuests(userId)
        return canMakeReservation(state.reservations, userId, state.ui.role, isHost)
      },

      getUserWeeklyReservations: (userId) => {
        return countWeeklyReservations(get().reservations, userId)
      },

      kpisForSite: (siteId) => {
        const today = new Date()
        const isToday = (iso: string) => {
          const d = new Date(iso)
          return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          )
        }
        const active = get().sessions.filter((s) => s.siteId === siteId && s.status === "active").length
        const todayRes = get().reservations.filter((r) => r.siteId === siteId && isToday(r.startAt)).length
        const capKW = get().energyPolicies.find((p) => p.siteId === siteId)?.capKW ?? 80
        const renewable = get().sites.find((s) => s.id === siteId)?.renewablePercent ?? 35
        return { active, today: todayRes, capKW, renewable }
      },

      dlmForSite: (siteId) => {
        const state = get()
        const cap = state.energyPolicies?.find((p) => p.siteId === siteId)?.capKW ?? 80
        const sessions = state.sessions.filter((s) => s.siteId === siteId && s.status === "active")
        const parts = sessions.length || 1
        const per = Math.floor(cap / parts)
        const result = sessions.map((s) => {
          const vehicle = state.vehicles.find((v) => v.id === s.vehicleId)
          const user = state.users.find((u) => u.id === s.userId)
          const bay = state.bays.find((b) => b.id === s.bayId)
          const charger = state.chargers.find((c) => c.bayId === s.bayId)
          const maxKW = Math.min(charger?.powerKW ?? 7, vehicle?.typicalChargeKW ?? 7)
          const assigned = Math.min(per, maxKW)
          return {
            sessionId: s.id,
            userName: user?.name ?? "Usuario",
            vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : "",
            bayLabel: bay?.label ?? "",
            assignedKW: assigned,
            maxKW,
          }
        })
        const throttled = result.filter((r) => r.assignedKW < r.maxKW).length
        const totalAssigned = result.reduce((acc, r) => acc + r.assignedKW, 0)
        return { siteCapKW: cap, sessions: result, throttledCount: throttled, totalAssignedKW: totalAssigned }
      },
    }),
    {
      name: "mabe-ev",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => s,
    },
  ),
)
