"use client"

import { OpsShell } from "@/components/ops-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore, hasOpsPermission } from "@/store/use-store"
import { useMemo } from "react"
import { DollarSign, TrendingUp, Calculator, Download, Calendar, Zap } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function OpsCostsPage() {
  const role = useAppStore((s) => s.ui.role)
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const sessions = useAppStore((s) => s.sessions)
  const pricingPolicies = useAppStore((s) => s.pricingPolicies)

  const isManager = role === "Site Manager"

  // Filtrar sesiones por sitio una sola vez
  const siteSessions = useMemo(() => sessions.filter((s) => s.siteId === siteId), [sessions, siteId])

  // Obtener política de precios una sola vez
  const pricing = useMemo(() => pricingPolicies.find((p) => p.siteId === siteId), [pricingPolicies, siteId])

  // Análisis de costos - memoizado con dependencias específicas
  const costAnalysis = useMemo(() => {
    const completedSessions = siteSessions.filter((s) => s.status === "completed")
    const totalRevenue = completedSessions.reduce((sum, s) => sum + (s.cost || 0), 0)
    const totalKwh = completedSessions.reduce((sum, s) => sum + (s.kwh || 0), 0)
    const avgCostPerKwh = totalKwh > 0 ? totalRevenue / totalKwh : 0

    const now = new Date()
    const sessionsThisMonth = completedSessions.filter((s) => {
      const sessionDate = new Date(s.startAt)
      return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear()
    })
    const monthlyRevenue = sessionsThisMonth.reduce((sum, s) => sum + (s.cost || 0), 0)

    return {
      totalRevenue,
      totalKwh,
      avgCostPerKwh,
      monthlyRevenue,
      sessionsCount: completedSessions.length,
      monthlySessionsCount: sessionsThisMonth.length,
    }
  }, [siteSessions])

  // Datos para gráfico de ingresos diarios - memoizado
  const dailyRevenue = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const dayRevenue = siteSessions
        .filter((s) => s.status === "completed" && s.startAt.startsWith(date))
        .reduce((sum, s) => sum + (s.cost || 0), 0)
      return {
        date: new Date(date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        revenue: Number(dayRevenue.toFixed(2)),
      }
    })
  }, [siteSessions])

  // Desglose de costos - memoizado
  const costBreakdown = useMemo(() => {
    const energyCost = costAnalysis.totalRevenue * 0.7
    const idleFees = costAnalysis.totalRevenue * 0.2
    const other = costAnalysis.totalRevenue * 0.1

    return [
      { name: "Energía", value: energyCost, color: "#0f172a" },
      { name: "Idle Fees", value: idleFees, color: "#475569" },
      { name: "Otros", value: other, color: "#94a3b8" },
    ]
  }, [costAnalysis.totalRevenue])

  return (
    <OpsShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Análisis de Costos</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Ingresos y análisis financiero</p>
          </div>
          {isManager && (
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
          )}
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ${costAnalysis.totalRevenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Ingresos totales
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
                    ${costAnalysis.monthlyRevenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Este mes
                  </div>
                </div>
                <Calculator className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas adicionales para gerente */}
        {isManager && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-xl">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ${costAnalysis.avgCostPerKwh.toFixed(2)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Costo promedio/kWh</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {costAnalysis.totalKwh.toFixed(0)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">kWh totales</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{costAnalysis.sessionsCount}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Sesiones completadas</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de ingresos diarios */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-600" />
              Ingresos Últimos 7 Días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Ingresos"]}
                    labelStyle={{ color: "#0f172a" }}
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Desglose de costos - Solo para gerente */}
        {isManager && (
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-5 w-5 text-slate-600" />
                Desglose de Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-medium">${item.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuración de precios - Solo para gerente */}
        {isManager && pricing && (
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-slate-600" />
                Configuración de Precios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Moneda</div>
                  <div className="text-lg">{pricing.currency}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Cargo por idle (min)</div>
                  <div className="text-lg">${pricing.idleFeePerMinute}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tarifas por horario</div>
                <div className="space-y-2">
                  {pricing.tou.map((block, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <span className="text-sm">
                        {block.startHour}:00 - {block.endHour}:00
                      </span>
                      <Badge variant="outline">${block.price}/kWh</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje para roles sin permisos */}
        {!hasOpsPermission(role) && (
          <Card className="rounded-xl">
            <CardContent className="py-8 text-center">
              <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <div className="text-slate-600 dark:text-slate-400">Acceso limitado</div>
              <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Contacta al gerente para ver análisis detallados
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OpsShell>
  )
}
