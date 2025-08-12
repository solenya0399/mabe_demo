"use client"

import { TechnicianShell } from "@/components/technician-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-store"
import { useMemo } from "react"
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  Activity,
  FileText,
  Calendar,
  MapPin,
} from "lucide-react"

export default function TechnicianPage() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const tickets = useAppStore((s) => s.tickets.filter((t) => t.siteId === siteId))
  const chargers = useAppStore((s) => s.chargers.filter((c) => c.siteId === siteId))
  const bays = useAppStore((s) => s.bays.filter((b) => b.siteId === siteId))

  // Estadísticas para técnicos
  const techStats = useMemo(() => {
    const faulted = chargers.filter((c) => c.status === "Faulted").length
    const maintenance = chargers.filter((c) => c.lastErrors.length > 0).length
    const openTickets = tickets.filter((t) => t.status === "open").length
    const inProgress = tickets.filter((t) => t.status === "in_progress").length

    return { faulted, maintenance, openTickets, inProgress }
  }, [chargers, tickets])

  return (
    <TechnicianShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Panel Técnico</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Mantenimiento y reparaciones</p>
          </div>
          <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20">
            <Wrench className="h-3 w-3 mr-1" />
            Técnico
          </Badge>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{techStats.faulted}</div>
              <div className="text-xs text-red-600 dark:text-red-500 flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Cargadores con falla
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{techStats.openTickets}</div>
              <div className="text-xs text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Tickets abiertos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets urgentes */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Tickets Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets
              .filter((t) => t.severity === "high")
              .map((ticket) => {
                const bay = bays.find((b) => b.id === ticket.bayId)
                const timeLeft = Math.max(
                  0,
                  Math.floor((new Date(ticket.slaDue).getTime() - Date.now()) / (1000 * 60 * 60)),
                )

                return (
                  <div
                    key={ticket.id}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-red-800 dark:text-red-200">{ticket.issueType}</div>
                      <Badge variant="destructive" className="text-xs">
                        {timeLeft}h restantes
                      </Badge>
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      Bahía {bay?.label} • Severidad: {ticket.severity}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Wrench className="h-3 w-3 mr-1" />
                        Atender
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        Detalles
                      </Button>
                    </div>
                  </div>
                )
              })}
            {tickets.filter((t) => t.severity === "high").length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                No hay tickets urgentes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de cargadores */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Estado de Cargadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chargers
              .filter((c) => c.status === "Faulted" || c.lastErrors.length > 0)
              .map((charger) => {
                const bay = bays.find((b) => b.id === charger.bayId)

                return (
                  <div
                    key={charger.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        Bahía {bay?.label} - {charger.model}
                      </div>
                      <Badge variant={charger.status === "Faulted" ? "destructive" : "secondary"}>
                        {charger.status === "Faulted" ? "Con falla" : "Mantenimiento"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {charger.powerKW} kW • {charger.protocol} • Firmware: {charger.firmware}
                    </div>
                    {charger.lastErrors.length > 0 && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Último error: {charger.lastErrors[0]}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Diagnosticar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Activity className="h-3 w-3 mr-1" />
                        Reiniciar
                      </Button>
                    </div>
                  </div>
                )
              })}
            {chargers.filter((c) => c.status === "Faulted" || c.lastErrors.length > 0).length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                Todos los cargadores funcionan correctamente
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mantenimiento programado */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Mantenimiento Programado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="font-medium text-purple-800 dark:text-purple-200">Inspección mensual</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Próxima: 15 de enero, 2024</div>
                <div className="text-xs text-purple-500 dark:text-purple-500 mt-1">
                  Revisión general de todos los cargadores AC
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-200">Actualización de firmware</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Programada: 20 de enero, 2024</div>
                <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">Cargadores DC a versión 3.3.0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TechnicianShell>
  )
}
