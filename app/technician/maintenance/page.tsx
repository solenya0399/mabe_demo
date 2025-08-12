"use client"

import { TechnicianShell } from "@/components/technician-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-store"
import { useMemo } from "react"
import { Settings, Calendar, AlertTriangle, Wrench, Activity, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function TechnicianMaintenancePage() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const chargers = useAppStore((s) => s.chargers.filter((c) => c.siteId === siteId))
  const bays = useAppStore((s) => s.bays.filter((b) => b.siteId === siteId))

  // Mantenimiento programado (simulado)
  const scheduledMaintenance = useMemo(() => {
    return [
      {
        id: "maint-1",
        type: "Inspección mensual",
        description: "Revisión general de todos los cargadores AC",
        dueDate: "2024-01-15",
        priority: "medium",
        estimatedHours: 4,
        assignedChargers: chargers.filter((c) => c.powerKW <= 22).length,
      },
      {
        id: "maint-2",
        type: "Actualización firmware",
        description: "Actualizar cargadores DC a versión 3.3.0",
        dueDate: "2024-01-20",
        priority: "high",
        estimatedHours: 2,
        assignedChargers: chargers.filter((c) => c.powerKW > 22).length,
      },
      {
        id: "maint-3",
        type: "Limpieza profunda",
        description: "Limpieza de conectores y pantallas",
        dueDate: "2024-01-25",
        priority: "low",
        estimatedHours: 6,
        assignedChargers: chargers.length,
      },
    ]
  }, [chargers])

  // Estado de salud de cargadores
  const chargerHealth = useMemo(() => {
    return chargers.map((charger) => {
      const bay = bays.find((b) => b.id === charger.bayId)
      const healthScore = charger.status === "Available" ? 95 : charger.status === "Faulted" ? 25 : 75
      const lastMaintenance = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Último mes
      const nextMaintenance = new Date(lastMaintenance.getTime() + 90 * 24 * 60 * 60 * 1000) // +90 días

      return {
        ...charger,
        bayLabel: bay?.label || "N/A",
        healthScore,
        lastMaintenance: lastMaintenance.toLocaleDateString(),
        nextMaintenance: nextMaintenance.toLocaleDateString(),
        needsAttention: healthScore < 80 || charger.lastErrors.length > 0,
      }
    })
  }, [chargers, bays])

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
      default:
        return "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
    }
  }

  return (
    <TechnicianShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mantenimiento</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Programación y estado de equipos</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20">
            <Settings className="h-3 w-3 mr-1" />
            {chargers.length} cargadores
          </Badge>
        </div>

        {/* Resumen de salud */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {chargerHealth.filter((c) => c.healthScore >= 90).length}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">Excelente estado</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {chargerHealth.filter((c) => c.healthScore >= 70 && c.healthScore < 90).length}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-500">Requiere atención</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {chargerHealth.filter((c) => c.healthScore < 70).length}
              </div>
              <div className="text-xs text-red-600 dark:text-red-500">Estado crítico</div>
            </CardContent>
          </Card>
        </div>

        {/* Mantenimiento programado */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              Mantenimiento Programado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledMaintenance.map((maintenance) => (
              <Card key={maintenance.id} className={`rounded-lg ${getPriorityColor(maintenance.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{maintenance.type}</div>
                    <Badge variant="outline" className="text-xs">
                      {maintenance.dueDate}
                    </Badge>
                  </div>
                  <div className="text-sm mb-3">{maintenance.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span>{maintenance.assignedChargers} cargadores</span>
                    <span>{maintenance.estimatedHours}h estimadas</span>
                  </div>
                  <Button size="sm" className="mt-3 w-full bg-slate-900 hover:bg-slate-800 text-white">
                    <Wrench className="h-3 w-3 mr-1" />
                    Programar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Estado de cargadores */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-600" />
              Estado de Cargadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chargerHealth
              .sort((a, b) => a.healthScore - b.healthScore) // Mostrar primero los que necesitan atención
              .map((charger) => (
                <Card
                  key={charger.id}
                  className={`rounded-lg ${charger.needsAttention ? "border-amber-200 dark:border-amber-800" : "border-slate-200 dark:border-slate-700"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-slate-600" />
                        <span className="font-medium">Bahía {charger.bayLabel}</span>
                        <span className="text-sm text-slate-500">• {charger.model}</span>
                      </div>
                      {charger.needsAttention && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Estado de salud</span>
                        <span className={`font-medium ${getHealthColor(charger.healthScore)}`}>
                          {charger.healthScore}%
                        </span>
                      </div>
                      <Progress value={charger.healthScore} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        <div>Último mantenimiento:</div>
                        <div className="font-medium">{charger.lastMaintenance}</div>
                      </div>
                      <div>
                        <div>Próximo mantenimiento:</div>
                        <div className="font-medium">{charger.nextMaintenance}</div>
                      </div>
                    </div>

                    {charger.lastErrors.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Último error: {charger.lastErrors[0]}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Settings className="h-3 w-3 mr-1" />
                        Diagnosticar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Activity className="h-3 w-3 mr-1" />
                        Reiniciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
      </div>
    </TechnicianShell>
  )
}
