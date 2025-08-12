"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/use-store"
import { Zap, Clock, MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addMinutesISO } from "@/lib/date"

export function ExpressCharge() {
  const { toast } = useToast()
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const currentUserId = useAppStore((s) => s.ui.currentUserId)
  const bays = useAppStore((s) => s.bays.filter((b) => b.siteId === siteId))
  const reservations = useAppStore((s) => s.reservations)
  const sessions = useAppStore((s) => s.sessions)
  const isUserSuspended = useAppStore((s) => s.isUserSuspended)
  const startExpressCharge = useAppStore((s) => s.startExpressCharge)

  const [selectedBay, setSelectedBay] = useState<string | null>(null)

  // Verificar si el usuario está suspendido
  const suspended = useMemo(() => isUserSuspended(currentUserId), [isUserSuspended, currentUserId])

  // Calcular disponibilidad de bahías
  const bayAvailability = useMemo(() => {
    const now = new Date()
    const oneHourFromNow = addMinutesISO(now.toISOString(), 60)

    return bays.map((bay) => {
      // Verificar si hay sesión activa
      const activeSession = sessions.find((s) => s.bayId === bay.id && s.status === "active")
      if (activeSession) {
        return { ...bay, status: "occupied", availableMinutes: 0 }
      }

      // Verificar próximas reservas
      const nextReservation = reservations
        .filter((r) => r.bayId === bay.id && r.status === "confirmed")
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        .find((r) => new Date(r.startAt) > now)

      if (!nextReservation) {
        return { ...bay, status: "available", availableMinutes: 180 } // 3 horas máximo
      }

      const minutesUntilReservation = Math.floor(
        (new Date(nextReservation.startAt).getTime() - now.getTime()) / (1000 * 60),
      )

      if (minutesUntilReservation < 60) {
        return { ...bay, status: "reserved_soon", availableMinutes: 0 }
      }

      return {
        ...bay,
        status: "available",
        availableMinutes: Math.min(180, minutesUntilReservation - 15), // 15 min buffer
      }
    })
  }, [bays, sessions, reservations])

  const availableBays = bayAvailability.filter((bay) => bay.status === "available" && bay.availableMinutes >= 60)

  const handleStartExpress = (bayId: string) => {
    const bay = bayAvailability.find((b) => b.id === bayId)
    if (!bay) return

    const duration = Math.min(180, bay.availableMinutes) // Máximo 3 horas

    startExpressCharge({
      userId: currentUserId,
      siteId,
      bayId,
      duration,
    })

    toast({
      title: "Tiempo Express iniciado",
      description: `Tienes ${duration} minutos para cargar en bahía ${bay.label}`,
    })
  }

  if (suspended) {
    return (
      <Card className="rounded-2xl border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <div className="text-red-800 dark:text-red-200 font-medium">Acceso Restringido</div>
          <div className="text-sm text-red-700 dark:text-red-300 mt-1">
            Los usuarios con puntos de suspensión no pueden usar Tiempo Express
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Tiempo Express
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Carga inmediata sin reserva • Máximo 3 horas</p>
        </div>
        <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20">
          {availableBays.length} bahías disponibles
        </Badge>
      </div>

      {/* Información importante */}
      <Card className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <div className="font-medium mb-2">📋 Condiciones del Tiempo Express:</div>
            <ul className="space-y-1 text-xs">
              <li>• Solo disponible si hay mínimo 1 hora antes de la próxima reserva</li>
              <li>• Duración máxima: 3 horas (o hasta la próxima reserva)</li>
              <li>• No disponible para usuarios con puntos de suspensión</li>
              <li>• Puedes usar esta función múltiples veces</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Mapa de bahías */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Selecciona una bahía disponible</CardTitle>
        </CardHeader>
        <CardContent>
          {availableBays.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <div className="text-slate-600 dark:text-slate-400">No hay bahías disponibles</div>
              <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Todas las bahías están ocupadas o tienen reservas próximas
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bayAvailability.map((bay) => {
                const isAvailable = bay.status === "available" && bay.availableMinutes >= 60
                const isSelected = selectedBay === bay.id

                return (
                  <button
                    key={bay.id}
                    onClick={() => isAvailable && setSelectedBay(bay.id)}
                    disabled={!isAvailable}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${
                        isAvailable
                          ? isSelected
                            ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                            : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-300"
                          : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-50 cursor-not-allowed"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Bahía {bay.label}</span>
                      {isAvailable ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {bay.status === "occupied" && "Ocupada"}
                      {bay.status === "reserved_soon" && "Reserva próxima"}
                      {bay.status === "available" &&
                        bay.availableMinutes >= 60 &&
                        `${bay.availableMinutes} min disponibles`}
                      {bay.status === "available" && bay.availableMinutes < 60 && "Tiempo insuficiente"}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {selectedBay && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">Bahía {bayAvailability.find((b) => b.id === selectedBay)?.label}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Tiempo disponible: {bayAvailability.find((b) => b.id === selectedBay)?.availableMinutes} minutos
                  </div>
                </div>
                <MapPin className="h-5 w-5 text-slate-500" />
              </div>
              <Button
                onClick={() => handleStartExpress(selectedBay)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                Iniciar Tiempo Express
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
