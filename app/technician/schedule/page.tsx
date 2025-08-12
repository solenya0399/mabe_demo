"use client"

import { TechnicianShell } from "@/components/technician-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"
import { Calendar, Clock, MapPin, Wrench, AlertTriangle, CheckCircle, User } from "lucide-react"

export default function TechnicianSchedulePage() {
  // Agenda simulada para técnico
  const schedule = useMemo(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    return [
      {
        id: "task-1",
        date: today.toISOString().split("T")[0],
        time: "09:00",
        type: "Mantenimiento preventivo",
        location: "Bahía E01-E04",
        priority: "medium",
        duration: "2h",
        status: "scheduled",
        description: "Inspección mensual de cargadores AC",
      },
      {
        id: "task-2",
        date: today.toISOString().split("T")[0],
        time: "14:00",
        type: "Reparación urgente",
        location: "Bahía E12",
        priority: "high",
        duration: "1h",
        status: "in_progress",
        description: "Conector bloqueado - Ticket #T-2",
      },
      {
        id: "task-3",
        date: tomorrow.toISOString().split("T")[0],
        time: "10:00",
        type: "Actualización firmware",
        location: "Bahía E15-E18",
        priority: "medium",
        duration: "3h",
        status: "scheduled",
        description: "Actualizar cargadores DC a v3.3.0",
      },
      {
        id: "task-4",
        date: tomorrow.toISOString().split("T")[0],
        time: "15:30",
        type: "Inspección rutinaria",
        location: "Bahía E05-E08",
        priority: "low",
        duration: "1.5h",
        status: "scheduled",
        description: "Revisión trimestral de conectores",
      },
      {
        id: "task-5",
        date: dayAfter.toISOString().split("T")[0],
        time: "08:00",
        type: "Instalación",
        location: "Zona Norte",
        priority: "high",
        duration: "4h",
        status: "scheduled",
        description: "Instalación de nuevo cargador 150kW",
      },
    ]
  }, [])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: "Completado",
      in_progress: "En progreso",
      scheduled: "Programado",
    }
    return labels[status as keyof typeof labels] || status
  }

  // Agrupar por fecha
  const groupedSchedule = useMemo(() => {
    const groups: { [key: string]: typeof schedule } = {}
    schedule.forEach((task) => {
      if (!groups[task.date]) {
        groups[task.date] = []
      }
      groups[task.date].push(task)
    })
    return groups
  }, [schedule])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoy"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Mañana"
    } else {
      return date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    }
  }

  return (
    <TechnicianShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mi Agenda</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Tareas programadas y mantenimiento</p>
          </div>
          <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20">
            <User className="h-3 w-3 mr-1" />
            {schedule.length} tareas
          </Badge>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {schedule.filter((t) => t.status === "scheduled").length}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500">Programadas</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {schedule.filter((t) => t.status === "in_progress").length}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-500">En progreso</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {schedule.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">Completadas</div>
            </CardContent>
          </Card>
        </div>

        {/* Agenda por días */}
        <div className="space-y-4">
          {Object.entries(groupedSchedule)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, tasks]) => (
              <Card key={date} className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                    {formatDate(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((task) => (
                      <Card key={task.id} className={`rounded-lg ${getPriorityColor(task.priority)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span className="font-medium">{task.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {task.time}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.duration}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-sm mb-2">{task.description}</div>

                          <div className="flex items-center gap-2 text-sm mb-3">
                            <MapPin className="h-3 w-3" />
                            <span>{task.location}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {getStatusLabel(task.status)}
                            </Badge>
                            <div className="flex gap-2">
                              {task.status === "scheduled" && (
                                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
                                  <Wrench className="h-3 w-3 mr-1" />
                                  Iniciar
                                </Button>
                              )}
                              {task.status === "in_progress" && (
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completar
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                Detalles
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Mensaje si no hay tareas */}
        {schedule.length === 0 && (
          <Card className="rounded-xl">
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <div className="text-slate-600 dark:text-slate-400">No hay tareas programadas</div>
              <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">Tu agenda está libre</div>
            </CardContent>
          </Card>
        )}
      </div>
    </TechnicianShell>
  )
}
