"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/store/use-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Camera, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserReportSystemProps {
  reservationId: string
  onReport?: () => void
  onCancel?: () => void
}

export function UserReportSystem({ reservationId, onReport, onCancel }: UserReportSystemProps) {
  const { toast } = useToast()
  const currentUserId = useAppStore((s) => s.ui.currentUserId)
  const submitUserReport = useAppStore((s) => s.submitUserReport)
  const cancelReservation = useAppStore((s) => s.cancelReservation)

  const [reportOpen, setReportOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reportData, setReportData] = useState({
    licensePlate: "",
    reason: "",
    photos: [] as string[],
  })
  const [cancelReason, setCancelReason] = useState("")

  const handleReport = () => {
    if (!reportData.licensePlate || !reportData.reason) {
      toast({
        title: "Campos requeridos",
        description: "Completa la placa y el motivo del reporte",
        variant: "destructive",
      })
      return
    }

    submitUserReport({
      reporterId: currentUserId,
      reportedLicensePlate: reportData.licensePlate,
      reservationId,
      type: "occupied_spot",
      reason: reportData.reason,
      photos: reportData.photos,
    })

    toast({
      title: "Reporte enviado",
      description: "Se ha reportado la ocupación indebida del espacio",
    })

    setReportOpen(false)
    setReportData({ licensePlate: "", reason: "", photos: [] })
    onReport?.()
  }

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Motivo requerido",
        description: "Debes especificar el motivo de la cancelación",
        variant: "destructive",
      })
      return
    }

    submitUserReport({
      reporterId: currentUserId,
      reportedLicensePlate: "",
      reservationId,
      type: "cancellation",
      reason: cancelReason,
    })

    cancelReservation(reservationId)

    toast({
      title: "Reserva cancelada",
      description: "Tu reserva ha sido cancelada. Se agregó 1 punto de suspensión.",
    })

    setCancelOpen(false)
    setCancelReason("")
    onCancel?.()
  }

  return (
    <div className="flex gap-2">
      {/* Botón de reporte */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 bg-transparent">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reportar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Ocupación Indebida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Solo reporta si alguien más está ocupando tu espacio asignado. El usuario
                reportado recibirá 1 punto de suspensión.
              </div>
            </div>

            <div className="space-y-2">
              <Label>Placa del vehículo que ocupa tu espacio *</Label>
              <Input
                value={reportData.licensePlate}
                onChange={(e) => setReportData((prev) => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                placeholder="ABC-123"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción de la situación *</Label>
              <Textarea
                value={reportData.reason}
                onChange={(e) => setReportData((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Describe brevemente lo que está ocurriendo..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Fotos de evidencia (opcional)</Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
                <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-600 dark:text-slate-400">Toca para agregar fotos del vehículo</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  (Funcionalidad de cámara pendiente)
                </div>
              </div>
            </div>

            <Button onClick={handleReport} className="w-full bg-red-600 hover:bg-red-700 text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Enviar Reporte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botón de cancelación */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 bg-transparent">
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-800 dark:text-red-200">
                <strong>Advertencia:</strong> Cancelar tu reserva agregará 1 punto de suspensión a tu cuenta. 2
                cancelaciones = 2 puntos de suspensión.
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo de la cancelación *</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Explica brevemente por qué necesitas cancelar..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setCancelOpen(false)} className="flex-1">
                Mantener reserva
              </Button>
              <Button onClick={handleCancel} variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Confirmar cancelación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
