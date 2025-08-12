"use client"

import { DriverShell } from "@/components/driver-shell"
import { useAppStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Circle, PlugZap } from "lucide-react"

export default function MapPage() {
  const chargers = useAppStore((s) => s.chargers)
  const bays = useAppStore((s) => s.bays)
  const zones = useAppStore((s) => s.zones)
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const siteChargers = chargers.filter((c) => c.siteId === siteId)

  return (
    <DriverShell>
      <div className="p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Vista del sitio</div>
        <div className="grid gap-2">
          {siteChargers.map((c) => {
            const bay = bays.find((b) => b.id === c.bayId)
            const zone = zones.find((z) => z.id === bay?.zoneId)
            return (
              <Card key={c.id} className="rounded-xl">
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>
                      {zone?.name} · {bay?.label}
                    </span>
                    <StatusDot status={c.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PlugZap className="h-4 w-4" />
                    <span>
                      {c.model} · {c.powerKW} kW · {c.protocol}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.connectors.map((cc) => (
                      <Badge key={cc.id} variant="outline">
                        {cc.type} {Math.min(cc.maxKW, c.powerKW)} kW
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DriverShell>
  )
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "Available"
      ? "text-emerald-500"
      : status === "InUse"
        ? "text-blue-500"
        : status === "Faulted"
          ? "text-red-500"
          : status === "Reserved"
            ? "text-amber-500"
            : "text-muted-foreground"
  return (
    <div className="flex items-center gap-2">
      <Circle className={`h-3 w-3 ${color}`} fill="currentColor" />
      <span className="text-xs text-muted-foreground">{label(status)}</span>
    </div>
  )
}
function label(s: string) {
  const map: Record<string, string> = {
    Available: "Disponible",
    InUse: "En uso",
    Faulted: "Fallo",
    Reserved: "Reservado",
    Unavailable: "No disponible",
  }
  return map[s] ?? s
}
