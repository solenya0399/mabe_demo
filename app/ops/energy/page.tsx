"use client"

import { OpsShell } from "@/components/ops-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartEnergy } from "@/components/energy-dashboard"
import { useMemo } from "react"
import { useAppStore } from "@/store/use-store"
import { Gauge } from "lucide-react"

export default function OpsEnergyPage() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const dlmFn = useAppStore((s) => s.dlmForSite)
  const dlm = useMemo(() => dlmFn(siteId), [dlmFn, siteId])

  return (
    <OpsShell>
      <div className="p-4 space-y-3">
        <ChartEnergy />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">DLM · Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Site cap: {dlm.siteCapKW} kW · Sessions: {dlm.sessions.length}
            </div>
            <div className="grid gap-2">
              {dlm.sessions.map((s) => (
                <div key={s.sessionId} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    {s.userName} · {s.vehicle} · {s.bayLabel}
                  </span>
                  <Badge variant={s.assignedKW < s.maxKW ? "outline" : "default"}>{s.assignedKW} kW</Badge>
                </div>
              ))}
            </div>
            {dlm.throttledCount > 0 && (
              <div className="text-xs text-amber-600 flex items-center gap-2">
                <Gauge className="h-4 w-4" /> Throttled: {dlm.throttledCount}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OpsShell>
  )
}
