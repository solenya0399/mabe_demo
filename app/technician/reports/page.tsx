"use client"

import { TechnicianShell } from "@/components/technician-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-store"
import { useMemo } from "react"
import { FileText, Download, TrendingUp, CheckCircle, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function TechnicianReportsPage() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const tickets = useAppStore((s) => s.tickets.filter((t) => t.siteId === siteId))
  const chargers = useAppStore((s) => s.chargers.filter((c) => c.siteId === siteId))

  // Estadísticas de tickets
  const ticketStats = useMemo(() => {
    const total = tickets.length
    const resolved = tickets.filter((t) => t.status === "resolved").length
    const open = tickets.filter((t) => t.status === "open").length
    const inProgress = tickets.filter((t) => t.status === "in_progress").length
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0

    return { total, resolved, open, inProgress, resolutionRate }
  }, [tickets])

  // Datos para gráficos (simulados)
  const weeklyTickets = useMemo(() => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    return days.map((day, index) => ({
      day,
      tickets: Math.floor(Math.random() * 5) + 1,
      resolved: Math.floor(Math.random() * 4) + 1,
    }))
  }, [])

  const chargerReliability = useMemo(() => {
    return chargers.map((charger, index) => ({
      name: `C${index + 1}`,
      uptime: Math.floor(Math.random() * 20) + 80, // 80-100%
      issues: Math.floor(Math.random() * 5),
    }))
  }, [chargers])

  const maintenanceMetrics = useMemo(() => {
    return {
      avgResolutionTime: "2.3 horas",
      preventiveMaintenance: 85, // %
      emergencyRepairs: 15, // %
      partsUsage: [
        { part: "Conectores", count: 12 },
        { part: "Pantallas", count: 8 },
        { part: "Cables", count: 15 },
        { part: "Sensores", count: 6 },
      ],
    }
  }, [])

  return (
    <TechnicianShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Reportes Técnicos</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Análisis de rendimiento y mantenimiento</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {ticketStats.resolutionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Tasa de resolución
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {maintenanceMetrics.avgResolutionTime}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Tiempo promedio
                  </div>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de tickets */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              Resumen de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{ticketStats.total}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{ticketStats.resolved}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Resueltos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{ticketStats.inProgress}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">En progreso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{ticketStats.open}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Abiertos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de tickets semanales */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tickets Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTickets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="tickets" fill="#ef4444" name="Nuevos" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="resolved" fill="#22c55e" name="Resueltos" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Confiabilidad de cargadores */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Confiabilidad de Cargadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chargerReliability}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="uptime" stroke="#0f172a" strokeWidth={2} name="Uptime %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Uso de repuestos */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Uso de Repuestos (Este Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceMetrics.partsUsage.map((part, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <span className="font-medium">{part.part}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{part.count} unidades</span>
                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-slate-900 dark:bg-slate-100 rounded-full"
                        style={{ width: `${(part.count / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de mantenimiento */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-xl bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {maintenanceMetrics.preventiveMaintenance}%
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-500">Mantenimiento preventivo</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {maintenanceMetrics.emergencyRepairs}%
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-500">Reparaciones de emergencia</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnicianShell>
  )
}
