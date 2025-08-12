"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-store"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatHourRange, addMinutesISO, roundNextQuarter } from "@/lib/date"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

export function QuickBookInline() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const zonesAll = useAppStore((s) => s.zones)
  const zones = useMemo(() => zonesAll.filter((z) => z.siteId === siteId), [zonesAll, siteId])

  const vehicleId = useAppStore((s) => s.ui.currentVehicleId)
  const vehicles = useAppStore((s) => s.vehicles)
  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicles, vehicleId])

  const confirmQuickBook = useAppStore((s) => s.quickBook)
  const bays = useAppStore((s) => s.bays)

  const [zoneId, setZone] = useState<string | undefined>(zones[0]?.id)
  const [connector, setConnector] = useState<string | undefined>(vehicle?.connectorType)
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
    <div className="grid gap-3">
      <div className="grid gap-1">
        <Label>Zone</Label>
        <Select value={zoneId} onValueChange={(v) => setZone(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select zone" />
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
        <Label>Connector</Label>
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
        <Label>Duration</Label>
        <Select onValueChange={(v) => setDuration(Number.parseInt(v))} value={String(duration)}>
          <SelectTrigger>
            <SelectValue placeholder="Duration" />
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
        <Label>Suggestion</Label>
        {suggested ? (
          <div className="text-sm">
            {formatHourRange(suggested.startAt, suggested.endAt)} · Bay {suggested.bayLabel}
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline">~ {vehicle?.typicalChargeKW ?? 7} kW</Badge>
              {throttled && (
                <Badge variant="destructive">
                  <Zap className="h-3 w-3 mr-1" /> Throttled
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Looking for a time slot…</div>
        )}
      </div>

      <Button
        disabled={!canConfirm}
        className="h-11 rounded-xl"
        onClick={() => {
          if (!suggested || !zoneId) return
          confirmQuickBook({
            zoneId,
            connectorType: (connector ?? vehicle?.connectorType ?? "Type2") as any,
            startAt: suggested.startAt,
            endAt: suggested.endAt,
            bayId: suggested.bayId,
          })
        }}
      >
        Confirm quick reservation
      </Button>
    </div>
  )
}
