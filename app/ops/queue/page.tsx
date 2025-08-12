"use client"

import { OpsShell } from "@/components/ops-shell"
import { useMemo } from "react"
import { useAppStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function OpsQueuePage() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const queueAll = useAppStore((s) => s.queue)

  const queue = useMemo(() => queueAll.filter((q) => q.siteId === siteId), [queueAll, siteId])

  return (
    <OpsShell>
      <div className="p-4 space-y-3">
        <Card className="rounded-2xl">
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Queue</span>
              <Badge variant="outline">{queue.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid gap-2">
              {queue.map((q) => (
                <Card key={q.id} className="rounded-xl border-muted">
                  <CardContent className="py-3">
                    <div className="text-sm font-medium">{queueTitle(q.id)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Priority: {q.priority}</div>
                    <div className="mt-2">
                      <Button size="sm" disabled>
                        <Check className="h-4 w-4 mr-2" /> Assign next
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {queue.length === 0 && (
                <div className="text-sm text-muted-foreground px-2">No pending items in queue.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </OpsShell>
  )

  function queueTitle(queueId: string) {
    const q = useAppStore.getState().queue.find((x) => x.id === queueId)
    const u = useAppStore.getState().users.find((uu) => uu.id === q?.userId)
    const v = useAppStore.getState().vehicles.find((vv) => vv.id === q?.vehicleId)
    return `${u?.name ?? "Usuario"} · ${v ? v.make + " " + v.model : ""}`
  }
}
