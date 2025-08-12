"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/store/use-store"
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function ChartEnergy() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const sessionsAll = useAppStore((s) => s.sessions)
  const energyPolicies = useAppStore((s) => s.energyPolicies)
  const sites = useAppStore((s) => s.sites)

  const sessionsActive = useMemo(
    () => sessionsAll.filter((x) => x.siteId === siteId && x.status === "active"),
    [sessionsAll, siteId],
  )
  const cap = useMemo(() => energyPolicies.find((p) => p.siteId === siteId)?.capKW ?? 80, [energyPolicies, siteId])
  const renewable = useMemo(() => sites.find((ss) => ss.id === siteId)?.renewablePercent ?? 35, [sites, siteId])

  const data = useMemo(() => {
    // Simulación simple: 12 puntos de 5 min
    return new Array(12).fill(0).map((_, i) => {
      const base = Math.max(0, sessionsActive.length * 10 + (i % 5) * 3)
      return { t: `${i * 5}m`, load: Math.min(base, cap), cap }
    })
  }, [sessionsActive.length, cap])

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Energía · Carga vs Cap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="t" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis hide />
              <Tooltip />
              <Area dataKey="cap" fill="hsl(var(--muted))" stroke="hsl(var(--muted-foreground))" fillOpacity={0.25} />
              <Area dataKey="load" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Renovable estimado: {renewable}%</div>
      </CardContent>
    </Card>
  )
}
