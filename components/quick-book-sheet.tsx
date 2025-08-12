"use client"

import { useMemo, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-store"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatHourRange, addMinutesISO, roundNextQuarter } from "@/lib/date"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

export function QuickBookSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const zonesAll = useAppStore((s) => s.zones)
  const zones = useMemo(() => zonesAll.filter((z) => z.siteId === siteId), [zonesAll, siteId])

  const vehicleId = useAppStore((s) => s.ui.currentVehicleId)
  const vehicles = useAppStore((s) => s.vehicles)
  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicles, vehicleId])

  const confirmQuickBook = useAppStore((s) => s.quickBook)
  const bays = useAppStore((s) => s.bays)

  const [zoneId, setZone] = useState<string | undefined>(undefined)
  const [connector, setConnector] = useState<string | undefined>(undefined)
  const [duration, setDuration] = useState(60)

  const suggested = useMemo(() => {
    const start = roundNextQuarter()
    const startISO = start.toISOString()
    const endISO = addMinutesISO(startISO, duration)
    const candidates = bays.filter((b) => b.siteId === siteId && (!zoneId || b.zoneId === zoneId))
    if (candidates.length === 0) return undefined
    const bay = candidates[0]
    return { startAt: startISO, endAt: endISO, bayId: bay.id, bayLabel: bay.label }
  }, [bays, siteId, zoneId, duration])

  const dlmFn = useAppStore((s) => s.dlmForSite)
  const dlm = useMemo(() => dlmFn(siteId), [dlmFn, siteId])
  const throttled = dlm.throttledCount > 0 || dlm.totalAssignedKW + (vehicle?.typicalChargeKW ?? 7) > dlm.siteCapKW

  const canConfirm = !!(zoneId && (connector ?? vehicle?.connectorType) && suggested)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Reserva rápida</SheetTitle>
        </SheetHeader>
        <div className="py-3 grid gap-3">
          <div className="grid gap-1">
            <Label>Zona</Label>
            <Select onValueChange={(v) => setZone(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona zona" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <Label>Conector</Label>
            <div className="grid grid-cols-3 gap-2">
              {["CCS1", "Type2", "NACS"].map((t) => (
                <Button
                  key={t}
                  variant={(connector ?? vehicle?.connectorType) === t ? "default" : "outline"}
                  onClick={() => setConnector(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Duración</Label>
            <Select onValueChange={(v) => setDuration(Number.parseInt(v))} defaultValue="60">
              <SelectTrigger>
                <SelectValue placeholder="Duración" />
              </SelectTrigger>
              <SelectContent>
                {[30, 45, 60, 90, 120].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <Label>Sugerencia</Label>
            {suggested ? (
              <div className="text-sm">
                {formatHourRange(suggested.startAt, suggested.endAt)} · Bahía {suggested.bayLabel}
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline">~ {vehicle?.typicalChargeKW ?? 7} kW</Badge>
                  {throttled && (
                    <Badge variant="destructive">
                      <Zap className="h-3 w-3 mr-1" /> Estrangulada
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Buscando hueco…</div>
            )}
          </div>

          <Button
            disabled={!canConfirm}
            className="h-12 rounded-xl"
            onClick={() => {
              if (!suggested || !zoneId) return
              confirmQuickBook({
                zoneId,
                connectorType: connector ?? vehicle?.connectorType ?? "Type2",
                startAt: suggested.startAt,
                endAt: suggested.endAt,
                bayId: suggested.bayId,
              })
              onOpenChange(false)
            }}
          >
            Confirmar reserva
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
