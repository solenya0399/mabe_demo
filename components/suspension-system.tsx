"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-store"
import { AlertTriangle, Clock, XCircle, FileText, Shield } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function SuspensionSystem({ userId }: { userId: string }) {
  const suspension = useAppStore((s) => s.getUserSuspension(userId))
  const isAdmin = useAppStore((s) => ["Site Manager", "Admin-lite"].includes(s.ui.role))
  const clearSuspension = useAppStore((s) => s.clearUserSuspension)

  const suspensionProgress = useMemo(() => {
    if (!suspension) return 0
    return Math.min((suspension.totalPoints / 4) * 100, 100)
  }, [suspension])

  const timeRemaining = useMemo(() => {
    if (!suspension?.suspendedUntil) return null
    const remaining = new Date(suspension.suspendedUntil).getTime() - Date.now()
    if (remaining <= 0) return null

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return { days, hours }
  }, [suspension?.suspendedUntil])

  if (!suspension || suspension.totalPoints === 0) {
    return (
      <Card className="rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4 text-center">
          <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-green-800 dark:text-green-200 font-medium">Cuenta en buen estado</div>
          <div className="text-sm text-green-600 dark:text-green-400">Sin puntos de suspensión</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <Card
        className={`rounded-xl ${suspension.isActive ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20" : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {suspension.isActive ? (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Cuenta Suspendida
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Advertencia de Suspensión
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Puntos de suspensión</span>
              <span className="font-medium">{suspension.totalPoints}/4</span>
            </div>
            <Progress value={suspensionProgress} className="h-2" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {4 - suspension.totalPoints} puntos restantes antes de suspensión
            </div>
          </div>

          {suspension.isActive && timeRemaining && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  Suspendido por {timeRemaining.days} días y {timeRemaining.hours} horas más
                </span>
              </div>
            </div>
          )}

          {isAdmin && (
            <Button onClick={() => clearSuspension(userId)} variant="outline" className="w-full">
              Limpiar suspensión (Admin)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Historial de puntos */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            Historial de Infracciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suspension.history.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">No hay infracciones registradas</div>
            ) : (
              suspension.history
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{getInfractionLabel(point.type)}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {point.reason} • {new Date(point.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={point.points >= 2 ? "destructive" : "secondary"}>
                      +{point.points} punto{point.points !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getInfractionLabel(type: string): string {
  const labels = {
    cancellation: "Cancelación",
    overtime: "Tiempo excedido",
    user_report: "Reporte de usuario",
    no_show: "No se presentó",
  }
  return labels[type as keyof typeof labels] || type
}
