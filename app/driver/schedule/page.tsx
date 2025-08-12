"use client"

import { DriverShell } from "@/components/driver-shell"
import { useMemo, useState } from "react"
import { useAppStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Edit2, MapPin, QrCode, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { formatHourRange, shortDate, addMinutesISO } from "@/lib/date"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { generateICSAndDownload } from "@/lib/ics"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserReportSystem } from "@/components/user-report-system"

export default function SchedulePage() {
  const { toast } = useToast()
  const currentUserId = useAppStore((s) => s.ui.currentUserId)

  const reservationsAll = useAppStore((s) => s.reservations)
  const reservations = useMemo(() => {
    return reservationsAll
      .filter((r) => r.userId === currentUserId)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }, [reservationsAll, currentUserId])

  // Separar reservas por estado
  const activeReservations = useMemo(() => {
    return reservations.filter((r) => ["requested", "confirmed", "active"].includes(r.status))
  }, [reservations])

  const completedReservations = useMemo(() => {
    return reservations.filter((r) => r.status === "completed")
  }, [reservations])

  const canceledReservations = useMemo(() => {
    return reservations.filter((r) => ["canceled", "no-show", "expired"].includes(r.status))
  }, [reservations])

  const sites = useAppStore((s) => s.sites)
  const cancelReservation = useAppStore((s) => s.cancelReservation)
  const updateReservationWindow = useAppStore((s) => s.updateReservationWindow)

  const [editId, setEditId] = useState<string | null>(null)
  const resToEdit = useMemo(() => reservations.find((r) => r.id === editId), [reservations, editId])
  const [start, setStart] = useState<string | null>(null)
  const [duration, setDuration] = useState(60)

  const ReservationCard = ({ r }: { r: any }) => (
    <Card key={r.id} className="rounded-xl border-slate-200 dark:border-slate-700">
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{sites.find((s) => s.id === r.siteId)?.name}</span>
          <Badge variant={getStatusVariant(r.status)} className="flex items-center gap-1">
            {getStatusIcon(r.status)}
            {labelStatus(r.status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 pb-3">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <span>
            {shortDate(new Date(r.startAt))} · {formatHourRange(r.startAt, r.endAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <MapPin className="h-4 w-4" />
          <span>
            {r.connectorType} · objetivo {r.targetSoc}%
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => generateICSAndDownload(r)}>
            <Clock className="h-4 w-4 mr-2" /> Calendario
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(r.code ?? "")}>
            <QrCode className="h-4 w-4 mr-2" /> Código
          </Button>
          {["requested", "confirmed"].includes(r.status) && (
            <>
              <Dialog open={editId === r.id} onOpenChange={(o) => setEditId(o ? r.id : null)}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4 mr-2" /> Modificar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modificar horario</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="text-sm">Inicio</div>
                    <Input
                      type="datetime-local"
                      value={start ?? r.startAt.slice(0, 16)}
                      onChange={(e) => setStart(e.target.value)}
                    />
                    <div className="text-sm">Duración (min)</div>
                    <Input
                      type="number"
                      min={15}
                      step={15}
                      value={duration}
                      onChange={(e) => setDuration(Number.parseInt(e.target.value || "60"))}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setEditId(null)} variant="ghost">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        const newStart = start ? new Date(start).toISOString() : r.startAt
                        const newEnd = addMinutesISO(newStart, duration)
                        updateReservationWindow(r.id, newStart, newEnd)
                        toast({ title: "Reserva actualizada", description: "Se ajustó la ventana de tiempo." })
                        setEditId(null)
                      }}
                    >
                      Guardar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Sistema de reportes para reservas activas */}
        {["confirmed", "active"].includes(r.status) && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <UserReportSystem
              reservationId={r.id}
              onReport={() => toast({ title: "Reporte enviado", description: "Se ha procesado tu reporte" })}
              onCancel={() => toast({ title: "Reserva cancelada", description: "Tu reserva ha sido cancelada" })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <DriverShell>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mi agenda</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{reservations.length} reservas totales</div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Activas ({activeReservations.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completadas ({completedReservations.length})
            </TabsTrigger>
            <TabsTrigger value="canceled" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Canceladas ({canceledReservations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {activeReservations.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <div className="text-slate-600 dark:text-slate-400">No tienes reservas activas</div>
                  <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Usa "Reserva rápida" en Inicio para crear una nueva
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeReservations.map((r) => (
                  <ReservationCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedReservations.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <div className="text-slate-600 dark:text-slate-400">No tienes cargas completadas aún</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedReservations.map((r) => (
                  <ReservationCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="canceled" className="space-y-3 mt-4">
            {canceledReservations.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center">
                  <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <div className="text-slate-600 dark:text-slate-400">No tienes reservas canceladas</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {canceledReservations.map((r) => (
                  <ReservationCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DriverShell>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
    case "active":
      return "default"
    case "completed":
      return "secondary"
    case "canceled":
    case "expired":
    case "no-show":
      return "destructive"
    default:
      return "outline"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "confirmed":
    case "active":
      return <CheckCircle className="h-3 w-3" />
    case "completed":
      return <CheckCircle className="h-3 w-3" />
    case "canceled":
    case "expired":
    case "no-show":
      return <XCircle className="h-3 w-3" />
    default:
      return <AlertTriangle className="h-3 w-3" />
  }
}

function labelStatus(s: string) {
  const map: Record<string, string> = {
    requested: "Solicitada",
    confirmed: "Confirmada",
    active: "Activa",
    completed: "Completada",
    canceled: "Cancelada",
    "no-show": "No asistió",
    expired: "Expirada",
  }
  return map[s] ?? s
}
