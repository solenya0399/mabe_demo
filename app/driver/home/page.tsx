"use client"

import { DriverShell } from "@/components/driver-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickBookSheet } from "@/components/quick-book-sheet"
import { SuspensionSystem } from "@/components/suspension-system"
import { useMemo, useState } from "react"
import { useAppStore } from "@/store/use-store"
import {
  CalendarDays,
  Car,
  Clock,
  MapPin,
  QrCode,
  Zap,
  Battery,
  Gauge,
  TrendingUp,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import { formatHourRange, shortDate } from "@/lib/date"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GuestManagement } from "@/components/guest-management"
import { ExpressCharge } from "@/components/express-charge"

export default function HomePage() {
  const { toast } = useToast()
  const [openQB, setOpenQB] = useState(false)

  const currentUserId = useAppStore((s) => s.ui.currentUserId)
  const users = useAppStore((s) => s.users)
  const user = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId])

  const reservationsAll = useAppStore((s) => s.reservations)
  const reservations = useMemo(() => {
    return reservationsAll
      .filter((r) => r.userId === currentUserId)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }, [reservationsAll, currentUserId])

  const nextRes = useMemo(() => {
    const now = Date.now()
    return reservations.find(
      (r) =>
        new Date(r.endAt).getTime() > now &&
        (r.status === "confirmed" || r.status === "requested" || r.status === "active"),
    )
  }, [reservations])

  const vehicles = useAppStore((s) => s.vehicles)
  const currentVehicleId = useAppStore((s) => s.ui.currentVehicleId)
  const setCurrentVehicle = useAppStore((s) => s.setCurrentVehicle)
  const currentVehicle = useMemo(() => vehicles.find((v) => v.id === currentVehicleId), [vehicles, currentVehicleId])

  const sites = useAppStore((s) => s.sites)
  const currentSiteId = useAppStore((s) => s.ui.currentSiteId)
  const site = useMemo(() => sites.find((ss) => ss.id === currentSiteId), [sites, currentSiteId])

  // Verificar suspensión
  const isUserSuspended = useAppStore((s) => s.isUserSuspended)
  const suspended = useMemo(() => isUserSuspended(currentUserId), [isUserSuspended, currentUserId])

  // Límites de reservas
  const canUserMakeReservation = useAppStore((s) => s.canUserMakeReservation)
  const getUserWeeklyReservations = useAppStore((s) => s.getUserWeeklyReservations)
  const weeklyReservations = useMemo(
    () => getUserWeeklyReservations(currentUserId),
    [getUserWeeklyReservations, currentUserId],
  )
  const reservationLimit = useMemo(() => canUserMakeReservation(currentUserId), [canUserMakeReservation, currentUserId])

  // Verificar si puede ser anfitrión
  const canHostGuests = useAppStore((s) => s.canUserHostGuests)
  const isHost = useMemo(() => canHostGuests(currentUserId), [canHostGuests, currentUserId])

  // Estadísticas del usuario
  const userStats = useMemo(() => {
    const userReservations = reservations.filter((r) => r.userId === currentUserId)
    const completed = userReservations.filter((r) => r.status === "completed").length
    const thisMonth = userReservations.filter((r) => {
      const resDate = new Date(r.startAt)
      const now = new Date()
      return resDate.getMonth() === now.getMonth() && resDate.getFullYear() === now.getFullYear()
    }).length

    return { completed, thisMonth }
  }, [reservations, currentUserId])

  const handleQuickBook = () => {
    if (!reservationLimit.canReserve) {
      toast({
        title: "Límite alcanzado",
        description: reservationLimit.reason,
        variant: "destructive",
      })
      return
    }
    setOpenQB(true)
  }

  return (
    <DriverShell>
      <div className="p-4 space-y-4">
        {/* Alerta de suspensión */}
        {suspended && (
          <Card className="rounded-2xl border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <div>
                  <div className="font-medium text-red-800 dark:text-red-200">Cuenta Suspendida</div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    No puedes hacer reservas hasta que se levante la suspensión
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tarjeta de bienvenida profesional */}
        <Card className="rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              ¡Hola {user?.name?.split(" ")[0] ?? "conductor"}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextRes ? (
              <div className="space-y-3">
                <div className="bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/90 dark:text-slate-700">
                    <MapPin className="h-4 w-4" />
                    <span>{site?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {shortDate(new Date(nextRes.startAt))} · {formatHourRange(nextRes.startAt, nextRes.endAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4" />
                    <span>
                      {nextRes.connectorType} · objetivo {nextRes.targetSoc}%
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="mt-2 bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900 border-white/30 dark:border-slate-700"
                  >
                    {labelStatus(nextRes.status)}
                  </Badge>
                </div>
                <Button
                  variant="secondary"
                  className="w-full bg-white/20 hover:bg-white/30 dark:bg-slate-900/20 dark:hover:bg-slate-900/30 text-white dark:text-slate-900 border-white/30 dark:border-slate-700 backdrop-blur-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(nextRes.code ?? "")
                    toast({
                      title: "✨ Código copiado",
                      description: "Tu código para el kiosko está listo para usar.",
                      duration: 3000,
                    })
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Copiar código: {nextRes.code}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-white/90 dark:text-slate-700 mb-3">No tienes reservas próximas</div>
                <div className="text-sm text-white/70 dark:text-slate-600">¡Reserva tu próxima carga en segundos!</div>
              </div>
            )}

            <Separator className="bg-white/20 dark:bg-slate-700" />

            {/* Información de límites */}
            <div className="text-xs text-white/70 dark:text-slate-600 text-center">
              Reservas esta semana: {weeklyReservations}/2 {isHost && "• Anfitrión habilitado"}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-12 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-slate-900/20 dark:hover:bg-slate-900/30 text-white dark:text-slate-900 border-white/30 dark:border-slate-700 backdrop-blur-sm"
                onClick={handleQuickBook}
                disabled={suspended || !reservationLimit.canReserve}
              >
                <Clock className="h-4 w-4 mr-2" />
                Reserva rápida
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-slate-900/10 dark:hover:bg-slate-900/20 text-white dark:text-slate-900 border-white/30 dark:border-slate-700 backdrop-blur-sm"
                onClick={handleQuickBook}
                disabled={suspended || !reservationLimit.canReserve}
              >
                <Zap className="h-4 w-4 mr-2" />
                Cargar ahora
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para diferentes funcionalidades */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="express">Express</TabsTrigger>
            {isHost && <TabsTrigger value="guests">Invitados</TabsTrigger>}
            <TabsTrigger value="account">Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 mt-4">
            {/* Estadísticas del usuario */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="rounded-2xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">{userStats.completed}</div>
                  <div className="text-xs text-green-600 dark:text-green-500">Cargas completadas</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{userStats.thisMonth}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-500">Este mes</div>
                </CardContent>
              </Card>
            </div>

            {/* Vehículo actual */}
            <Card className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  Mi vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                    <Car className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {currentVehicle?.make} {currentVehicle?.model}
                      {currentVehicle?.nickname && (
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                          "{currentVehicle.nickname}"
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {currentVehicle?.connectorType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        {currentVehicle?.batteryKWh} kWh
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {currentVehicle?.typicalChargeKW} kW
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulación de batería */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Batería estimada</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                  <div className="text-xs text-slate-500 dark:text-slate-400">~290 km de autonomía</div>
                </div>

                <select
                  className="w-full text-sm bg-background border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:border-slate-900 dark:focus:border-slate-100"
                  value={currentVehicleId}
                  onChange={(e) => setCurrentVehicle(e.target.value)}
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} {v.nickname ? `"${v.nickname}"` : ""}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Información del sitio */}
            <Card className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-emerald-800 dark:text-emerald-200">{site?.name}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {site?.renewablePercent}% energía renovable
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">Disponibles ahora</div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">12</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="express" className="mt-4">
            <ExpressCharge />
          </TabsContent>

          {isHost && (
            <TabsContent value="guests" className="mt-4">
              <GuestManagement />
            </TabsContent>
          )}

          <TabsContent value="account" className="mt-4">
            <SuspensionSystem userId={currentUserId} />
          </TabsContent>
        </Tabs>

        <QuickBookSheet open={openQB} onOpenChange={setOpenQB} />
      </div>
    </DriverShell>
  )
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
