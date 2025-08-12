"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { addMinutesISO, roundNextQuarter, formatHourRange } from "@/lib/date"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Car, MapPin, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function BookingWizard() {
  const { toast } = useToast()
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const zonesAll = useAppStore((s) => s.zones)
  const baysAll = useAppStore((s) => s.bays)
  const vehicles = useAppStore((s) => s.vehicles)
  const currentUserId = useAppStore((s) => s.ui.currentUserId)
  const currentVehicleId = useAppStore((s) => s.ui.currentVehicleId)
  const setCurrentVehicle = useAppStore((s) => s.setCurrentVehicle)
  const bookReservation = useAppStore((s) => s.bookReservation)
  const confirmReservation = useAppStore((s) => s.confirmReservation)

  const zones = useMemo(() => zonesAll.filter((z) => z.siteId === siteId), [zonesAll, siteId])
  const bays = useMemo(() => baysAll.filter((b) => b.siteId === siteId), [baysAll, siteId])
  const myVehicles = useMemo(
    () => vehicles.filter((v) => !v.ownerUserId || v.ownerUserId === currentUserId),
    [vehicles, currentUserId],
  )

  // Paso 1: zona
  const [zoneId, setZoneId] = useState<string | undefined>(zones[0]?.id)
  // Paso 2: tiempo
  const defaultStart = roundNextQuarter()
  const [startLocal, setStartLocal] = useState(defaultStart.toISOString().slice(0, 16))
  const [duration, setDuration] = useState(60)
  // Paso 3: vehículo y SOC
  const [vehicleId, setVehicleId] = useState(currentVehicleId)
  const vehicle = useMemo(() => myVehicles.find((v) => v.id === vehicleId), [myVehicles, vehicleId])
  const [targetSoc, setTargetSoc] = useState(80)

  const suggested = useMemo(() => {
    const startISO = new Date(startLocal).toISOString()
    const endISO = addMinutesISO(startISO, duration)
    const candidates = bays.filter((b) => b.siteId === siteId && (!zoneId || b.zoneId === zoneId))
    const bay = candidates[0]
    if (!bay) return undefined
    return { startAt: startISO, endAt: endISO, bayId: bay.id, bayLabel: bay.label }
  }, [bays, siteId, zoneId, startLocal, duration])

  const canConfirm = !!(zoneId && vehicle && suggested)

  return (
    <div className="space-y-3">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Zona
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Label className="text-xs">Selecciona zona</Label>
          <Select value={zoneId} onValueChange={(v) => setZoneId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Zona" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Hora y duración
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Label className="text-xs">Inicio</Label>
          <Input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
          <Label className="text-xs">Duración</Label>
          <Select value={String(duration)} onValueChange={(v) => setDuration(Number.parseInt(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Duración" />
            </SelectTrigger>
            <SelectContent>
              {[30, 45, 60, 90, 120, 150, 180].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {suggested && (
            <div className="text-xs text-muted-foreground">
              Sugerencia: {formatHourRange(suggested.startAt, suggested.endAt)} · Bahía {suggested.bayLabel}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" /> Vehículo y objetivo
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Label className="text-xs">Vehículo</Label>
          <Select value={vehicleId} onValueChange={(v) => setVehicleId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona vehículo" />
            </SelectTrigger>
            <SelectContent>
              {myVehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.make} {v.model} {v.nickname ? `· ${v.nickname}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label className="text-xs">Objetivo SOC (%)</Label>
              <Input
                type="number"
                min={50}
                max={100}
                value={targetSoc}
                onChange={(e) => setTargetSoc(Number.parseInt(e.target.value || "80"))}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Conector</Label>
              <div className="flex gap-2">
                {["CCS1", "Type2", "NACS"].map((t) => (
                  <Badge key={t} variant={t === (vehicle?.connectorType ?? "Type2") ? "default" : "outline"}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setCurrentVehicle(vehicleId)}>
              Usar como actual
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" /> Resumen
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {suggested ? (
            <>
              <div className="text-sm">
                {vehicle?.make} {vehicle?.model} · SOC {targetSoc}% ·{" "}
                {formatHourRange(suggested.startAt, suggested.endAt)}
              </div>
              <div className="text-xs text-muted-foreground">Bahía {suggested.bayLabel}</div>
              <Button
                className="mt-1 h-11 rounded-xl"
                disabled={!canConfirm}
                onClick={() => {
                  if (!canConfirm || !zoneId) return
                  const id = bookReservation({
                    userId: currentUserId,
                    vehicleId: vehicleId,
                    siteId,
                    zoneId,
                    bayId: suggested.bayId,
                    connectorType: vehicle?.connectorType ?? "Type2",
                    startAt: suggested.startAt,
                    endAt: suggested.endAt,
                    targetSoc,
                    priority: "Employee",
                  })
                  confirmReservation(id)
                  toast({ title: "Reserva creada", description: "Tu reserva ha sido confirmada." })
                }}
              >
                Confirmar reserva
              </Button>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No hay bahías disponibles en la selección.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
