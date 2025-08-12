"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { OpsShell } from "@/components/ops-shell"
import { useState, useMemo } from "react"
import { useAppStore } from "@/store/use-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatHourRange } from "@/lib/date"
import { ChartEnergy } from "@/components/energy-dashboard"
import { ArrowRightLeft, Check, Gauge, Pause, Play, User } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OpsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/ops/board")
  }, [router])

  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const role = useAppStore((s) => s.ui.role)

  const reservations = useAppStore((s) => s.reservations)
  const users = useAppStore((s) => s.users)
  const vehicles = useAppStore((s) => s.vehicles)
  const sessionsAll = useAppStore((s) => s.sessions)
  const queueAll = useAppStore((s) => s.queue)
  const baysAll = useAppStore((s) => s.bays)

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
        }
      })
  }, [reservations, users, vehicles, siteId])

  const active = useMemo(
    () => sessionsAll.filter((ss) => ss.siteId === siteId && ss.status === "active"),
    [sessionsAll, siteId],
  )

  const queue = useMemo(() => queueAll.filter((q) => q.siteId === siteId), [queueAll, siteId])

  const isOps = ["Operator", "Site Manager", "Admin-lite", "Technician"].includes(role)

  const [open, setOpen] = useState(false)
  const [targetBay, setTargetBay] = useState<string | undefined>(undefined)

  const reassignBay = useAppStore((st) => st.reassignBay)
  const startSession = useAppStore((s) => s.startSession)
  const confirmReservation = useAppStore((s) => s.confirmReservation)
  const endSession = useAppStore((s) => s.endSession)

  const bays = useMemo(() => baysAll.filter((b) => b.siteId === siteId), [baysAll, siteId])

  const dlmFn = useAppStore((s) => s.dlmForSite)
  const dlm = useMemo(() => dlmFn(siteId), [dlmFn, siteId])

  return (
    <OpsShell>
      <div className="p-4">
        {!isOps && (
          <Card className="mb-3">
            <CardContent className="py-3 text-sm text-amber-600">
              Este panel es de uso operativo. Cambia a rol “Operator” para acciones completas.
            </CardContent>
          </Card>
        )}
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="board">Tablero</TabsTrigger>
            <TabsTrigger value="energy">Energía</TabsTrigger>
            <TabsTrigger value="queue">Cola</TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="space-y-3">
            <BoardSection title="Llegadas" itemsCount={arrivals.length}>
              <div className="grid gap-2">
                {arrivals.map((r) => (
                  <Card key={r.id} className="rounded-xl border-muted">
                    <CardContent className="py-3">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" /> {r.userName} · {r.vehicleName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Ventana {formatHourRange(r.startAt, r.endAt)} · Objetivo {r.targetSoc}%
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {r.status === "requested" && (
                          <Button size="sm" onClick={() => confirmReservation(r.id)} disabled={!isOps}>
                            <Check className="h-4 w-4 mr-2" /> Confirmar
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => startSession(r.id)} disabled={!isOps}>
                          <Play className="h-4 w-4 mr-2" /> Iniciar sesión
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </BoardSection>

            <BoardSection title="Activas" itemsCount={active.length}>
              <div className="grid gap-2">
                {active.map((s) => (
                  <Card key={s.id} className="rounded-xl border-muted">
                    <CardContent className="py-3">
                      <div className="text-sm font-medium">{sessionTitle(s.id)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Bahía {sessionBayLabel(s.bayId)}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => endSession(s.id)} disabled={!isOps}>
                          <Pause className="h-4 w-4 mr-2" /> Finalizar
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" disabled={!isOps}>
                              <ArrowRightLeft className="h-4 w-4 mr-2" /> Reasignar bahía
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
                              <Button variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => {
                                  if (targetBay) {
                                    reassignBay({ sessionId: s.id, newBayId: targetBay })
                                    setOpen(false)
                                  }
                                }}
                              >
                                Mover
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </BoardSection>
          </TabsContent>

          <TabsContent value="energy" className="space-y-3">
            <ChartEnergy />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">DLM · Distribución</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Cap del sitio: {dlm.siteCapKW} kW · Sesiones: {dlm.sessions.length}
                </div>
                <div className="grid gap-2">
                  {dlm.sessions.map((s) => (
                    <div key={s.sessionId} className="flex items-center justify-between text-sm">
                      <span className="truncate">
                        {s.userName} · {s.vehicle} · {s.bayLabel}
                      </span>
                      <Badge variant={s.assignedKW < s.maxKW ? "outline" : "default"}>{s.assignedKW} kW</Badge>
                    </div>
                  ))}
                </div>
                {dlm.throttledCount > 0 && (
                  <div className="text-xs text-amber-600 flex items-center gap-2">
                    <Gauge className="h-4 w-4" /> Estranguladas: {dlm.throttledCount}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="space-y-3">
            <BoardSection title="Cola" itemsCount={queue.length}>
              <div className="grid gap-2">
                {queue.map((q) => (
                  <Card key={q.id} className="rounded-xl border-muted">
                    <CardContent className="py-3">
                      <div className="text-sm font-medium">{queueTitle(q.id)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Prioridad: {q.priority}</div>
                      <div className="mt-2">
                        <Button size="sm" disabled={!isOps}>
                          <Check className="h-4 w-4 mr-2" /> Asignar siguiente
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </BoardSection>
          </TabsContent>
        </Tabs>
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
  function queueTitle(queueId: string) {
    const q = useAppStore.getState().queue.find((x) => x.id === queueId)
    const u = useAppStore.getState().users.find((uu) => uu.id === q?.userId)
    const v = useAppStore.getState().vehicles.find((vv) => vv.id === q?.vehicleId)
    return `${u?.name ?? "Usuario"} · ${v ? v.make + " " + v.model : ""}`
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
