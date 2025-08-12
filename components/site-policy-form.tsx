"use client"

import { useMemo, useState } from "react"
import { useAppStore, hasOpsPermission } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function SitePolicyForm() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const role = useAppStore((s) => s.ui.role)
  const policies = useAppStore((s) => s.energyPolicies)
  const updatePolicy = useAppStore((s) => s.updateEnergyPolicy)

  const p = useMemo(() => policies.find((pp) => pp.siteId === siteId), [policies, siteId])
  const [cap, setCap] = useState<number>(p?.capKW ?? 80)
  const [buffer, setBuffer] = useState<number>(p?.bufferMinutes ?? 5)
  const [grace, setGrace] = useState<number>(p?.graceMinutes ?? 10)
  const canEdit = hasOpsPermission(role)

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" /> Políticas de energía
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="grid gap-1">
            <Label>Cap (kW)</Label>
            <Input
              type="number"
              min={10}
              max={500}
              value={cap}
              onChange={(e) => setCap(Number.parseInt(e.target.value || "80"))}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-1">
            <Label>Buffer (min)</Label>
            <Input
              type="number"
              min={0}
              max={30}
              value={buffer}
              onChange={(e) => setBuffer(Number.parseInt(e.target.value || "5"))}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-1">
            <Label>Gracia (min)</Label>
            <Input
              type="number"
              min={0}
              max={30}
              value={grace}
              onChange={(e) => setGrace(Number.parseInt(e.target.value || "10"))}
              disabled={!canEdit}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => updatePolicy(siteId, { capKW: cap, bufferMinutes: buffer, graceMinutes: grace })}
            disabled={!canEdit}
          >
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
