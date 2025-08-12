"use client"

import type React from "react"

import { OpsShell } from "@/components/ops-shell"
import { useState, useMemo } from "react"
import { useAppStore, hasOpsPermission } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatHourRange } from "@/lib/date"
import { ArrowRightLeft, Check, Pause, Play, User, TrendingUp, Users, Zap, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function OpsBoardPage() {
  const { toast } = useToast()
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const role = useAppStore((s) => s.ui.role)
  const isManager = role === "Site Manager"
  const canOperate = hasOpsPermission(role)

  const reservations = useAppStore((s) => s.reservations)
  const users = useAppStore((s) => s.users)
  const vehicles = useAppStore((s) => s.vehicles)
  const sessionsAll = useAppStore((s) => s.sessions)
  const baysAll = useAppStore((s) => s.bays)
  const chargers = useAppStore((s) => s.chargers)
  const tickets = useAppStore((s) => s.tickets)

  const arrivals = useMemo(() => {
    const today = new Date().toDateString()
    return reservations
      .filter(
        (r) =>
          r.siteId === siteId &&
          new Date(r.startAt).toDateString() === today &&
          (r.status === "requested" || r.status === "confirmed"),
      )
      .map((r) => {
        const u = users.find((uu) => uu.id === r.userId)
        const v = vehicles.find((vv) => vv.id === r.vehicleId)
        return {
          id: r.id,
          userName: u?.name ?? "Usuario",
          vehicleName: v ? `${v.make} ${v.model}` : "",
          startAt: r.startAt,
          endAt: r.endAt,
          targetSoc: r.targetSoc,
          status: r.status,
          priority: r.priority,
        }
      })
      .sort((a, b) => {
        // Priorizar por urgencia y hora
        const priorityOrder = { Fleet: 3, Employee: 2, Guest: 1 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
        if (aPriority !== bPriority) return bPriority - aPriority
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      })
  }, [reservations, users, vehicles, siteId])

  const active = useMemo(
    () => sessionsAll.filter((ss) => ss.siteId === siteId && ss.status === "active"),
    [sessionsAll, siteId],
  )

  const [open, setOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [targetBay, setTargetBay] = useState<string | undefined>(undefined)

  const reassignBay = useAppStore((st) => st.reassignBay)
  const startSession = useAppStore((s) => s.startSession)
  const confirmReservation = useAppStore((s) => s.confirmReservation)
  const endSession = useAppStore((s) => s.endSession)

  const bays = useMemo(() => baysAll.filter((b) => b.siteId === siteId), [baysAll, siteId])

  // Estadísticas adicionales para gerente
  const managerStats = useMemo(() => {
    if (!isManager) return null

    const siteChargers = chargers.filter((c) => c.siteId === siteId)
    const faultedChargers = siteChargers.filter((c) => c.status === "Faulted").length
    const openTickets = tickets.filter((t) => t.siteId === siteId && t.status === "open").length
    const utilizationRate = siteChargers.length > 0 ? (active.length / siteChargers.length) * 100 : 0
    const avgSessionTime =
      active.length > 0
        ? active.reduce((sum, s) => {
            const duration = Date.now() - new Date(s.startAt).getTime()
            return sum + duration / (1000 * 60) // minutos
          }, 0) / active.length
        : 0

    return {
      faultedChargers,
      openTickets,
      utilizationRate,
      avgSessionTime,
      totalChargers: siteChargers.length,
    }
  }, [isManager, chargers, siteId, tickets, active])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Fleet":
        return "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400"
      case "Employee":
        return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
      case "Guest":
        return "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
      default:
        return "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
    }
  }

  return (
    <OpsShell>
      <div className="p-4 space-y-4">
        {/* Header con estadísticas del gerente */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Panel de Control</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Supervisión operativa en tiempo real</p>
          </div>
          {isManager && (
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20">
              <TrendingUp className="h-3 w-3 mr-1" />
              Gerente de Sitio
            </Badge>
          )}
        </div>

        {/* Estadísticas avanzadas para gerente */}
        {isManager && managerStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {managerStats.utilizationRate.toFixed(1)}%
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500 flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" />
                  Utilización
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {managerStats.avgSessionTime.toFixed(0)}m
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">Tiempo promedio</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-700 dark:text-red-400">{managerStats.faultedChargers}</div>
                <div className="text-xs text-red-600 dark:text-red-500 flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Con fallas
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{managerStats.openTickets}</div>
                <div className="text-xs text-amber-600 dark:text-amber-500">Tickets abiertos</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Llegadas de hoy */}
        <BoardSection title="Llegadas Programadas Hoy" itemsCount={arrivals.length}>
          <div className="space-y-3">
            {arrivals.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <Users className="h-8 w-8 mx-auto mb-2" />
                No hay llegadas programadas para hoy
              </div>
            ) : (
              arrivals.map((r) => (
                <Card key={r.id} className={`rounded-xl ${getPriorityColor(r.priority)}`}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {r.userName} · {r.vehicleName}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {r.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      Ventana {formatHourRange(r.startAt, r.endAt)} · Objetivo {r.targetSoc}%
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === "requested" && canOperate && (
                        <Button
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white"
                          onClick={() => {
                            confirmReservation(r.id)
                            toast({ title: "Reserva confirmada", description: "La reserva ha sido aprobada." })
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                      )}
                      {canOperate && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            startSession(r.id)
                            toast({ title: "Sesión iniciada", description: "El usuario puede comenzar a cargar." })
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar sesión
                        </Button>
                      )}
                      {!canOperate && (
                        <div className="text-xs text-slate-500">Acceso limitado - contacta al operador</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </BoardSection>

        {/* Sesiones activas */}
        <BoardSection title="Sesiones Activas" itemsCount={active.length}>
          <div className="space-y-3">
            {active.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <Zap className="h-8 w-8 mx-auto mb-2" />
                No hay sesiones de carga activas
              </div>
            ) : (
              active.map((s) => (
                <Card key={s.id} className="rounded-xl border-slate-200 dark:border-slate-700">
                  <CardContent className="py-3">
                    <div className="text-sm font-medium mb-1">{sessionTitle(s.id)}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      Bahía {sessionBayLabel(s.bayId)} · {s.kwh.toFixed(1)} kWh · {s.idleMinutes}min idle
                    </div>
                    <div className="flex items-center gap-2">
                      {canOperate && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              endSession(s.id)
                              toast({ title: "Sesión finalizada", description: "La carga ha sido completada." })
                            }}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                          <Dialog
                            open={open && selectedSession === s.id}
                            onOpenChange={(o) => {
                              setOpen(o)
                              if (!o) setSelectedSession(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedSession(s.id)}>
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Reasignar bahía
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mover a otra bahía</DialogTitle>
                              </DialogHeader>
                              <Select onValueChange={(v) => setTargetBay(v)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona bahía" />
                                </SelectTrigger>
                                <SelectContent>
                                  {bays.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                      {b.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <DialogFooter>
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setOpen(false)
                                    setSelectedSession(null)
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (targetBay && selectedSession) {
                                      reassignBay({ sessionId: selectedSession, newBayId: targetBay })
                                      toast({
                                        title: "Bahía reasignada",
                                        description: "La sesión se movió exitosamente.",
                                      })
                                      setOpen(false)
                                      setSelectedSession(null)
                                    }
                                  }}
                                >
                                  Mover
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                      {!canOperate && (
                        <div className="text-xs text-slate-500">Solo lectura - sin permisos de operación</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </BoardSection>

        {/* Mensaje para roles sin permisos */}
        {!canOperate && (
          <Card className="rounded-xl border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="py-4 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <div className="text-amber-800 dark:text-amber-200 font-medium">Acceso Limitado</div>
              <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Tu rol actual permite solo visualización. Contacta al gerente para realizar acciones operativas.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OpsShell>
  )

  function sessionTitle(sessionId: string) {
    const s = useAppStore.getState().sessions.find((x) => x.id === sessionId)
    const u = useAppStore.getState().users.find((uu) => uu.id === s?.userId)
    const v = useAppStore.getState().vehicles.find((vv) => vv.id === s?.vehicleId)
    return `${u?.name ?? "Usuario"} · ${v ? v.make + " " + v.model : ""}`
  }
  function sessionBayLabel(bayId: string) {
    return useAppStore.getState().bays.find((b) => b.id === bayId)?.label ?? "—"
  }
}

function BoardSection({
  title,
  itemsCount,
  children,
}: {
  title: string
  itemsCount: number
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">{itemsCount}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">{children}</CardContent>
    </Card>
  )
}
