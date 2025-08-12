"use client"

import { TechnicianShell } from "@/components/technician-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-store"
import { useMemo, useState } from "react"
import { AlertTriangle, Clock, CheckCircle, User, MapPin, Wrench, FileText, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function TechnicianTicketsPage() {
  const { toast } = useToast()
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const tickets = useAppStore((s) => s.tickets.filter((t) => t.siteId === siteId))
  const bays = useAppStore((s) => s.bays.filter((b) => b.siteId === siteId))
  const chargers = useAppStore((s) => s.chargers.filter((c) => c.siteId === siteId))

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [workNotes, setWorkNotes] = useState("")

  // Separar tickets por estado
  const openTickets = useMemo(() => tickets.filter((t) => t.status === "open"), [tickets])
  const inProgressTickets = useMemo(() => tickets.filter((t) => t.status === "in_progress"), [tickets])
  const resolvedTickets = useMemo(() => tickets.filter((t) => t.status === "resolved"), [tickets])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getTimeRemaining = (slaDue: string) => {
    const now = Date.now()
    const due = new Date(slaDue).getTime()
    const diff = due - now
    const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
    return hours
  }

  const TicketCard = ({ ticket }: { ticket: any }) => {
    const bay = bays.find((b) => b.id === ticket.bayId)
    const charger = chargers.find((c) => c.id === ticket.chargerId)
    const timeLeft = getTimeRemaining(ticket.slaDue)
    const isUrgent = timeLeft < 2

    return (
      <Card className={`rounded-xl ${getSeverityColor(ticket.severity)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{ticket.issueType}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={ticket.severity === "high" ? "destructive" : "secondary"} className="text-xs">
                {ticket.severity.toUpperCase()}
              </Badge>
              {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Bahía {bay?.label}</span>
            <span className="text-slate-500">•</span>
            <span>{charger?.model}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>SLA: {timeLeft}h restantes</span>
            {isUrgent && <span className="text-red-600 font-medium">¡URGENTE!</span>}
          </div>

          <div className="flex gap-2 pt-2">
            {ticket.status === "open" && (
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => {
                  toast({ title: "Ticket asignado", description: "Has tomado este ticket." })
                }}
              >
                <User className="h-3 w-3 mr-1" />
                Tomar ticket
              </Button>
            )}
            {ticket.status === "in_progress" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast({ title: "Ticket resuelto", description: "Ticket marcado como resuelto." })
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolver
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket.id)}>
                  <FileText className="h-3 w-3 mr-1" />
                  Detalles
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ticket #{ticket.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Problema:</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{ticket.issueType}</div>
                  </div>
                  <div>
                    <div className="font-medium">Ubicación:</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Bahía {bay?.label} - {charger?.model}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Notas de trabajo:</div>
                    <Textarea
                      placeholder="Agregar notas sobre el trabajo realizado..."
                      value={workNotes}
                      onChange={(e) => setWorkNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      toast({ title: "Notas guardadas", description: "Se han actualizado las notas del ticket." })
                      setWorkNotes("")
                    }}
                  >
                    Guardar notas
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TechnicianShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sistema de Tickets</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Gestión de incidencias y reparaciones</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{openTickets.length}</div>
              <div className="text-xs text-red-600 dark:text-red-500">Abiertos</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{inProgressTickets.length}</div>
              <div className="text-xs text-amber-600 dark:text-amber-500">En progreso</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{resolvedTickets.length}</div>
              <div className="text-xs text-green-600 dark:text-green-500">Resueltos</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de tickets */}
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="open" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Abiertos ({openTickets.length})
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              En Progreso ({inProgressTickets.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resueltos ({resolvedTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-3 mt-4">
            {openTickets.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <div className="text-slate-600 dark:text-slate-400">No hay tickets abiertos</div>
                  <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">¡Excelente trabajo!</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {openTickets
                  .sort((a, b) => {
                    // Priorizar por severidad y tiempo restante
                    const severityOrder = { high: 3, medium: 2, low: 1 }
                    const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] || 0
                    const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] || 0
                    if (aSeverity !== bSeverity) return bSeverity - aSeverity
                    return getTimeRemaining(a.slaDue) - getTimeRemaining(b.slaDue)
                  })
                  .map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3 mt-4">
            {inProgressTickets.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center">
                  <Wrench className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <div className="text-slate-600 dark:text-slate-400">No hay tickets en progreso</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {inProgressTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-3 mt-4">
            {resolvedTickets.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <div className="text-slate-600 dark:text-slate-400">No hay tickets resueltos</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {resolvedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TechnicianShell>
  )
}
